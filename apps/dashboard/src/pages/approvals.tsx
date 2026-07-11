import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Check,
  X,
  ArrowUp,
  Pencil,
  Eye,
  UserPlus,
  Download,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from "lucide-react"
import { DataTable } from "../components/data-table"
import type { ColumnDef } from "../components/data-table"
import { RiskBadge } from "../components/risk-badge"
import { ChannelIcon } from "../components/channel-icon"
import { RiskDriverList } from "../components/risk-driver-list"
import { TreatmentTimeline } from "../components/treatment-timeline"
import { recommendations, historicalRecommendations } from "../data/mock-data"
import type { Recommendation, ApprovalStatus } from "../data/types"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OWNERS = ["J. Cruz", "M. Tan", "A. Lopez", "R. Dela Cruz", "S. Reyes"]

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  pending:      { label: "Pending",      className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  approved:     { label: "Approved",     className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected:     { label: "Rejected",     className: "bg-destructive/10 text-destructive border-destructive/20" },
  escalated:    { label: "Escalated",    className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  "auto-approved": { label: "Auto-Approved", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
}

const PRIORITY_CONFIG = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high:     { label: "High",     className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  medium:   { label: "Medium",   className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  low:      { label: "Low",      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

// Assign deterministic SLA, priority, autoApprovalEligible to recommendations that lack them
function enrichRec(rec: Recommendation, idx: number): Recommendation {
  const slaHours = [2, 4, 6, 8, 12, 18, 24, 36, 48]
  // When no explicit priority, derive from riskLevel but cap "critical" at "high"
  const derivedPriority = rec.account.riskLevel === "critical" ? "high" : rec.account.riskLevel
  return {
    ...rec,
    priority: rec.priority ?? derivedPriority,
    slaDeadline: rec.slaDeadline ?? new Date(Date.now() + slaHours[idx % slaHours.length] * 3_600_000).toISOString(),
    autoApprovalEligible: rec.autoApprovalEligible ?? (rec.account.riskLevel === "low" || rec.account.riskLevel === "medium"),
    owner: rec.owner ?? OWNERS[idx % OWNERS.length],
  }
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const ALL_RECS: Recommendation[] = [
  ...recommendations,
  ...historicalRecommendations,
].map(enrichRec).sort((a, b) => {
  const ap = PRIORITY_ORDER[(a.priority ?? "medium") as keyof typeof PRIORITY_ORDER] ?? 2
  const bp = PRIORITY_ORDER[(b.priority ?? "medium") as keyof typeof PRIORITY_ORDER] ?? 2
  return ap - bp
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slaHoursRemaining(deadline?: string): number | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.round(diff / 3_600_000)
}

function formatBalance(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

// ---------------------------------------------------------------------------
// Row expansion panel
// ---------------------------------------------------------------------------

function ExpansionPanel({ rec }: { rec: Recommendation }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">
      {/* Draft Message */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Draft Message</p>
        <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap border border-border/40">
          {rec.draftMessage}
        </div>
        {rec.reviewNotes && (
          <p className="text-xs text-muted-foreground italic mt-1">
            Note: {rec.reviewNotes}
          </p>
        )}
      </div>

      {/* Rationale + Risk Drivers */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rationale</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{rec.rationale}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Drivers</p>
          <RiskDriverList drivers={rec.account.riskDrivers} />
        </div>
      </div>

      {/* Treatment History */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Treatment History</p>
        <TreatmentTimeline treatments={rec.account.treatmentHistory} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApprovalsPage() {
  const [recs, setRecs] = useState<Recommendation[]>(ALL_RECS)
  const [selectedRows, setSelectedRows] = useState<Recommendation[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [autoApproveNotice, setAutoApproveNotice] = useState<number | null>(null)
  const [detailRec, setDetailRec] = useState<Recommendation | null>(null)

  // ---- Derived counts ----
  const counts = useMemo(() => ({
    critical: recs.filter((r) => r.priority === "critical").length,
    high:     recs.filter((r) => r.priority === "high").length,
    medium:   recs.filter((r) => r.priority === "medium").length,
    low:      recs.filter((r) => r.priority === "low").length,
    all:      recs.length,
    pending:  recs.filter((r) => r.status === "pending").length,
  }), [recs])

  // ---- Filtered rows for current tab ----
  const tabRows = useMemo(
    () => (activeTab === "all" ? recs : recs.filter((r) => r.priority === activeTab)),
    [recs, activeTab]
  )

  // ---- Status mutators ----
  function updateStatus(id: string, status: ApprovalStatus) {
    setRecs((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, reviewedBy: "J. Cruz", reviewedAt: new Date().toISOString() }
          : r
      )
    )
  }

  function bulkUpdateStatus(ids: string[], status: ApprovalStatus) {
    setRecs((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? { ...r, status, reviewedBy: "J. Cruz", reviewedAt: new Date().toISOString() }
          : r
      )
    )
    setSelectedRows([])
  }

  function assignOwner(owner: string) {
    const ids = selectedRows.map((r) => r.id)
    setRecs((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, owner } : r))
    )
    setSelectedRows([])
  }

  function handleAutoApprove() {
    const eligible = recs.filter(
      (r) => r.autoApprovalEligible && r.status === "pending"
    )
    if (eligible.length === 0) return
    const ids = eligible.map((r) => r.id)
    setRecs((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? { ...r, status: "auto-approved" as ApprovalStatus, reviewedBy: "System", reviewedAt: new Date().toISOString() }
          : r
      )
    )
    setAutoApproveNotice(eligible.length)
    setTimeout(() => setAutoApproveNotice(null), 4000)
  }

  function exportQueue() {
    const rows = tabRows
    const headers = ["ID", "Customer", "Account#", "Product", "Priority", "Status", "Channel", "Tone", "Owner", "Due Date", "Balance", "Risk Score"]
    const lines = rows.map((r) =>
      [
        r.id,
        r.account.customerName,
        r.account.accountNumber,
        r.account.product,
        r.priority ?? "",
        r.status,
        r.channel,
        r.messageTone,
        r.owner ?? "",
        r.account.dueDate,
        r.account.outstandingBalance,
        r.account.riskScore,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    const csv = [headers.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.setAttribute("download", "approvals-queue.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ---- Column definitions ----
  const columns: ColumnDef<Recommendation>[] = [
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      className: "w-24",
      render: (row) => {
        const p = row.priority ?? "medium"
        const cfg = PRIORITY_CONFIG[p as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium
        return (
          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <div className="min-w-[130px]">
          <p className="text-sm font-medium leading-tight">{row.account.customerName}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.account.accountNumber}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      sortable: true,
      render: (row) => (
        <span className="text-sm whitespace-nowrap">{row.account.product}</span>
      ),
    },
    {
      key: "daysUntilDue",
      header: "Days",
      sortable: true,
      className: "w-16 text-center",
      render: (row) => {
        const d = row.account.daysUntilDue
        const cls =
          d <= 3 ? "text-destructive font-bold" :
          d <= 7 ? "text-orange-600 font-semibold" :
          "text-muted-foreground"
        return <span className={`text-sm tabular-nums ${cls}`}>{d}d</span>
      },
    },
    {
      key: "outstandingBalance",
      header: "Balance",
      sortable: true,
      className: "text-right",
      render: (row) => (
        <span className="text-sm tabular-nums font-medium">
          {formatBalance(row.account.outstandingBalance)}
        </span>
      ),
    },
    {
      key: "riskLevel",
      header: "Risk",
      sortable: true,
      render: (row) => (
        <RiskBadge level={row.account.riskLevel} />
      ),
    },
    {
      key: "channel",
      header: "Treatment",
      sortable: true,
      render: (row) => {
        const isEscalated = row.status === "escalated" ||
          (row.rationale?.toLowerCase().includes("escalat") && row.account.riskLevel === "critical")
        if (isEscalated) {
          const team = row.account.riskScore >= 85 ? "Legal Team" : "Collections Team"
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-orange-600">Escalate</span>
              <span className="text-xs text-muted-foreground">{team}</span>
            </div>
          )
        }
        if (row.channel) {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-blue-600">Reach Out</span>
              <ChannelIcon channel={row.channel} showLabel />
            </div>
          )
        }
        return <span className="text-xs text-muted-foreground">No Action</span>
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status]
        return (
          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      key: "sla",
      header: "SLA",
      className: "w-20 text-center",
      render: (row) => {
        const hrs = slaHoursRemaining(row.slaDeadline)
        if (hrs === null) return <span className="text-xs text-muted-foreground">—</span>
        const isOverdue = hrs < 0
        const isUrgent = !isOverdue && hrs <= 4
        const cls = isOverdue
          ? "text-destructive font-bold"
          : isUrgent
          ? "text-orange-600 font-semibold"
          : "text-muted-foreground"
        return (
          <span className={`text-xs tabular-nums ${cls}`}>
            {isOverdue ? `−${Math.abs(hrs)}h` : `${hrs}h`}
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-40",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); setDetailRec(row) }}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                onClick={(e) => { e.stopPropagation(); updateStatus(row.id, "approved") }}
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); updateStatus(row.id, "rejected") }}
                title="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => { e.stopPropagation() }}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                onClick={(e) => { e.stopPropagation(); updateStatus(row.id, "escalated") }}
                title="Escalate"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const selectedIds = selectedRows.map((r) => r.id)

  return (
    <div className="flex flex-col gap-4 min-h-0">

      {/* Auto-approve toast notice */}
      {autoApproveNotice !== null && (
        <div className="flex items-center gap-2.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <Zap className="h-4 w-4 shrink-0" />
          <span>
            <strong>{autoApproveNotice}</strong> recommendation{autoApproveNotice !== 1 ? "s" : ""} auto-approved successfully.
          </span>
        </div>
      )}

      {/* KPI Mini-Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Pending */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending Approvals</p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold tabular-nums leading-none text-blue-600">{counts.pending}</p>
        </div>

        {/* Critical Pending */}
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Critical Pending</p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p className="text-4xl font-bold tabular-nums leading-none text-destructive">
            {recs.filter((r) => r.priority === "critical" && r.status === "pending").length}
          </p>
        </div>

        {/* Acceptance Rate */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acceptance Rate</p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-4xl font-bold tabular-nums leading-none text-emerald-600">79%</p>
        </div>

        {/* Approved Today */}
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approved Today</p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-4xl font-bold tabular-nums leading-none text-emerald-600">8</p>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-sm font-medium text-primary mr-1">
            {selectedRows.length} selected
          </span>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            size="sm"
            className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            onClick={() => bulkUpdateStatus(selectedIds, "approved")}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={() => bulkUpdateStatus(selectedIds, "rejected")}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs"
            onClick={() => bulkUpdateStatus(selectedIds, "escalated")}
          >
            <ArrowUp className="h-3.5 w-3.5 mr-1" />
            Escalate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="sm" variant="outline" className="h-7 text-xs" />}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Assign Owner
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {OWNERS.map((owner) => (
                <DropdownMenuItem key={owner} onClick={() => assignOwner(owner)}>
                  {owner}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={exportQueue}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Export Queue
          </Button>
        </div>
      )}

      {/* Tabs + Auto Approve */}
      <div className="flex items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            {(["all", "critical", "high", "medium", "low"] as const).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex items-center gap-1.5 px-3 text-xs capitalize">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <Badge
                  variant="secondary"
                  className="h-4 min-w-[18px] px-1 text-[10px] font-medium leading-none rounded-full"
                >
                  {counts[tab as keyof typeof counts]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs border-violet-500/30 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700"
          onClick={handleAutoApprove}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Auto Approve Eligible
        </Button>
      </div>

      {/* Data Table */}
      <div className="min-h-0 overflow-x-auto">
        <div className="min-w-[900px]">
          <DataTable
            columns={columns}
            data={tabRows as unknown as Record<string, unknown>[]}
            searchable
            searchPlaceholder="Search by customer, account, product…"
            pageSize={15}
            checkboxSelection
            onSelectionChange={(rows) => setSelectedRows(rows as unknown as Recommendation[])}
            stickyHeader
            exportFilename="approvals-queue"
          />
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailRec !== null} onOpenChange={(open) => { if (!open) setDetailRec(null) }}>
        <DialogContent className="w-full max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailRec?.account.customerName}
              <span className="text-sm font-normal text-muted-foreground font-mono">
                {detailRec?.account.accountNumber}
              </span>
            </DialogTitle>
          </DialogHeader>

          {detailRec && (
            <div className="flex flex-col gap-5 pt-1">

              {/* Meta row */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{detailRec.account.product}</Badge>
                <Badge variant="outline" className={STATUS_CONFIG[detailRec.status].className}>
                  {STATUS_CONFIG[detailRec.status].label}
                </Badge>
                <ChannelIcon channel={detailRec.channel} showLabel />
                <RiskBadge level={detailRec.account.riskLevel} />
              </div>

              {/* Draft Message */}
              {detailRec.draftMessage && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Draft Message</p>
                  <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                    {detailRec.draftMessage}
                  </div>
                </div>
              )}

              {/* Rationale */}
              {detailRec.rationale && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">AI Rationale</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{detailRec.rationale}</p>
                </div>
              )}

              {/* Treatment */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Treatment</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Channel</span>
                    <span className="font-medium capitalize">{detailRec.channel}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Tone</span>
                    <span className="font-medium capitalize">{detailRec.messageTone}</span>
                  </div>
                  {detailRec.treatmentType && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{detailRec.treatmentType}</span>
                    </div>
                  )}
                  {detailRec.owner && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Owner</span>
                      <span className="font-medium">{detailRec.owner}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Drivers */}
              {detailRec.account.riskDrivers?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Risk Drivers</p>
                  <RiskDriverList drivers={detailRec.account.riskDrivers} />
                </div>
              )}

              {/* Treatment History */}
              {detailRec.account.treatmentHistory?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Treatment History</p>
                  <TreatmentTimeline treatments={detailRec.account.treatmentHistory ?? []} />
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

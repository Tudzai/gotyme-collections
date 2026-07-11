import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const priorities = ["critical", "high", "medium", "low"] as const
  const slaHours = [2, 4, 6, 8, 12, 18, 24, 36, 48]
  return {
    ...rec,
    priority: rec.priority ?? priorities[idx % 4],
    slaDeadline: rec.slaDeadline ?? new Date(Date.now() + slaHours[idx % slaHours.length] * 3_600_000).toISOString(),
    autoApprovalEligible: rec.autoApprovalEligible ?? (rec.account.riskLevel === "low" || rec.account.riskLevel === "medium"),
    owner: rec.owner ?? OWNERS[idx % OWNERS.length],
  }
}

const ALL_RECS: Recommendation[] = [
  ...recommendations,
  ...historicalRecommendations,
].map(enrichRec)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slaHoursRemaining(deadline?: string): number | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.round(diff / 3_600_000)
}

function formatBalance(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₱${(n / 1_000).toFixed(0)}k`
  return `₱${n}`
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
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [autoApproveNotice, setAutoApproveNotice] = useState<number | null>(null)

  // ---- Derived counts ----
  const counts = useMemo(() => ({
    pending:        recs.filter((r) => r.status === "pending").length,
    approved:       recs.filter((r) => r.status === "approved").length,
    rejected:       recs.filter((r) => r.status === "rejected").length,
    escalated:      recs.filter((r) => r.status === "escalated").length,
    "auto-approved": recs.filter((r) => r.status === "auto-approved").length,
    all:            recs.length,
  }), [recs])

  // ---- Filtered rows for current tab ----
  const tabRows = useMemo(
    () => (activeTab === "all" ? recs : recs.filter((r) => r.status === activeTab)),
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
      header: "Channel",
      sortable: true,
      render: (row) => <ChannelIcon channel={row.channel} showLabel />,
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
      className: "w-32",
      render: (row) => {
        if (row.status !== "pending") return null
        return (
          <div className="flex items-center gap-1">
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
          </div>
        )
      },
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Pending */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">{counts.pending}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Pending Approvals</p>
          </div>
        </div>

        {/* Auto-Approval Eligible */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
            <Zap className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tabular-nums leading-none">
                {recs.filter((r) => r.autoApprovalEligible && r.status === "pending").length}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs border-violet-500/30 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700 shrink-0"
                onClick={handleAutoApprove}
              >
                <Zap className="h-3 w-3 mr-1" />
                Auto
              </Button>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Auto-Approval Eligible</p>
          </div>
        </div>

        {/* Critical Pending */}
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none text-destructive">
              {recs.filter((r) => r.priority === "critical" && r.status === "pending").length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Critical Pending</p>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">79%</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Acceptance Rate</p>
          </div>
        </div>

        {/* Approved Today */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">8</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Approved Today</p>
          </div>
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
            {(["pending", "approved", "rejected", "escalated", "auto-approved", "all"] as const).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex items-center gap-1.5 px-3 text-xs capitalize">
                {tab === "auto-approved" ? "Auto-Approved" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            rowExpansion={(row) => (
              <ExpansionPanel rec={row as unknown as Recommendation} />
            )}
          />
        </div>
      </div>
    </div>
  )
}

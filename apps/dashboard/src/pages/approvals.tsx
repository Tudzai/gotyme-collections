import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  MessageSquare,
} from "lucide-react"
import { DataTable } from "../components/data-table"
import type { ColumnDef } from "../components/data-table"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChangeStatus = "pending" | "approved" | "rejected"
type ChangeCategory = "risk_threshold" | "treatment_rule" | "auto_approval" | "channel_config" | "scoring_model"

interface SettingsChange {
  id: string
  category: ChangeCategory
  title: string
  description: string
  proposedBy: string
  proposedAt: string
  status: ChangeStatus
  severity: "high" | "medium" | "low"
  currentValue: string
  proposedValue: string
  rationale: string
  reviewedBy?: string
  reviewedAt?: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CHANGES: SettingsChange[] = [
  {
    id: "CHG001",
    category: "risk_threshold",
    title: "Lower Critical Risk Threshold",
    description: "Reduce critical risk score cutoff from 80 to 75 to capture more at-risk accounts earlier",
    proposedBy: "Anh Tu",
    proposedAt: "2026-07-07T08:00:00Z",
    status: "pending",
    severity: "high",
    currentValue: "Score ≥ 80",
    proposedValue: "Score ≥ 75",
    rationale: "Analysis shows 18% of accounts scoring 75-79 missed payments within 14 days. Earlier intervention improves cure rate by ~8pp.",
  },
  {
    id: "CHG002",
    category: "auto_approval",
    title: "Expand Auto-Approval Eligibility",
    description: "Allow auto-approval for High risk (not just Medium/Low) accounts with single missed payment",
    proposedBy: "Anh Tu",
    proposedAt: "2026-07-07T08:15:00Z",
    status: "pending",
    severity: "high",
    currentValue: "Risk ≤ Medium",
    proposedValue: "Risk ≤ High (1 missed payment only)",
    rationale: "Current backlog of 12 pending approvals is reducing time-to-treatment. High single-missed-payment cases have 73% cure rate with standard nudge.",
  },
  {
    id: "CHG003",
    category: "treatment_rule",
    title: "WhatsApp-First for Mortgage Accounts",
    description: "Change default channel for Mortgage product from Email to WhatsApp",
    proposedBy: "Mike",
    proposedAt: "2026-07-06T14:30:00Z",
    status: "pending",
    severity: "medium",
    currentValue: "Email (default)",
    proposedValue: "WhatsApp (default)",
    rationale: "WhatsApp shows 52% cure rate vs Email 31% for Mortgage segment in Q2 data.",
  },
  {
    id: "CHG004",
    category: "channel_config",
    title: "Increase SMS Daily Send Limit",
    description: "Raise maximum SMS sends per day from 500 to 800",
    proposedBy: "Anh Tu",
    proposedAt: "2026-07-06T11:00:00Z",
    status: "pending",
    severity: "medium",
    currentValue: "500 / day",
    proposedValue: "800 / day",
    rationale: "Current limit causes queuing on high-volume days (Mon/Fri), delaying time-sensitive messages by up to 4 hours.",
  },
  {
    id: "CHG005",
    category: "scoring_model",
    title: "Add Employment Status Feature",
    description: "Include employment_status field in risk scoring model v3.2",
    proposedBy: "Mike",
    proposedAt: "2026-07-05T10:00:00Z",
    status: "approved",
    severity: "high",
    currentValue: "Model v3.1 (12 features)",
    proposedValue: "Model v3.2 (13 features, +employment_status)",
    rationale: "Backtesting shows 4.2% AUC improvement. Employment status is strongest predictor of 30-day delinquency.",
    reviewedBy: "TDAT",
    reviewedAt: "2026-07-06T09:00:00Z",
  },
  {
    id: "CHG006",
    category: "treatment_rule",
    title: "Urgent Tone for 0-3 Day Due Window",
    description: "Switch all messages to 'urgent' tone when payment due ≤ 3 days (currently uses account risk-level tone)",
    proposedBy: "Anh Tu",
    proposedAt: "2026-07-05T16:00:00Z",
    status: "approved",
    severity: "medium",
    currentValue: "Tone = risk-level based",
    proposedValue: "Tone = urgent when daysUntilDue ≤ 3",
    rationale: "A/B test (n=240) showed 9pp higher payment completion rate with urgency cue for imminent-due accounts.",
    reviewedBy: "TDAT",
    reviewedAt: "2026-07-06T09:05:00Z",
  },
  {
    id: "CHG007",
    category: "risk_threshold",
    title: "Widen Medium Risk Band",
    description: "Adjust medium risk band from 26-50 to 31-60 to reduce false critical flags",
    proposedBy: "Mike",
    proposedAt: "2026-07-04T13:00:00Z",
    status: "rejected",
    severity: "high",
    currentValue: "Medium: 26-50",
    proposedValue: "Medium: 31-60",
    rationale: "Proposed to reduce ops workload on borderline cases.",
    reviewedBy: "TDAT",
    reviewedAt: "2026-07-05T10:00:00Z",
  },
  {
    id: "CHG008",
    category: "auto_approval",
    title: "Reduce Auto-Approval SLA from 2h to 1h",
    description: "Tighten auto-approval window for eligible actions from 2 hours to 1 hour",
    proposedBy: "Anh Tu",
    proposedAt: "2026-07-04T09:00:00Z",
    status: "rejected",
    severity: "low",
    currentValue: "2 hours",
    proposedValue: "1 hour",
    rationale: "Faster execution for time-sensitive accounts.",
    reviewedBy: "TDAT",
    reviewedAt: "2026-07-04T15:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ChangeStatus, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const SEVERITY_CONFIG = {
  high:   { label: "High",   className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  low:    { label: "Low",    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

const CATEGORY_LABELS: Record<ChangeCategory, string> = {
  risk_threshold: "Risk Threshold",
  treatment_rule: "Treatment Rule",
  auto_approval:  "Auto-Approval",
  channel_config: "Channel Config",
  scoring_model:  "Scoring Model",
}

const CATEGORY_ICONS: Record<ChangeCategory, React.ComponentType<{ className?: string }>> = {
  risk_threshold: ShieldAlert,
  treatment_rule: MessageSquare,
  auto_approval:  Settings2,
  channel_config: SlidersHorizontal,
  scoring_model:  Settings2,
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return "Just now"
}

// ---------------------------------------------------------------------------
// Row expansion panel
// ---------------------------------------------------------------------------

function ChangeDetail({ change }: { change: SettingsChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change Detail</p>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Current value</span>
            <p className="font-medium text-foreground">{change.currentValue}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Proposed value</span>
            <p className="font-medium text-primary">{change.proposedValue}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rationale</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{change.rationale}</p>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metadata</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Proposed by: <span className="text-foreground font-medium">{change.proposedBy}</span></p>
          <p>Proposed: <span className="text-foreground">{formatRelative(change.proposedAt)}</span></p>
          {change.reviewedBy && (
            <>
              <p>Reviewed by: <span className="text-foreground font-medium">{change.reviewedBy}</span></p>
              <p>Reviewed: <span className="text-foreground">{formatRelative(change.reviewedAt!)}</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApprovalsPage() {
  const [changes, setChanges] = useState<SettingsChange[]>(MOCK_CHANGES)
  const [selectedRows, setSelectedRows] = useState<SettingsChange[]>([])
  const [activeTab, setActiveTab] = useState<string>("pending")

  const counts = useMemo(() => ({
    pending:  changes.filter((c) => c.status === "pending").length,
    approved: changes.filter((c) => c.status === "approved").length,
    rejected: changes.filter((c) => c.status === "rejected").length,
    all:      changes.length,
  }), [changes])

  const tabRows = useMemo(
    () => (activeTab === "all" ? changes : changes.filter((c) => c.status === activeTab)),
    [changes, activeTab]
  )

  function updateStatus(id: string, status: ChangeStatus) {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status, reviewedBy: "TDAT", reviewedAt: new Date().toISOString() }
          : c
      )
    )
  }

  function bulkUpdateStatus(ids: string[], status: ChangeStatus) {
    setChanges((prev) =>
      prev.map((c) =>
        ids.includes(c.id)
          ? { ...c, status, reviewedBy: "TDAT", reviewedAt: new Date().toISOString() }
          : c
      )
    )
    setSelectedRows([])
  }

  const selectedIds = selectedRows.map((c) => c.id)

  const columns: ColumnDef<SettingsChange>[] = [
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (row) => {
        const Icon = CATEGORY_ICONS[row.category]
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[row.category]}</span>
          </div>
        )
      },
    },
    {
      key: "title",
      header: "Change",
      sortable: true,
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="text-sm font-medium leading-tight">{row.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: "currentValue",
      header: "Current",
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{row.currentValue}</span>
      ),
    },
    {
      key: "proposedValue",
      header: "Proposed",
      render: (row) => (
        <span className="text-xs font-medium text-primary whitespace-nowrap">{row.proposedValue}</span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (row) => {
        const cfg = SEVERITY_CONFIG[row.severity]
        return (
          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      key: "proposedBy",
      header: "Proposed By",
      sortable: true,
      render: (row) => (
        <span className="text-sm whitespace-nowrap">{row.proposedBy}</span>
      ),
    },
    {
      key: "proposedAt",
      header: "Proposed",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelative(row.proposedAt)}</span>
      ),
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
      key: "actions",
      header: "",
      className: "w-20",
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
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4 min-h-0">

      {/* KPI Mini-Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">{counts.pending}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Pending Review</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none text-destructive">
              {changes.filter((c) => c.severity === "high" && c.status === "pending").length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">High Severity</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">{counts.approved}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Approved</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none">{counts.all}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Total Changes</p>
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
            Approve All
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={() => bulkUpdateStatus(selectedIds, "rejected")}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject All
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex items-center gap-1.5 px-3 text-xs capitalize">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <Badge
                  variant="secondary"
                  className="h-4 min-w-[18px] px-1 text-[10px] font-medium leading-none rounded-full"
                >
                  {counts[tab]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Data Table */}
      <div className="min-h-0 overflow-x-auto">
        <div className="min-w-[800px]">
          <DataTable
            columns={columns}
            data={tabRows as unknown as Record<string, unknown>[]}
            searchable
            searchPlaceholder="Search changes…"
            pageSize={15}
            checkboxSelection
            onSelectionChange={(rows) => setSelectedRows(rows as unknown as SettingsChange[])}
            stickyHeader
            exportFilename="settings-changes"
            rowExpansion={(row) => (
              <ChangeDetail change={row as unknown as SettingsChange} />
            )}
          />
        </div>
      </div>
    </div>
  )
}

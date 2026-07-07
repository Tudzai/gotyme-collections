import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DataTable } from "../components/data-table"
import type { ColumnDef } from "../components/data-table"
import { RiskBadge } from "../components/risk-badge"
import { ChannelIcon } from "../components/channel-icon"
import { RiskDriverList } from "../components/risk-driver-list"
import { accounts, recommendations } from "../data/mock-data"
import type { Account, RiskLevel, Channel } from "../data/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPHP(value: number): string {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`
  return `₱${value.toLocaleString()}`
}

function formatPHPFull(value: number): string {
  return `₱${value.toLocaleString()}`
}

function getRecommendedChannel(accountId: string): Channel | null {
  const rec = recommendations.find(r => r.accountId === accountId)
  return rec ? rec.channel : null
}

function getTreatmentStatus(accountId: string): string {
  const rec = recommendations.find(r => r.accountId === accountId)
  if (!rec) return "no-action"
  return rec.status
}

function dueColor(days: number): string {
  if (days <= 7) return "text-red-600 font-semibold"
  if (days <= 14) return "text-orange-600 font-medium"
  return "text-foreground"
}

const treatmentStatusConfig: Record<string, { label: string; className: string }> = {
  pending:       { label: "Pending",      className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  approved:      { label: "Approved",     className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected:      { label: "Rejected",     className: "bg-red-500/10 text-red-600 border-red-500/20" },
  escalated:     { label: "Escalated",    className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  "auto-approved":{ label: "Auto-Approved", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "no-action":   { label: "No Action",    className: "bg-muted text-muted-foreground" },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PortfolioPageProps {
  onViewAccount: (accountId: string) => void
}

export function PortfolioPage({ onViewAccount }: PortfolioPageProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const owners = useMemo(() => {
    const set = new Set(accounts.map(a => a.owner).filter(Boolean) as string[])
    return Array.from(set)
  }, [])

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      if (search) {
        const q = search.toLowerCase()
        if (!a.customerName.toLowerCase().includes(q) && !a.accountNumber.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== "all" && getTreatmentStatus(a.id) !== statusFilter) return false
      if (ownerFilter !== "all" && a.owner !== ownerFilter) return false
      return true
    })
  }, [search, statusFilter, ownerFilter])

  type EnrichedAccount = Account & { recommendedChannel: Channel | null; treatmentStatus: string }

  const enrichedAccounts: EnrichedAccount[] = useMemo(
    () => filteredAccounts.map(a => ({ ...a, recommendedChannel: getRecommendedChannel(a.id), treatmentStatus: getTreatmentStatus(a.id) })),
    [filteredAccounts]
  )

  const totalExposure = accounts.filter(a => a.riskLevel === "critical" || a.riskLevel === "high").reduce((s, a) => s + a.outstandingBalance, 0)
  const avgRiskScore = Math.round(accounts.reduce((s, a) => s + a.riskScore, 0) / accounts.length)

  const columns: ColumnDef<EnrichedAccount>[] = [
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: row => (
        <div className="min-w-[160px]">
          <p className="font-medium whitespace-nowrap">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.accountNumber}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      sortable: true,
      render: row => <span className="whitespace-nowrap text-sm">{row.product}</span>,
    },
    {
      key: "outstandingBalance",
      header: "Outstanding",
      sortable: true,
      render: row => <span className="font-mono text-sm whitespace-nowrap">{formatPHPFull(row.outstandingBalance)}</span>,
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: row => <span className="text-sm whitespace-nowrap">{row.dueDate}</span>,
    },
    {
      key: "daysUntilDue",
      header: "Days",
      sortable: true,
      render: row => <span className={`text-sm tabular-nums whitespace-nowrap ${dueColor(row.daysUntilDue)}`}>{row.daysUntilDue}d</span>,
    },
    {
      key: "riskScore",
      header: "Risk Score",
      sortable: true,
      render: row => (
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className="font-mono text-sm w-7 shrink-0">{row.riskScore}</span>
          <Progress value={row.riskScore} className="h-1.5 w-14" />
        </div>
      ),
    },
    {
      key: "riskLevel",
      header: "Level",
      sortable: true,
      render: row => <RiskBadge level={row.riskLevel as RiskLevel} />,
    },
    {
      key: "riskDrivers",
      header: "Main Risk Driver",
      render: row => (
        <span className="text-sm max-w-[160px] block truncate">{row.riskDrivers[0]?.factor ?? "—"}</span>
      ),
    },
    {
      key: "recommendedChannel",
      header: "Channel",
      render: row => row.recommendedChannel
        ? <ChannelIcon channel={row.recommendedChannel as Channel} showLabel />
        : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      key: "treatmentStatus",
      header: "Treatment",
      sortable: true,
      render: row => {
        const cfg = treatmentStatusConfig[row.treatmentStatus] ?? treatmentStatusConfig["no-action"]
        return <Badge variant="outline" className={`whitespace-nowrap text-xs ${cfg.className}`}>{cfg.label}</Badge>
      },
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: row => <span className="text-sm text-muted-foreground whitespace-nowrap">{row.owner ?? "—"}</span>,
    },
    {
      key: "id",
      header: "",
      render: row => (
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onViewAccount(row.id) }} className="gap-1.5 whitespace-nowrap">
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-4 text-sm px-0.5">
        <span className="font-semibold text-foreground">{filteredAccounts.length} of 312 Accounts</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-amber-600 font-medium">47 At-Risk</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-red-600 font-medium">6 Critical</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-foreground">{formatPHP(totalExposure)} Exposure</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-foreground">Avg Risk {avgRiskScore}</span>
      </div>

      {/* Search + Filters toggle */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer or account…"
              className="pl-9 h-9"
            />
          </div>

          <CollapsibleTrigger
            render={<Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" />}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>

          <span className="text-sm text-muted-foreground ml-auto">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <CollapsibleContent>
          <div className="mt-2 flex flex-wrap items-end gap-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Treatment Status</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="auto-approved">Auto-Approved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="no-action">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Owner</span>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs self-end"
              onClick={() => { setSearch(""); setStatusFilter("all"); setOwnerFilter("all") }}
            >
              Reset
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <div className="min-w-[900px]">
          <DataTable<EnrichedAccount>
            columns={columns}
            data={enrichedAccounts}
            searchable={false}
            stickyHeader
            pageSize={25}
            exportFilename="portfolio-accounts"
            rowExpansion={row => (
              <div className="space-y-2 py-1">
                <p className="text-sm font-medium text-muted-foreground">Risk Drivers</p>
                <RiskDriverList drivers={row.riskDrivers} />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
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
  Users,
  AlertTriangle,
  Flame,
  DollarSign,
  BarChart2,
  Search,
  Eye,
} from "lucide-react"
import { GlobalFilters } from "../components/global-filters"
import { DataTable } from "../components/data-table"
import type { ColumnDef } from "../components/data-table"
import { RiskBadge } from "../components/risk-badge"
import { ChannelIcon } from "../components/channel-icon"
import { RiskDriverList } from "../components/risk-driver-list"
import { accounts, recommendations } from "../data/mock-data"
import { useMobile } from "../hooks/use-mobile"
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

/** Derive recommended channel for an account from the recommendations list */
function getRecommendedChannel(accountId: string): Channel | null {
  const rec = recommendations.find((r) => r.accountId === accountId)
  return rec ? rec.channel : null
}

/** Derive treatment status from recommendations */
function getTreatmentStatus(accountId: string): string {
  const rec = recommendations.find((r) => r.accountId === accountId)
  if (!rec) return "no-action"
  return rec.status
}

function dueColor(days: number): string {
  if (days <= 7) return "text-destructive font-semibold"
  if (days <= 14) return "text-orange-600 font-medium"
  return "text-foreground"
}

const treatmentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  escalated: { label: "Escalated", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  "auto-approved": { label: "Auto-Approved", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "no-action": { label: "No Action", className: "bg-muted text-muted-foreground" },
}

// ---------------------------------------------------------------------------
// KPI Mini Card
// ---------------------------------------------------------------------------

interface KpiMiniCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  valueClassName?: string
}

function KpiMiniCard({ label, value, icon, valueClassName }: KpiMiniCardProps) {
  return (
    <Card className="flex-1 min-w-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className={`text-xl font-bold tabular-nums mt-0.5 ${valueClassName ?? ""}`}>
            {value}
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">{icon}</div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Mobile Account Card
// ---------------------------------------------------------------------------

interface AccountCardProps {
  account: Account
  onView: (id: string) => void
}

function AccountCard({ account, onView }: AccountCardProps) {
  const channel = getRecommendedChannel(account.id)
  const treatStatus = getTreatmentStatus(account.id)
  const statusCfg = treatmentStatusConfig[treatStatus] ?? treatmentStatusConfig["no-action"]

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold truncate">{account.customerName}</p>
          <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
        </div>
        <RiskBadge level={account.riskLevel} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Product</span>
          <p className="font-medium">{account.product}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Outstanding</span>
          <p className="font-mono font-medium">{formatPHPFull(account.outstandingBalance)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Monthly PMT</span>
          <p className="font-mono font-medium">{formatPHPFull(account.monthlyPayment)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Due Date</span>
          <p className="font-medium">{account.dueDate}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Days Until Due</span>
          <p className={dueColor(account.daysUntilDue)}>{account.daysUntilDue}d</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Risk Score</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm">{account.riskScore}</span>
            <Progress value={account.riskScore} className="h-1.5 w-16" />
          </div>
        </div>
      </div>

      {account.riskDrivers.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Main Risk Driver</span>
          <p className="text-sm mt-0.5 truncate">{account.riskDrivers[0].factor}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {channel && <ChannelIcon channel={channel} showLabel />}
          <Badge variant="outline" className={statusCfg.className}>
            {statusCfg.label}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(account.id)}
          className="gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PortfolioPageProps {
  onViewAccount: (accountId: string) => void
}

export function PortfolioPage({ onViewAccount }: PortfolioPageProps) {
  const isMobile = useMobile()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")

  // Derive unique owners from accounts
  const owners = useMemo(() => {
    const set = new Set(accounts.map((a) => a.owner).filter(Boolean) as string[])
    return Array.from(set)
  }, [])

  // Filter accounts for mobile view (DataTable handles its own search internally)
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !a.customerName.toLowerCase().includes(q) &&
          !a.accountNumber.toLowerCase().includes(q)
        )
          return false
      }
      if (statusFilter !== "all") {
        const status = getTreatmentStatus(a.id)
        if (status !== statusFilter) return false
      }
      if (ownerFilter !== "all" && a.owner !== ownerFilter) return false
      return true
    })
  }, [search, statusFilter, ownerFilter])

  // Enrich accounts with derived fields for table
  type EnrichedAccount = Account & {
    recommendedChannel: Channel | null
    treatmentStatus: string
  }

  const enrichedAccounts: EnrichedAccount[] = useMemo(
    () =>
      filteredAccounts.map((a) => ({
        ...a,
        recommendedChannel: getRecommendedChannel(a.id),
        treatmentStatus: getTreatmentStatus(a.id),
      })),
    [filteredAccounts]
  )

  // ------------------------------------------------------------------
  // Column definitions (must be inside component to use JSX in render)
  // ------------------------------------------------------------------
  const columns: ColumnDef<EnrichedAccount>[] = [
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium whitespace-nowrap">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.accountNumber}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      sortable: true,
      render: (row) => (
        <span className="whitespace-nowrap text-sm">{row.product}</span>
      ),
    },
    {
      key: "outstandingBalance",
      header: "Outstanding",
      sortable: true,
      className: "text-right",
      render: (row) => (
        <span className="font-mono text-sm whitespace-nowrap">
          {formatPHPFull(row.outstandingBalance)}
        </span>
      ),
    },
    {
      key: "monthlyPayment",
      header: "Monthly PMT",
      sortable: true,
      className: "text-right",
      render: (row) => (
        <span className="font-mono text-sm whitespace-nowrap">
          {formatPHPFull(row.monthlyPayment)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (row) => (
        <span className="text-sm whitespace-nowrap">{row.dueDate}</span>
      ),
    },
    {
      key: "daysUntilDue",
      header: "Days",
      sortable: true,
      render: (row) => (
        <span className={`text-sm tabular-nums ${dueColor(row.daysUntilDue)}`}>
          {row.daysUntilDue}d
        </span>
      ),
    },
    {
      key: "riskScore",
      header: "Risk Score",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm w-6 shrink-0">{row.riskScore}</span>
          <Progress value={row.riskScore} className="h-1.5 w-14" />
        </div>
      ),
    },
    {
      key: "riskLevel",
      header: "Level",
      sortable: true,
      render: (row) => <RiskBadge level={row.riskLevel as RiskLevel} />,
    },
    {
      key: "riskDrivers",
      header: "Main Risk Driver",
      render: (row) => (
        <span className="text-sm max-w-[160px] block truncate">
          {row.riskDrivers[0]?.factor ?? "—"}
        </span>
      ),
    },
    {
      key: "recommendedChannel",
      header: "Channel",
      render: (row) =>
        row.recommendedChannel ? (
          <ChannelIcon channel={row.recommendedChannel as Channel} showLabel />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "treatmentStatus",
      header: "Treatment",
      render: (row) => {
        const cfg =
          treatmentStatusConfig[row.treatmentStatus] ??
          treatmentStatusConfig["no-action"]
        return (
          <Badge variant="outline" className={`whitespace-nowrap ${cfg.className}`}>
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.owner ?? "—"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onViewAccount(row.id)
          }}
          className="gap-1.5 whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ]

  // ------------------------------------------------------------------
  // KPI values (from portfolioMetrics + derived)
  // ------------------------------------------------------------------
  const totalExposure = accounts
    .filter((a) => a.riskLevel === "critical" || a.riskLevel === "high")
    .reduce((sum, a) => sum + a.outstandingBalance, 0)

  const avgRiskScore = Math.round(
    accounts.reduce((sum, a) => sum + a.riskScore, 0) / accounts.length
  )

  return (
    <div className="space-y-4">
      {/* Global Filters */}
      <GlobalFilters />

      {/* KPI mini-cards */}
      <div className="flex flex-wrap gap-3">
        <KpiMiniCard
          label="Total Accounts"
          value={312}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiMiniCard
          label="At-Risk"
          value={47}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          valueClassName="text-yellow-600"
        />
        <KpiMiniCard
          label="Critical"
          value={6}
          icon={<Flame className="h-5 w-5 text-destructive" />}
          valueClassName="text-destructive"
        />
        <KpiMiniCard
          label="Exposure at Risk"
          value={formatPHP(totalExposure)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiMiniCard
          label="Avg Risk Score"
          value={avgRiskScore}
          icon={<BarChart2 className="h-5 w-5" />}
        />
      </div>

      {/* Search + column filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or account..."
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Treatment Status" />
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

        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filteredAccounts.length} accounts
        </span>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      {isMobile ? (
        <div className="space-y-3">
          {enrichedAccounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No accounts found.</p>
          ) : (
            enrichedAccounts.map((a) => (
              <AccountCard key={a.id} account={a} onView={onViewAccount} />
            ))
          )}
        </div>
      ) : (
        <DataTable<EnrichedAccount>
          columns={columns}
          data={enrichedAccounts}
          searchable={false}
          stickyHeader
          pageSize={25}
          exportFilename="portfolio-accounts"
          rowExpansion={(row) => (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Risk Drivers</p>
              <RiskDriverList drivers={row.riskDrivers} />
            </div>
          )}
        />
      )}
    </div>
  )
}

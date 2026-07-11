import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle, Search, X, LayoutDashboard,
} from 'lucide-react'
import { RiskBadge } from '../../components/risk-badge'
import type { DemoAccount, ApprovalStatus } from './data'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPHP(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function formatDueDate(_daysUntilDue: number, dueDate: string): string {
  const d = new Date(dueDate)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function dueDateClass(days: number): string {
  if (days <= 3) return 'text-red-600 font-semibold'
  if (days <= 7) return 'text-orange-500 font-medium'
  return 'text-foreground'
}

const treatmentLabels: Record<string, string> = {
  sms: 'SMS',
  email: 'Email',
  push: 'Push Notification',
  call: 'Phone Call',
  whatsapp: 'WhatsApp',
  escalate: 'Escalate',
}

const treatmentColors: Record<string, string> = {
  sms: 'bg-blue-100 text-blue-700',
  email: 'bg-indigo-100 text-indigo-700',
  push: 'bg-purple-100 text-purple-700',
  call: 'bg-orange-100 text-orange-700',
  whatsapp: 'bg-green-100 text-green-700',
  escalate: 'bg-red-100 text-red-700',
}

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  'auto-approved': { label: 'Auto-Approved', className: 'bg-emerald-100 text-emerald-700' },
  escalated: { label: 'Escalated', className: 'bg-violet-100 text-violet-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PortfolioViewProps {
  accounts: DemoAccount[]
  statuses: Record<string, ApprovalStatus>
  onViewReason: (id: string) => void
  onGoToDashboard: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PortfolioView({ accounts, statuses, onViewReason, onGoToDashboard }: PortfolioViewProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? accounts.filter(a =>
        a.customerName.toLowerCase().includes(query.toLowerCase()) ||
        a.product.toLowerCase().includes(query.toLowerCase())
      )
    : accounts

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          {/* GoTyme logo area */}
          <div className="flex items-center gap-2 mr-4">
            <div className="h-7 w-7 rounded bg-[#f97316] flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="font-semibold text-sm">GoTyme Collections</span>
          </div>

          <nav className="flex items-center gap-1 text-sm">
            <Button variant="default" size="sm" className="h-8 px-3">
              Portfolio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-1.5"
              onClick={onGoToDashboard}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search customer…"
                className="pl-9 h-8 w-56 text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">At-Risk Portfolio</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} account{filtered.length !== 1 ? 's' : ''} · Agent-monitored, early-warning active
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            {accounts.filter(a => a.earlyWarning).length} early warnings
          </Badge>
        </div>

        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Warning</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Top Driver</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                    No accounts match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(account => {
                  const status = statuses[account.id] ?? account.defaultStatus
                  const statusCfg = statusConfig[status]
                  return (
                    <TableRow
                      key={account.id}
                      className={account.id === 'ALEX' || account.id === 'JAMIE' ? 'bg-muted/10' : ''}
                    >
                      <TableCell className="font-medium">{account.customerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{account.product}</TableCell>
                      <TableCell className="text-sm font-mono">{formatPHP(account.outstandingBalance)}</TableCell>
                      <TableCell className={`text-sm ${dueDateClass(account.daysUntilDue)}`}>
                        {formatDueDate(account.daysUntilDue, account.dueDate)}
                        <span className="ml-1 text-xs opacity-70">({account.daysUntilDue}d)</span>
                      </TableCell>
                      <TableCell>
                        {account.earlyWarning ? (
                          <Badge className="gap-1 bg-orange-100 text-orange-700 border-orange-200 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            Early Warning
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-semibold ${
                          account.riskScore >= 80 ? 'text-red-600'
                          : account.riskScore >= 60 ? 'text-orange-500'
                          : account.riskScore >= 40 ? 'text-amber-500'
                          : 'text-emerald-600'
                        }`}>
                          {account.riskScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={account.riskLevel as any} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {account.topRiskDriver}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${treatmentColors[account.treatment]}`}>
                          {treatmentLabels[account.treatment]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(status === 'pending' || account.id === 'ALEX' || account.id === 'JAMIE') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => onViewReason(account.id)}
                          >
                            View Reason
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

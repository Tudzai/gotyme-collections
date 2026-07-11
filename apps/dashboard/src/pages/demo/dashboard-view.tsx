import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  LayoutDashboard, Users, AlertTriangle, Clock, CheckCircle,
  TrendingUp, DollarSign, Target, Zap, ChevronLeft, Bot,
} from 'lucide-react'
import { dashboardOverview, dashboardOutcome } from './data'

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color?: string
}

function StatCard({ title, value, sub, icon, color = 'text-foreground' }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
      <div className={`mt-0.5 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{title}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Risk breakdown mini-bar
// ---------------------------------------------------------------------------

function RiskBreakdownCard() {
  const { riskBreakdown, totalAccounts } = dashboardOverview
  const bands = [
    { label: 'Critical', count: riskBreakdown.critical, color: '#ef4444' },
    { label: 'High',     count: riskBreakdown.high,     color: '#f97316' },
    { label: 'Medium',   count: riskBreakdown.medium,   color: '#f59e0b' },
    { label: 'Low',      count: riskBreakdown.low,      color: '#10b981' },
  ]

  return (
    <div className="rounded-lg border bg-card p-4 col-span-2">
      <div className="text-xs text-muted-foreground mb-3">Risk Distribution</div>
      <div className="flex items-end gap-2 h-16">
        {bands.map(b => (
          <div key={b.label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm"
              style={{
                height: `${(b.count / totalAccounts) * 100 * 0.6 + 12}px`,
                backgroundColor: b.color,
                opacity: 0.85,
              }}
            />
            <span className="text-xs font-semibold" style={{ color: b.color }}>{b.count}</span>
            <span className="text-[10px] text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Channel effectiveness chart
// ---------------------------------------------------------------------------

function ChannelEffectivenessChart() {
  const data = dashboardOutcome.channelEffectiveness

  const colors: Record<string, string> = {
    SMS: '#3b82f6',
    Email: '#8b5cf6',
    WhatsApp: '#10b981',
    Push: '#f59e0b',
    Call: '#f97316',
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm font-medium mb-1">Channel Effectiveness</div>
      <div className="text-xs text-muted-foreground mb-4">Cure rate by outreach channel (%)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="channel" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Cure Rate']}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="cureRate" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.channel} fill={colors[entry.channel] ?? '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent Proposal Card
// ---------------------------------------------------------------------------

function AgentProposalCard() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">Agent Improvement Proposal</span>
        <Badge className="ml-auto bg-blue-100 text-blue-700 border-blue-200 text-xs">Pending Approval</Badge>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span>Risk Matrix: <span className="font-medium">1 proposed change</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span>Treatment Matrix: <span className="font-medium">2 proposed changes</span></span>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        Agent learned from last cycle's outcomes. All changes require human approval before taking effect.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard View
// ---------------------------------------------------------------------------

interface DashboardViewProps {
  onGoToPortfolio: () => void
}

export function DashboardView({ onGoToPortfolio }: DashboardViewProps) {
  const [tab, setTab] = useState<'overview' | 'outcome'>('overview')
  const ov = dashboardOverview
  const out = dashboardOutcome

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <div className="h-7 w-7 rounded bg-[#f97316] flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="font-semibold text-sm">GoTyme Collections</span>
          </div>

          <nav className="flex items-center gap-1 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-1.5"
              onClick={onGoToPortfolio}
            >
              <ChevronLeft className="h-4 w-4" />
              Portfolio
            </Button>
            <Button variant="default" size="sm" className="h-8 px-3 gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="mb-5">
          <h1 className="text-lg font-semibold">Collections Dashboard</h1>
          <p className="text-sm text-muted-foreground">Agent performance · Current cycle</p>
        </div>

        <Tabs value={tab} onValueChange={v => setTab(v as 'overview' | 'outcome')}>
          <TabsList className="mb-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outcome">Outcomes</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <StatCard
                title="Total Accounts"
                value={ov.totalAccounts}
                sub="Under agent monitoring"
                icon={<Users className="h-5 w-5" />}
                color="text-foreground"
              />
              <StatCard
                title="Early-Warning"
                value={ov.earlyWarning}
                sub={`${Math.round((ov.earlyWarning / ov.totalAccounts) * 100)}% of portfolio`}
                icon={<AlertTriangle className="h-5 w-5" />}
                color="text-orange-500"
              />
              <StatCard
                title="Pending Approvals"
                value={ov.pendingApprovals}
                sub="Awaiting human review"
                icon={<Clock className="h-5 w-5" />}
                color="text-yellow-500"
              />
              <StatCard
                title="Escalated Cases"
                value={ov.escalatedCases}
                sub="Transferred to team"
                icon={<Users className="h-5 w-5" />}
                color="text-violet-500"
              />
              <StatCard
                title="Auto-Approved Today"
                value={ov.autoApprovedToday}
                sub="Low-risk outreach"
                icon={<CheckCircle className="h-5 w-5" />}
                color="text-emerald-500"
              />
              <RiskBreakdownCard />
            </div>

            <AgentProposalCard />
          </TabsContent>

          {/* ── Outcomes ── */}
          <TabsContent value="outcome">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <StatCard
                title="Cure Rate"
                value={`${out.cureRate}%`}
                sub="Accounts paid after outreach"
                icon={<TrendingUp className="h-5 w-5" />}
                color="text-emerald-600"
              />
              <StatCard
                title="Early-Warning Recall"
                value={`${out.earlyWarningRecall}%`}
                sub="Late accounts caught early"
                icon={<Target className="h-5 w-5" />}
                color="text-blue-600"
              />
              <StatCard
                title="Response Rate"
                value={`${out.responseRate}%`}
                sub="Responded to outreach"
                icon={<Zap className="h-5 w-5" />}
                color="text-amber-500"
              />
              <StatCard
                title="Cost-to-Collect"
                value={`₱${out.costToCollect.toFixed(2)}`}
                sub="Avg per account"
                icon={<DollarSign className="h-5 w-5" />}
                color="text-emerald-600"
              />
            </div>

            <ChannelEffectivenessChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

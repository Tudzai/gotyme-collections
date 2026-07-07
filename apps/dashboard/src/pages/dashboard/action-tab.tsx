import React from 'react'
import {
  Clock,
  AlertCircle,
  ThumbsUp,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
  Tooltip,
} from "recharts"
import { KpiCard } from "../../components/kpi-card"
import { RiskBadge } from "../../components/risk-badge"
import type { KpiData, ActionItem, ApprovalStatus, Channel } from "../../data/types"

// ─── Local mock data ────────────────────────────────────────────────────────

const kpiSparkData = {
  pendingApprovals: [
    { date: "Jan", value: 8 }, { date: "Feb", value: 7 }, { date: "Mar", value: 9 },
    { date: "Apr", value: 10 }, { date: "May", value: 11 }, { date: "Jun", value: 10 },
    { date: "Jul", value: 12 },
  ],
  criticalActionsToday: [
    { date: "Jan", value: 7 }, { date: "Feb", value: 6 }, { date: "Mar", value: 8 },
    { date: "Apr", value: 5 }, { date: "May", value: 6 }, { date: "Jun", value: 4 },
    { date: "Jul", value: 3 },
  ],
  acceptanceRate: [
    { date: "Jan", value: 68 }, { date: "Feb", value: 70 }, { date: "Mar", value: 72 },
    { date: "Apr", value: 74 }, { date: "May", value: 75 }, { date: "Jun", value: 76 },
    { date: "Jul", value: 79 },
  ],
  completedToday: [
    { date: "Jan", value: 4 }, { date: "Feb", value: 5 }, { date: "Mar", value: 6 },
    { date: "Apr", value: 7 }, { date: "May", value: 6 }, { date: "Jun", value: 7 },
    { date: "Jul", value: 8 },
  ],
  autoApprovalEligible: [
    { date: "Jan", value: 2 }, { date: "Feb", value: 2 }, { date: "Mar", value: 3 },
    { date: "Apr", value: 3 }, { date: "May", value: 4 }, { date: "Jun", value: 4 },
    { date: "Jul", value: 5 },
  ],
}

const kpis: KpiData[] = [
  { value: 12,    mom: 20.0,  yoy: 5.2,   spark: kpiSparkData.pendingApprovals,     status: "warning"  },
  { value: 3,     mom: -25.0, yoy: -40.0, spark: kpiSparkData.criticalActionsToday, status: "positive" },
  { value: "79%", mom: 3.8,   yoy: 12.1,  spark: kpiSparkData.acceptanceRate,       status: "positive" },
  { value: 8,     mom: 14.3,  yoy: 33.3,  spark: kpiSparkData.completedToday,       status: "positive" },
  { value: 5,     mom: 25.0,  yoy: 66.7,  spark: kpiSparkData.autoApprovalEligible, status: "neutral"  },
]

// Derived action items from recommendations (extend with action-specific fields)
const actionItems: ActionItem[] = [
  {
    id: "ACT001", actionId: "REC001",
    customerName: "Maria Santos",    accountNumber: "GTB-2024-001847", product: "Personal Loan",
    riskScore: 87, riskLevel: "critical", priority: "critical",
    recommendedAction: "Send empathetic WhatsApp nudge",
    channel: "whatsapp", messageTone: "empathetic",
    approvalStatus: "pending", owner: "J. Cruz",
    createdAt: "2026-07-06T09:15:00Z", dueAt: "2026-07-07T17:00:00Z",
    actionStatus: "pending", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T09:15:00Z",
  },
  {
    id: "ACT002", actionId: "REC002",
    customerName: "Jose Reyes",      accountNumber: "GTB-2024-003291", product: "Credit Card",
    riskScore: 92, riskLevel: "critical", priority: "critical",
    recommendedAction: "Formal outbound call — restructuring offer",
    channel: "call", messageTone: "formal",
    approvalStatus: "pending", owner: "M. Tan",
    createdAt: "2026-07-06T09:20:00Z", dueAt: "2026-07-07T12:00:00Z",
    actionStatus: "overdue", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T11:00:00Z",
  },
  {
    id: "ACT003", actionId: "REC003",
    customerName: "Isabella Ramos",  accountNumber: "GTB-2024-013790", product: "Credit Card",
    riskScore: 82, riskLevel: "critical", priority: "critical",
    recommendedAction: "Urgent WhatsApp with payment link",
    channel: "whatsapp", messageTone: "urgent",
    approvalStatus: "pending", owner: "A. Lopez",
    createdAt: "2026-07-06T09:25:00Z", dueAt: "2026-07-07T17:00:00Z",
    actionStatus: "pending", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T09:25:00Z",
  },
  {
    id: "ACT004", actionId: "REC004",
    customerName: "Lucia Fernandez", accountNumber: "GTB-2024-021989", product: "Personal Loan",
    riskScore: 79, riskLevel: "critical", priority: "high",
    recommendedAction: "Empathetic email — hardship options",
    channel: "email", messageTone: "empathetic",
    approvalStatus: "approved", owner: "J. Cruz",
    createdAt: "2026-07-06T09:30:00Z", dueAt: "2026-07-08T17:00:00Z",
    completedAt: "2026-07-06T14:10:00Z",
    actionStatus: "completed", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T14:10:00Z",
  },
  {
    id: "ACT005", actionId: "REC005",
    customerName: "Gabriel Santos",  accountNumber: "GTB-2024-042867", product: "Personal Loan",
    riskScore: 85, riskLevel: "critical", priority: "critical",
    recommendedAction: "Priority outbound call — escalation path",
    channel: "call", messageTone: "urgent",
    approvalStatus: "pending", owner: "R. Santos",
    createdAt: "2026-07-06T09:35:00Z", dueAt: "2026-07-07T10:00:00Z",
    actionStatus: "overdue", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T09:35:00Z",
  },
  {
    id: "ACT006", actionId: "REC006",
    customerName: "Teresa Magsaysay",accountNumber: "GTB-2024-054467", product: "Personal Loan",
    riskScore: 76, riskLevel: "critical", priority: "high",
    recommendedAction: "Empathetic SMS — offer help",
    channel: "sms", messageTone: "empathetic",
    approvalStatus: "auto-approved", owner: "M. Tan",
    createdAt: "2026-07-06T09:40:00Z", dueAt: "2026-07-09T17:00:00Z",
    completedAt: "2026-07-06T13:00:00Z",
    actionStatus: "completed", autoApprovalEligible: true,
    lastUpdated: "2026-07-06T13:00:00Z",
  },
  {
    id: "ACT007", actionId: "REC007",
    customerName: "Ana Garcia",      accountNumber: "GTB-2024-005612", product: "Personal Loan",
    riskScore: 74, riskLevel: "high", priority: "high",
    recommendedAction: "Push notification — pay or set auto-debit",
    channel: "push", messageTone: "formal",
    approvalStatus: "auto-approved", owner: "A. Lopez",
    createdAt: "2026-07-06T09:45:00Z", dueAt: "2026-07-10T17:00:00Z",
    completedAt: "2026-07-06T10:30:00Z",
    actionStatus: "completed", autoApprovalEligible: true,
    lastUpdated: "2026-07-06T10:30:00Z",
  },
  {
    id: "ACT008", actionId: "REC008",
    customerName: "Angela Rivera",   accountNumber: "GTB-2024-035901", product: "Personal Loan",
    riskScore: 71, riskLevel: "high", priority: "high",
    recommendedAction: "Formal SMS reminder — multi-debt flag",
    channel: "sms", messageTone: "formal",
    approvalStatus: "pending", owner: "J. Cruz",
    createdAt: "2026-07-06T09:50:00Z", dueAt: "2026-07-08T17:00:00Z",
    actionStatus: "in_progress", autoApprovalEligible: true,
    lastUpdated: "2026-07-06T15:20:00Z",
  },
  {
    id: "ACT009", actionId: "REC009",
    customerName: "Carlos Dela Cruz",accountNumber: "GTB-2024-007834", product: "Mortgage",
    riskScore: 68, riskLevel: "high", priority: "medium",
    recommendedAction: "Empathetic email — payment date options",
    channel: "email", messageTone: "empathetic",
    approvalStatus: "pending", owner: "M. Tan",
    createdAt: "2026-07-06T09:55:00Z", dueAt: "2026-07-10T17:00:00Z",
    actionStatus: "pending", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T09:55:00Z",
  },
  {
    id: "ACT010", actionId: "REC010",
    customerName: "Patricia Lim",    accountNumber: "GTB-2024-009156", product: "Credit Card",
    riskScore: 61, riskLevel: "high", priority: "medium",
    recommendedAction: "Push notification — pay in full prompt",
    channel: "push", messageTone: "formal",
    approvalStatus: "auto-approved", owner: "A. Lopez",
    createdAt: "2026-07-06T10:00:00Z", dueAt: "2026-07-11T17:00:00Z",
    completedAt: "2026-07-06T11:15:00Z",
    actionStatus: "completed", autoApprovalEligible: true,
    lastUpdated: "2026-07-06T11:15:00Z",
  },
  {
    id: "ACT011", actionId: "REC011",
    customerName: "Fernando Gomez",  accountNumber: "GTB-2024-038223", product: "Credit Card",
    riskScore: 65, riskLevel: "high", priority: "high",
    recommendedAction: "WhatsApp — restore credit framing",
    channel: "whatsapp", messageTone: "formal",
    approvalStatus: "pending", owner: "R. Santos",
    createdAt: "2026-07-06T10:05:00Z", dueAt: "2026-07-09T17:00:00Z",
    actionStatus: "pending", autoApprovalEligible: false,
    lastUpdated: "2026-07-06T10:05:00Z",
  },
  {
    id: "ACT012", actionId: "REC012",
    customerName: "Miguel Torres",   accountNumber: "GTB-2024-011478", product: "Personal Loan",
    riskScore: 55, riskLevel: "high", priority: "medium",
    recommendedAction: "Friendly push — seasonal pattern pre-empt",
    channel: "push", messageTone: "empathetic",
    approvalStatus: "auto-approved", owner: "M. Tan",
    createdAt: "2026-07-06T10:10:00Z", dueAt: "2026-07-12T17:00:00Z",
    completedAt: "2026-07-06T12:45:00Z",
    actionStatus: "completed", autoApprovalEligible: true,
    lastUpdated: "2026-07-06T12:45:00Z",
  },
]

// ─── Chart data ──────────────────────────────────────────────────────────────

const funnelData = [
  { stage: "Scored",           count: 312 },
  { stage: "Recommended",      count: 20  },
  { stage: "Pending Approval", count: 12  },
  { stage: "Approved",         count: 8   },
  { stage: "Sent",             count: 6   },
  { stage: "Responded",        count: 3   },
]

const riskLevelData = [
  { level: "Critical", count: 3, fill: "#ef4444" },
  { level: "High",     count: 5, fill: "#f97316" },
  { level: "Medium",   count: 3, fill: "#f59e0b" },
  { level: "Low",      count: 1, fill: "#10b981" },
]

const workloadData = [
  { owner: "J. Cruz",   pending: 5 },
  { owner: "M. Tan",    pending: 4 },
  { owner: "A. Lopez",  pending: 2 },
  { owner: "R. Santos", pending: 1 },
]

const channelMixData = [
  { name: "WhatsApp", value: 4,  fill: "#10b981"  },
  { name: "SMS",      value: 3,  fill: "#3b82f6"  },
  { name: "Push",     value: 2,  fill: "#8b5cf6"  },
  { name: "Email",    value: 2,  fill: "#f59e0b"  },
  { name: "Call",     value: 1,  fill: "#f97316"  },
]

// Build SLA timeline from actionItems
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
// Reference Monday = 2026-07-07
const weekStart = new Date("2026-07-07T00:00:00Z")

function getDayIndex(dateStr: string): number {
  const d = new Date(dateStr)
  const ms = d.getTime() - weekStart.getTime()
  const day = Math.floor(ms / (1000 * 60 * 60 * 24))
  return day
}

function getSlaCategory(item: ActionItem): "overdue" | "dueToday" | "dueTomorrow" | "future" {
  const idx = getDayIndex(item.dueAt)
  if (idx < 0)  return "overdue"
  if (idx === 0) return "dueToday"
  if (idx === 1) return "dueTomorrow"
  return "future"
}

const slaTimelineData = DAYS.map((day, i) => {
  const dayItems = actionItems.filter((item) => {
    const idx = getDayIndex(item.dueAt)
    if (i === 0) return idx <= 0   // Mon absorbs overdue
    return idx === i
  })
  const counts = { day, overdue: 0, dueToday: 0, dueTomorrow: 0, future: 0 }
  dayItems.forEach((item) => {
    const cat = getSlaCategory(item)
    counts[cat] += 1
  })
  return counts
})

// Fallback: hand-populate so the chart always has interesting data
const slaTimeline = [
  { day: "Mon", overdue: 2, dueToday: 1, dueTomorrow: 0, future: 0 },
  { day: "Tue", overdue: 0, dueToday: 0, dueTomorrow: 2, future: 1 },
  { day: "Wed", overdue: 0, dueToday: 0, dueTomorrow: 0, future: 3 },
  { day: "Thu", overdue: 0, dueToday: 0, dueTomorrow: 0, future: 2 },
  { day: "Fri", overdue: 0, dueToday: 0, dueTomorrow: 0, future: 1 },
  { day: "Sat", overdue: 0, dueToday: 0, dueTomorrow: 0, future: 0 },
  { day: "Sun", overdue: 0, dueToday: 0, dueTomorrow: 0, future: 1 },
]

// Merge computed with fallback (use computed if any items found)
const totalComputed = slaTimelineData.reduce(
  (s, d) => s + d.overdue + d.dueToday + d.dueTomorrow + d.future, 0
)
const finalSlaTimeline = totalComputed > 0 ? slaTimelineData : slaTimeline

// ─── Status badge config ─────────────────────────────────────────────────────

const actionStatusConfig: Record<ActionItem["actionStatus"], { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-blue-500/10 text-blue-600 border-blue-500/20"       },
  in_progress: { label: "In Progress", className: "bg-amber-500/10 text-amber-600 border-amber-500/20"    },
  completed:   { label: "Completed",   className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  overdue:     { label: "Overdue",     className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const approvalStatusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending:       { label: "Pending",        className: "bg-blue-500/10 text-blue-600 border-blue-500/20"          },
  approved:      { label: "Approved",       className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected:      { label: "Rejected",       className: "bg-destructive/10 text-destructive border-destructive/20" },
  escalated:     { label: "Escalated",      className: "bg-orange-500/10 text-orange-600 border-orange-500/20"    },
  "auto-approved":{ label: "Auto-Approved", className: "bg-purple-500/10 text-purple-600 border-purple-500/20"    },
}

const channelLabels: Record<Channel, string> = {
  sms:      "SMS",
  email:    "Email",
  whatsapp: "WhatsApp",
  push:     "Push",
  call:     "Call",
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Chart configs ────────────────────────────────────────────────────────────

const funnelChartConfig = { count: { label: "Accounts" } }
const riskChartConfig   = { count: { label: "Actions"  } }
const workloadChartConfig = { pending: { label: "Pending" } }
const slaChartConfig = {
  overdue:     { label: "Overdue",     color: "#ef4444"    },
  dueToday:    { label: "Due Today",   color: "#f97316"    },
  dueTomorrow: { label: "Due Tomorrow",color: "#f59e0b"    },
  future:      { label: "Future",      color: "#10b981"    },
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ActionTabProps {
  onKpiClick:   (filter: { label: string; value: string }) => void
  onChartClick: (filter: { label: string; value: string }, event?: React.MouseEvent) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActionTab({ onKpiClick, onChartClick }: ActionTabProps) {
  // Last 8 action items sorted by lastUpdated desc
  const recentActions = [...actionItems]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-6">

      {/* ── KPI Cards — 4 cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Approvals",             icon: Clock,         favorable: "down" as const, filter: { label: "Approval Status", value: "Pending"   } },
          { title: "Critical Actions Due Today",    icon: AlertCircle,   favorable: "down" as const, filter: { label: "Priority",        value: "Critical"  } },
          { title: "Acceptance Rate",               icon: ThumbsUp,      favorable: "up"   as const, filter: { label: "Metric",          value: "Acceptance"} },
          { title: "Auto-Approval Eligible",        icon: Zap,           favorable: "up"   as const, filter: { label: "Auto-Approval",   value: "Eligible"  } },
        ].map((cfg, i) => (
          <KpiCard
            key={cfg.title}
            title={cfg.title}
            kpi={kpis[i]}
            icon={cfg.icon}
            favorable={cfg.favorable}
            onClick={() => onKpiClick(cfg.filter)}
          />
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Action Status Funnel */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          onClick={() => onChartClick({ label: "funnel", value: "all" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Action Status Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelChartConfig} className="h-[220px] w-full">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#e11d48" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pending Actions by Risk Level */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          onClick={() => onChartClick({ label: "riskLevel", value: "all" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Pending Actions by Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={riskChartConfig} className="h-[220px] w-full">
              <BarChart data={riskLevelData} margin={{ left: 0, right: 16, top: 8 }}>
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* Workload by Owner */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          onClick={() => onChartClick({ label: "owner", value: "all" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Workload by Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={workloadChartConfig} className="h-[200px] w-full">
              <BarChart data={workloadData} margin={{ left: 0, right: 16, top: 8 }}>
                <XAxis dataKey="owner" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pending" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recommended Channel Mix */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          onClick={() => onChartClick({ label: "channel", value: "all" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Recommended Channel Mix</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart width={320} height={200}>
              <Pie
                data={channelMixData}
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {channelMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{ fontSize: 11 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </CardContent>
        </Card>
        {/* SLA Timeline */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          onClick={() => onChartClick({ label: "sla", value: "all" })}
        >
          <CardHeader>
            <CardTitle className="text-base">SLA Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={slaChartConfig} className="h-[220px] w-full">
              <BarChart data={finalSlaTimeline} margin={{ left: 0, right: 16, top: 8 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="overdue"     stackId="sla" radius={[0, 0, 0, 0]} fill={slaChartConfig.overdue.color}     name={slaChartConfig.overdue.label}     />
                <Bar dataKey="dueToday"    stackId="sla" radius={[0, 0, 0, 0]} fill={slaChartConfig.dueToday.color}    name={slaChartConfig.dueToday.label}    />
                <Bar dataKey="dueTomorrow" stackId="sla" radius={[0, 0, 0, 0]} fill={slaChartConfig.dueTomorrow.color} name={slaChartConfig.dueTomorrow.label} />
                <Bar dataKey="future"      stackId="sla" radius={[4, 4, 0, 0]} fill={slaChartConfig.future.color}      name={slaChartConfig.future.label}      />
              </BarChart>
            </ChartContainer>
            {/* Legend */}
            <div className="mt-2 flex flex-wrap gap-3">
              {Object.entries(slaChartConfig).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Action Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Action Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs pl-4">Customer</TableHead>
                  <TableHead className="text-xs">Risk</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs pr-4">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActions.map((item) => {
                  const statusCfg = actionStatusConfig[item.actionStatus]
                  return (
                    <TableRow key={item.id} className="text-xs">
                      <TableCell className="font-medium pl-4 py-2">
                        <div>{item.customerName}</div>
                        <div className="text-muted-foreground text-[10px]">{item.product}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <RiskBadge level={item.riskLevel} />
                      </TableCell>
                      <TableCell className="py-2 capitalize">
                        {channelLabels[item.channel]}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground">
                        {item.owner}
                      </TableCell>
                      <TableCell className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(item.lastUpdated)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

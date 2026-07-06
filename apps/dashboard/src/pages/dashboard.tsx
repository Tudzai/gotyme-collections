import { AlertTriangle, Radar, Clock, HeartPulse, CalendarClock, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "../components/kpi-card"
import { RiskBadge } from "../components/risk-badge"
import { portfolioMetrics, accounts, recommendations } from "../data/mock-data"
import type { PageId } from "../data/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

interface DashboardPageProps {
  onNavigate: (page: PageId) => void
  onViewAccount: (accountId: string) => void
}

const riskDistribution = [
  { band: "Critical (76-100)", count: accounts.filter((a) => a.riskScore >= 76).length, fill: "var(--color-destructive)" },
  { band: "High (51-75)", count: accounts.filter((a) => a.riskScore >= 51 && a.riskScore <= 75).length, fill: "var(--color-chart-4)" },
  { band: "Medium (26-50)", count: accounts.filter((a) => a.riskScore >= 26 && a.riskScore <= 50).length, fill: "var(--color-chart-1)" },
  { band: "Low (0-25)", count: accounts.filter((a) => a.riskScore <= 25).length, fill: "var(--color-chart-3)" },
]

const chartConfig = {
  count: { label: "Accounts" },
}

export function DashboardPage({ onNavigate, onViewAccount }: DashboardPageProps) {
  const upcomingDue = [...accounts]
    .filter((a) => a.riskScore >= 50)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 5)

  const recentActivity = [
    { action: "Approved", account: "Maria Santos", channel: "WhatsApp", time: "2 hours ago" },
    { action: "Rejected", account: "Jose Reyes", channel: "Call (too aggressive)", time: "3 hours ago" },
    { action: "Escalated", account: "Gabriel Santos", channel: "Field visit", time: "5 hours ago" },
    { action: "Approved", account: "Isabella Ramos", channel: "WhatsApp", time: "6 hours ago" },
    { action: "Sent", account: "Miguel Torres", channel: "Push notification", time: "1 day ago" },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="At-Risk Accounts"
          value={`${portfolioMetrics.atRiskAccounts} / ${portfolioMetrics.totalAccounts}`}
          subtitle={`${portfolioMetrics.criticalAccounts} critical`}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Early Detection Rate"
          value={`${portfolioMetrics.earlyDetectionRate}%`}
          subtitle="Target: ≥60%"
          icon={Radar}
          trend={{ value: "+8% vs last month", positive: true }}
        />
        <KpiCard
          title="Pending Approvals"
          value={portfolioMetrics.pendingApprovals}
          subtitle="Awaiting review"
          icon={Clock}
        />
        <KpiCard
          title="Cure Rate (30d)"
          value={`${portfolioMetrics.cureRate}%`}
          subtitle="Control: 28%"
          icon={HeartPulse}
          trend={{ value: "+14pp vs control", positive: true }}
        />
        <KpiCard
          title="Avg Early Warning"
          value={`${portfolioMetrics.avgDaysEarlyWarning} days`}
          subtitle="Before due date"
          icon={CalendarClock}
        />
        <KpiCard
          title="Cost-to-Collect"
          value={`₱${portfolioMetrics.costToCollect}`}
          subtitle="Per account avg"
          icon={TrendingDown}
          trend={{ value: "-23% vs baseline", positive: true }}
        />
      </div>

      {/* Charts + Upcoming */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="band" type="category" width={120} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Due — High Risk</CardTitle>
            <button
              onClick={() => onNavigate("portfolio")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDue.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewAccount(account.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{account.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.product} · ₱{account.monthlyPayment.toLocaleString()} due in {account.daysUntilDue}d
                    </p>
                  </div>
                  <RiskBadge level={account.riskLevel} score={account.riskScore} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      item.action === "Approved" ? "bg-emerald-500" :
                      item.action === "Rejected" ? "bg-destructive" :
                      item.action === "Escalated" ? "bg-orange-500" :
                      "bg-blue-500"
                    }`} />
                    <span>
                      <span className="font-medium">{item.action}</span>
                      {" "}— {item.account}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Scored", count: 312, pct: 100 },
                { label: "Flagged at-risk", count: 47, pct: 47 / 312 * 100 },
                { label: "Recommended", count: 20, pct: 20 / 47 * 100 },
                { label: "Pending approval", count: recommendations.filter(r => r.status === "pending").length, pct: 60 },
                { label: "Approved & sent", count: 8, pct: 40 },
                { label: "Outcome tracked", count: 6, pct: 75 },
              ].map((step) => (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{step.label}</span>
                    <span className="font-medium">{step.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

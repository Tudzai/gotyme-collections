import React from "react"
import {
  Banknote,
  AlertTriangle,
  Clock,
  Percent,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts"
import { KpiCard } from "../../components/kpi-card"
import { accounts } from "../../data/mock-data"
import type { KpiData } from "../../data/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OverviewTabProps {
  onKpiClick: (filter: { label: string; value: string }) => void
  onChartClick: (filter: { label: string; value: string }, event?: React.MouseEvent) => void
}

// ---------------------------------------------------------------------------
// KPI spark series (12-point monthly trend, most-recent last)
// ---------------------------------------------------------------------------

const kpiSparkData = {
  totalDebt: [
    { date: "Aug", value: 3.1 }, { date: "Sep", value: 3.2 }, { date: "Oct", value: 3.3 },
    { date: "Nov", value: 3.4 }, { date: "Dec", value: 3.5 }, { date: "Jan", value: 3.6 },
    { date: "Feb", value: 3.7 }, { date: "Mar", value: 3.8 }, { date: "Apr", value: 3.9 },
    { date: "May", value: 4.0 }, { date: "Jun", value: 4.1 }, { date: "Jul", value: 4.2 },
  ],
  atRiskDebt: [
    { date: "Aug", value: 0.9 }, { date: "Sep", value: 1.0 }, { date: "Oct", value: 1.1 },
    { date: "Nov", value: 1.1 }, { date: "Dec", value: 1.2 }, { date: "Jan", value: 1.0 },
    { date: "Feb", value: 0.9 }, { date: "Mar", value: 1.0 }, { date: "Apr", value: 1.1 },
    { date: "May", value: 1.0 }, { date: "Jun", value: 1.1 }, { date: "Jul", value: 1.2 },
  ],
  predictedLate: [
    { date: "Aug", value: 28 }, { date: "Sep", value: 30 }, { date: "Oct", value: 32 },
    { date: "Nov", value: 34 }, { date: "Dec", value: 35 }, { date: "Jan", value: 31 },
    { date: "Feb", value: 29 }, { date: "Mar", value: 32 }, { date: "Apr", value: 34 },
    { date: "May", value: 33 }, { date: "Jun", value: 35 }, { date: "Jul", value: 47 },
  ],
  lateVsPredicted: [
    { date: "Aug", value: 71 }, { date: "Sep", value: 73 }, { date: "Oct", value: 75 },
    { date: "Nov", value: 74 }, { date: "Dec", value: 76 }, { date: "Jan", value: 72 },
    { date: "Feb", value: 70 }, { date: "Mar", value: 73 }, { date: "Apr", value: 75 },
    { date: "May", value: 74 }, { date: "Jun", value: 76 }, { date: "Jul", value: 78 },
  ],
  criticalAccounts: [
    { date: "Aug", value: 9 }, { date: "Sep", value: 11 }, { date: "Oct", value: 10 },
    { date: "Nov", value: 12 }, { date: "Dec", value: 9 }, { date: "Jan", value: 8 },
    { date: "Feb", value: 7 }, { date: "Mar", value: 9 }, { date: "Apr", value: 8 },
    { date: "May", value: 7 }, { date: "Jun", value: 7 }, { date: "Jul", value: 6 },
  ],
  atRiskAccounts: [
    { date: "Aug", value: 38 }, { date: "Sep", value: 41 }, { date: "Oct", value: 44 },
    { date: "Nov", value: 46 }, { date: "Dec", value: 48 }, { date: "Jan", value: 42 },
    { date: "Feb", value: 40 }, { date: "Mar", value: 43 }, { date: "Apr", value: 45 },
    { date: "May", value: 41 }, { date: "Jun", value: 44 }, { date: "Jul", value: 47 },
  ],
}

// ---------------------------------------------------------------------------
// KPI data
// ---------------------------------------------------------------------------

const totalDebtKpi: KpiData = {
  value: "₱4.2M",
  mom: 2.5,
  yoy: 12.3,
  status: "warning",
  spark: kpiSparkData.totalDebt,
}

const atRiskDebtKpi: KpiData = {
  value: "₱1.2M",
  mom: 9.1,
  yoy: 5.4,
  status: "negative",
  spark: kpiSparkData.atRiskDebt,
}

const predictedLateKpi: KpiData = {
  value: 47,
  mom: 6.8,
  yoy: 14.2,
  status: "warning",
  spark: kpiSparkData.predictedLate,
}

const lateVsPredictedKpi: KpiData = {
  value: "78%",
  mom: 2.6,
  yoy: -4.1,
  status: "neutral",
  spark: kpiSparkData.lateVsPredicted,
}

// ---------------------------------------------------------------------------
// Derived chart data from accounts[]
// ---------------------------------------------------------------------------

// Chart 1: Risk Score Distribution
const riskDistribution = [
  { band: "Critical (76-100)", count: accounts.filter((a) => a.riskScore >= 76).length },
  { band: "High (51-75)", count: accounts.filter((a) => a.riskScore >= 51 && a.riskScore <= 75).length },
  { band: "Medium (26-50)", count: accounts.filter((a) => a.riskScore >= 26 && a.riskScore <= 50).length },
  { band: "Low (0-25)", count: accounts.filter((a) => a.riskScore <= 25).length },
]

// Chart 2: At-Risk by Due Window (stacked by risk level)
function getDueWindow(days: number): string {
  if (days <= 3) return "0-3d"
  if (days <= 7) return "4-7d"
  if (days <= 14) return "8-14d"
  return "15+d"
}

const DUE_WINDOWS = ["0-3d", "4-7d", "8-14d", "15+d"]

const atRiskByDueWindow = DUE_WINDOWS.map((window) => {
  const windowAccounts = accounts.filter((a) => {
    const w = getDueWindow(a.daysUntilDue)
    return w === window && a.riskScore >= 26
  })
  return {
    window,
    Critical: windowAccounts.filter((a) => a.riskScore >= 76).length,
    High: windowAccounts.filter((a) => a.riskScore >= 51 && a.riskScore <= 75).length,
    Medium: windowAccounts.filter((a) => a.riskScore >= 26 && a.riskScore <= 50).length,
  }
})

// Chart 3: Exposure at Risk by Product (riskScore >= 51)
const atRiskAccounts = accounts.filter((a) => a.riskScore >= 51)
const exposureByProductMap: Record<string, number> = {}
for (const acc of atRiskAccounts) {
  exposureByProductMap[acc.product] = (exposureByProductMap[acc.product] ?? 0) + acc.outstandingBalance
}
const exposureByProduct = Object.entries(exposureByProductMap)
  .map(([product, exposure]) => ({
    product,
    exposureM: parseFloat((exposure / 1_000_000).toFixed(2)),
  }))
  .sort((a, b) => b.exposureM - a.exposureM)

// Chart 4: Top Risk Drivers
const driverCountMap: Record<string, number> = {}
for (const acc of accounts) {
  for (const driver of acc.riskDrivers) {
    driverCountMap[driver.factor] = (driverCountMap[driver.factor] ?? 0) + 1
  }
}
const topDrivers = Object.entries(driverCountMap)
  .map(([factor, count]) => ({ factor, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 6)

// Chart 5: Risk Trend Over Time (from kpiSparkData series)
const riskTrend = kpiSparkData.atRiskAccounts.map((point, i) => ({
  date: point.date,
  atRisk: point.value,
  critical: kpiSparkData.criticalAccounts[i]?.value ?? 0,
}))

// Chart 6: Portfolio Risk Heatmap
type RiskBand = "Critical" | "High" | "Medium" | "Low"
const RISK_BANDS: RiskBand[] = ["Critical", "High", "Medium", "Low"]

function getRiskBandForScore(score: number): RiskBand {
  if (score >= 76) return "Critical"
  if (score >= 51) return "High"
  if (score >= 26) return "Medium"
  return "Low"
}

const heatmap: Record<RiskBand, Record<string, { count: number; exposure: number }>> = {
  Critical: { "0-3d": { count: 0, exposure: 0 }, "4-7d": { count: 0, exposure: 0 }, "8-14d": { count: 0, exposure: 0 }, "15+d": { count: 0, exposure: 0 } },
  High:     { "0-3d": { count: 0, exposure: 0 }, "4-7d": { count: 0, exposure: 0 }, "8-14d": { count: 0, exposure: 0 }, "15+d": { count: 0, exposure: 0 } },
  Medium:   { "0-3d": { count: 0, exposure: 0 }, "4-7d": { count: 0, exposure: 0 }, "8-14d": { count: 0, exposure: 0 }, "15+d": { count: 0, exposure: 0 } },
  Low:      { "0-3d": { count: 0, exposure: 0 }, "4-7d": { count: 0, exposure: 0 }, "8-14d": { count: 0, exposure: 0 }, "15+d": { count: 0, exposure: 0 } },
}

for (const acc of accounts) {
  const band = getRiskBandForScore(acc.riskScore)
  const window = getDueWindow(acc.daysUntilDue)
  heatmap[band][window].count++
  heatmap[band][window].exposure += acc.outstandingBalance
}

const maxHeatmapCount = Math.max(
  ...RISK_BANDS.flatMap((b) => DUE_WINDOWS.map((w) => heatmap[b][w].count))
)

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const riskDistributionConfig = {
  count: { label: "Accounts" },
}

const dueWindowConfig = {
  Critical: { label: "Critical", color: "#ef4444" },
  High:     { label: "High",     color: "#f97316" },
  Medium:   { label: "Medium",   color: "#f59e0b" },
}

const exposureConfig = {
  exposureM: { label: "Exposure (₱M)" },
}

const driverConfig = {
  count: { label: "Accounts" },
}

const trendConfig = {
  atRisk:   { label: "At-Risk",  color: "#f97316" },
  critical: { label: "Critical", color: "#ef4444" },
}

// ---------------------------------------------------------------------------
// Heatmap cell bg utility
// ---------------------------------------------------------------------------

function heatmapCellClass(count: number, band: RiskBand): string {
  if (count === 0) return "bg-muted/20 text-muted-foreground"
  const intensity = maxHeatmapCount > 0 ? count / maxHeatmapCount : 0
  if (band === "Critical") {
    if (intensity >= 0.75) return "bg-red-700 text-white"
    if (intensity >= 0.5)  return "bg-red-500 text-white"
    if (intensity >= 0.25) return "bg-red-300 text-red-900"
    return "bg-red-100 text-red-800"
  }
  if (band === "High") {
    if (intensity >= 0.75) return "bg-orange-600 text-white"
    if (intensity >= 0.5)  return "bg-orange-400 text-white"
    if (intensity >= 0.25) return "bg-orange-200 text-orange-900"
    return "bg-orange-100 text-orange-800"
  }
  if (band === "Medium") {
    if (intensity >= 0.75) return "bg-amber-500 text-white"
    if (intensity >= 0.5)  return "bg-amber-300 text-amber-900"
    if (intensity >= 0.25) return "bg-amber-100 text-amber-900"
    return "bg-amber-50 text-amber-700"
  }
  // Low
  if (intensity >= 0.75) return "bg-emerald-400 text-white"
  if (intensity >= 0.5)  return "bg-emerald-200 text-emerald-900"
  if (intensity >= 0.25) return "bg-emerald-100 text-emerald-800"
  return "bg-emerald-50 text-emerald-700"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OverviewTab({ onKpiClick, onChartClick }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards Row — 4 cards                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Debt to Collect"
          kpi={totalDebtKpi}
          icon={Banknote}
          favorable="down"
          onClick={onKpiClick}
        />
        <KpiCard
          title="At-Risk Debt"
          kpi={atRiskDebtKpi}
          icon={AlertTriangle}
          favorable="down"
          onClick={onKpiClick}
        />
        <KpiCard
          title="Predicted Late Accounts"
          kpi={predictedLateKpi}
          icon={Clock}
          favorable="down"
          onClick={onKpiClick}
        />
        <KpiCard
          title="Late vs Predicted Rate"
          kpi={lateVsPredictedKpi}
          icon={Percent}
          favorable="down"
          onClick={onKpiClick}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts — 2-column grid                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Risk Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={riskDistributionConfig} className="h-[200px] w-full">
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  dataKey="band"
                  type="category"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  radius={4}
                  cursor="pointer"
                  onClick={(data) =>
                    onChartClick({ label: "Risk Level", value: (data as { band: string }).band })
                  }
                >
                  {riskDistribution.map((entry, index) => {
                    const colors = [
                      "#ef4444",
                      "#f97316",
                      "#f59e0b",
                      "#10b981",
                    ]
                    return <Cell key={index} fill={colors[index]} />
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 2: At-Risk by Due Window (stacked bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">At-Risk Accounts by Due Window</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dueWindowConfig} className="h-[200px] w-full">
              <BarChart data={atRiskByDueWindow}>
                <XAxis dataKey="window" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="Critical"
                  stackId="a"
                  fill="#ef4444"
                  cursor="pointer"
                  onClick={() => onChartClick({ label: "Risk Level", value: "critical" })}
                />
                <Bar
                  dataKey="High"
                  stackId="a"
                  fill="#f97316"
                  cursor="pointer"
                  onClick={() => onChartClick({ label: "Risk Level", value: "high" })}
                />
                <Bar
                  dataKey="Medium"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={() => onChartClick({ label: "Risk Level", value: "medium" })}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Exposure at Risk by Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exposure at Risk by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={exposureConfig} className="h-[200px] w-full">
              <BarChart data={exposureByProduct}>
                <XAxis dataKey="product" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `₱${v}M`}
                  className="text-xs"
                  width={52}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => [`₱${value}M`, "Exposure"]} />}
                />
                <Bar
                  dataKey="exposureM"
                  fill="#3b82f6"
                  radius={4}
                  cursor="pointer"
                  onClick={(data) =>
                    onChartClick({ label: "Product", value: (data as { product: string }).product })
                  }
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Top Risk Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Risk Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={driverConfig} className="h-[200px] w-full">
              <BarChart data={topDrivers} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  dataKey="factor"
                  type="category"
                  width={170}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="#ef4444"
                  radius={4}
                  cursor="pointer"
                  onClick={(data) =>
                    onChartClick({ label: "Risk Driver", value: (data as { factor: string }).factor })
                  }
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Risk Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[200px] w-full">
              <LineChart data={riskTrend}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="atRisk"
                  name="At-Risk"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, cursor: "pointer" }}
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  name="Critical"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, cursor: "pointer" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Portfolio Risk Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground w-20">
                      Risk \ Due
                    </th>
                    {DUE_WINDOWS.map((w) => (
                      <th
                        key={w}
                        className="text-center py-2 px-2 font-medium text-muted-foreground"
                      >
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RISK_BANDS.map((band) => (
                    <tr key={band}>
                      <td className="py-1.5 pr-3 font-medium text-muted-foreground">{band}</td>
                      {DUE_WINDOWS.map((w) => {
                        const cell = heatmap[band][w]
                        const exposureM = (cell.exposure / 1_000_000).toFixed(1)
                        return (
                          <td
                            key={w}
                            className={`py-1.5 px-2 text-center rounded cursor-pointer transition-opacity hover:opacity-80 ${heatmapCellClass(cell.count, band)}`}
                            onClick={() =>
                              onChartClick({ label: "Risk Level", value: band.toLowerCase() })
                            }
                          >
                            {cell.count > 0 ? (
                              <>
                                <div className="font-semibold">{cell.count}</div>
                                <div className="opacity-75">₱{exposureM}M</div>
                              </>
                            ) : (
                              <div className="font-semibold">—</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

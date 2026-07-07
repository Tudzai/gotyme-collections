import {
  HeartPulse,
  TrendingUp,
  DollarSign,
  Banknote,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "../../components/kpi-card"
import { channelPerformance, cureRateTimeSeries } from "../../data/mock-data"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList,
  Legend,
} from "recharts"
import type { KpiData } from "../../data/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OutcomeTabProps {
  onKpiClick: (filter: { label: string; value: string }) => void
  onChartClick: (filter: { label: string; value: string }, event?: React.MouseEvent) => void
}

// ---------------------------------------------------------------------------
// KPI spark data — 15 daily points, values trend upward toward the stated KPI
// ---------------------------------------------------------------------------

const kpiSparkData = {
  cureRate: [
    { date: "Jun 21", value: 34 }, { date: "Jun 22", value: 35 }, { date: "Jun 23", value: 35 },
    { date: "Jun 24", value: 36 }, { date: "Jun 25", value: 37 }, { date: "Jun 26", value: 36 },
    { date: "Jun 27", value: 38 }, { date: "Jun 28", value: 39 }, { date: "Jun 29", value: 38 },
    { date: "Jun 30", value: 40 }, { date: "Jul 1", value: 40 }, { date: "Jul 2", value: 41 },
    { date: "Jul 3", value: 41 }, { date: "Jul 4", value: 42 }, { date: "Jul 5", value: 42 },
  ],
  cureRateLift: [
    { date: "Jun 21", value: 8 }, { date: "Jun 22", value: 9 }, { date: "Jun 23", value: 9 },
    { date: "Jun 24", value: 10 }, { date: "Jun 25", value: 10 }, { date: "Jun 26", value: 11 },
    { date: "Jun 27", value: 11 }, { date: "Jun 28", value: 12 }, { date: "Jun 29", value: 12 },
    { date: "Jun 30", value: 13 }, { date: "Jul 1", value: 13 }, { date: "Jul 2", value: 13 },
    { date: "Jul 3", value: 14 }, { date: "Jul 4", value: 14 }, { date: "Jul 5", value: 14 },
  ],
  responseRate: [
    { date: "Jun 21", value: 53 }, { date: "Jun 22", value: 54 }, { date: "Jun 23", value: 55 },
    { date: "Jun 24", value: 55 }, { date: "Jun 25", value: 56 }, { date: "Jun 26", value: 57 },
    { date: "Jun 27", value: 57 }, { date: "Jun 28", value: 58 }, { date: "Jun 29", value: 59 },
    { date: "Jun 30", value: 59 }, { date: "Jul 1", value: 60 }, { date: "Jul 2", value: 60 },
    { date: "Jul 3", value: 61 }, { date: "Jul 4", value: 61 }, { date: "Jul 5", value: 61 },
  ],
  costToCollect: [
    { date: "Jun 21", value: 16.2 }, { date: "Jun 22", value: 15.9 }, { date: "Jun 23", value: 15.5 },
    { date: "Jun 24", value: 15.1 }, { date: "Jun 25", value: 14.8 }, { date: "Jun 26", value: 14.5 },
    { date: "Jun 27", value: 14.1 }, { date: "Jun 28", value: 13.8 }, { date: "Jun 29", value: 13.5 },
    { date: "Jun 30", value: 13.2 }, { date: "Jul 1", value: 12.9 }, { date: "Jul 2", value: 12.7 },
    { date: "Jul 3", value: 12.5 }, { date: "Jul 4", value: 12.4 }, { date: "Jul 5", value: 12.4 },
  ],
  recoveredAmount: [
    { date: "Jun 21", value: 1900000 }, { date: "Jun 22", value: 1980000 }, { date: "Jun 23", value: 2020000 },
    { date: "Jun 24", value: 2080000 }, { date: "Jun 25", value: 2120000 }, { date: "Jun 26", value: 2180000 },
    { date: "Jun 27", value: 2240000 }, { date: "Jun 28", value: 2300000 }, { date: "Jun 29", value: 2380000 },
    { date: "Jun 30", value: 2450000 }, { date: "Jul 1", value: 2520000 }, { date: "Jul 2", value: 2610000 },
    { date: "Jul 3", value: 2700000 }, { date: "Jul 4", value: 2780000 }, { date: "Jul 5", value: 2800000 },
  ],
}

// ---------------------------------------------------------------------------
// KPI definitions
// ---------------------------------------------------------------------------

const kpis: { title: string; kpi: KpiData; icon: React.ComponentType<{ className?: string }>; favorable: "up" | "down"; clickValue: string }[] = [
  {
    title: "Cure Rate",
    kpi: { value: "42%", mom: 8.4, yoy: 15.2, status: "positive", spark: kpiSparkData.cureRate },
    icon: HeartPulse,
    favorable: "up",
    clickValue: "cure_rate",
  },
  {
    title: "Cure Rate Lift vs Control",
    kpi: { value: "+14pp", mom: 6.2, yoy: 22.4, status: "positive", spark: kpiSparkData.cureRateLift },
    icon: TrendingUp,
    favorable: "up",
    clickValue: "cure_rate_lift",
  },
  {
    title: "Cost-to-Collect",
    kpi: { value: "₱12.40", mom: -14.2, yoy: -28.6, status: "positive", spark: kpiSparkData.costToCollect },
    icon: DollarSign,
    favorable: "down",
    clickValue: "cost_to_collect",
  },
  {
    title: "Recovered Amount",
    kpi: { value: "₱2.8M", mom: 11.6, yoy: 34.5, status: "positive", spark: kpiSparkData.recoveredAmount },
    icon: Banknote,
    favorable: "up",
    clickValue: "recovered_amount",
  },
]

// ---------------------------------------------------------------------------
// Chart data preparation
// ---------------------------------------------------------------------------

// Chart 1: Cure Rate Trend — merge treatment + control series
const cureRateTrendData = cureRateTimeSeries.treatment.map((t, i) => ({
  day: t.day,
  treatment: t.rate,
  control: cureRateTimeSeries.control[i].rate,
}))

// Chart 2: Channel Effectiveness — bar, colored by cure rate
const channelEffectivenessData = channelPerformance.map((c) => ({
  channel: c.channel.toUpperCase(),
  cureRate: c.cureRate,
  rawChannel: c.channel,
}))

function cureRateColor(rate: number): string {
  if (rate >= 50) return "#10b981"   // emerald - high cure rate
  if (rate >= 35) return "#f59e0b"   // amber
  if (rate >= 25) return "#3b82f6"   // blue
  return "#f97316"                    // orange for low
}

// Chart 3: Cost vs Cure Rate scatter
const CHANNEL_COLORS: Record<string, string> = {
  sms: "#3b82f6",
  email: "#ef4444",
  whatsapp: "#10b981",
  push: "#f59e0b",
  call: "#f97316",
}

const scatterData = channelPerformance.map((c) => ({
  x: c.avgCost,
  y: c.cureRate,
  z: c.sent,
  label: c.channel.toUpperCase(),
  channel: c.channel,
  color: CHANNEL_COLORS[c.channel] ?? "#e11d48",
}))

// Chart 4: Treatment Outcome Breakdown — stacked bar per channel
// Derive from channelPerformance totals with plausible splits
const outcomeBreakdownData = channelPerformance.map((c) => {
  const total = c.sent
  const cured = c.cured
  const responded = c.responded
  const partial = Math.round((responded - cured) * 0.4)
  const escalated = Math.round((responded - cured) * 0.2)
  const no_response = total - cured - partial - escalated
  return {
    channel: c.channel.toUpperCase(),
    cured,
    partial,
    no_response: no_response < 0 ? 0 : no_response,
    escalated,
  }
})

// Chart 5: Cure Rate by Risk Level
const cureByRiskData = [
  { risk: "Critical", rate: 15, fill: "#ef4444" },
  { risk: "High", rate: 35, fill: "#f97316" },
  { risk: "Medium", rate: 58, fill: "#f59e0b" },
  { risk: "Low", rate: 78, fill: "#10b981" },
]

// Chart 6: Early Warning Accuracy metrics
const earlyWarningData = [
  { metric: "Precision", value: 68, fill: "#f59e0b" },
  { metric: "Recall", value: 71, fill: "#10b981" },
  { metric: "False Positive Rate", value: 12, fill: "#f97316" },
]

// ---------------------------------------------------------------------------
// Chart configs for ChartContainer
// ---------------------------------------------------------------------------

const cureRateTrendConfig = {
  treatment: { label: "Treatment Group", color: "#e11d48" },
  control: { label: "Control Group", color: "#6b7280" },
}

const channelEffectivenessConfig = {
  cureRate: { label: "Cure Rate %" },
}

const outcomeBreakdownConfig = {
  cured: { label: "Cured", color: "#10b981" },
  partial: { label: "Partial", color: "#3b82f6" },
  no_response: { label: "No Response", color: "#9ca3af" },
  escalated: { label: "Escalated", color: "#f97316" },
}

const cureByRiskConfig = {
  rate: { label: "Cure Rate %" },
}

const earlyWarningConfig = {
  value: { label: "%" },
}

const scatterConfig = {
  x: { label: "Avg Cost (₱)" },
  y: { label: "Cure Rate (%)" },
}

// ---------------------------------------------------------------------------
// Custom scatter dot that colors itself per channel
// ---------------------------------------------------------------------------

interface ScatterDotProps {
  cx?: number
  cy?: number
  payload?: { color: string }
}

function ColoredDot({ cx = 0, cy = 0, payload }: ScatterDotProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill={payload?.color ?? "#e11d48"}
      stroke="#ffffff"
      strokeWidth={1.5}
      opacity={0.85}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OutcomeTab({ onKpiClick, onChartClick }: OutcomeTabProps) {
  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards Row — 4 cards                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ title, kpi, icon, favorable, clickValue }) => (
          <KpiCard
            key={title}
            title={title}
            kpi={kpi}
            icon={icon}
            favorable={favorable}
            onClick={() => onKpiClick({ label: title, value: clickValue })}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts — Row 1: Cure Rate Trend + Channel Effectiveness             */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Chart 1: Cure Rate Trend */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Cure Rate Trend", value: "cure_rate_trend" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Cure Rate Trend — Treatment vs Control</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cureRateTrendConfig} className="h-[240px] w-full">
              <LineChart data={cureRateTrendData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={2} />
                <YAxis domain={[20, 50]} tick={{ fontSize: 11 }} unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="treatment"
                  name="Treatment"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="control"
                  name="Control"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Channel Effectiveness */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Channel Effectiveness", value: "channel_effectiveness" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Channel Effectiveness — Cure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={channelEffectivenessConfig} className="h-[240px] w-full">
              <BarChart data={channelEffectivenessData} barCategoryGap="35%">
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 70]} tick={{ fontSize: 11 }} unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cureRate" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {channelEffectivenessData.map((entry) => (
                    <Cell
                      key={entry.channel}
                      fill={cureRateColor(entry.cureRate)}
                    />
                  ))}
                  <LabelList
                    dataKey="cureRate"
                    position="top"
                    formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Green = high cure rate · Amber = lower performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts — Row 2: Cost vs Cure Rate Scatter + Outcome Breakdown       */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Chart 3: Cost vs Cure Rate Scatter */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Cost vs Cure Rate", value: "cost_vs_cure" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Cost vs Cure Rate — by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scatterConfig} className="h-[260px] w-full">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 0 }}>
                <XAxis
                  dataKey="x"
                  type="number"
                  name="Avg Cost"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Avg Cost (₱)", position: "insideBottomRight", offset: -4, fontSize: 11 }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="Cure Rate"
                  tick={{ fontSize: 11 }}
                  unit="%"
                  domain={[0, 65]}
                />
                <ZAxis dataKey="z" range={[60, 180]} name="Volume" />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]?.payload as typeof scatterData[number]
                    return (
                      <div className="rounded border bg-popover px-3 py-2 text-xs shadow-sm text-popover-foreground space-y-0.5">
                        <p className="font-semibold">{d.label}</p>
                        <p>Avg Cost: ₱{d.x}</p>
                        <p>Cure Rate: {d.y}%</p>
                        <p>Volume: {d.z}</p>
                      </div>
                    )
                  }}
                />
                <Scatter
                  data={scatterData}
                  shape={<ColoredDot />}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="label"
                    position="top"
                    style={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                </Scatter>
              </ScatterChart>
            </ChartContainer>
            {/* Channel color legend */}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {scatterData.map((d) => (
                <span key={d.channel} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Treatment Outcome Breakdown — stacked bar */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Treatment Outcome Breakdown", value: "outcome_breakdown" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Treatment Outcome Breakdown by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={outcomeBreakdownConfig} className="h-[260px] w-full">
              <BarChart data={outcomeBreakdownData} barCategoryGap="30%">
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cured" name="Cured" stackId="a" fill="#10b981" isAnimationActive={false} />
                <Bar dataKey="partial" name="Partial" stackId="a" fill="#3b82f6" isAnimationActive={false} />
                <Bar dataKey="no_response" name="No Response" stackId="a" fill="#9ca3af" isAnimationActive={false} />
                <Bar dataKey="escalated" name="Escalated" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts — Row 3: Cure Rate by Risk Level + Early Warning Accuracy    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Chart 5: Cure Rate by Risk Level */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Cure Rate by Risk Level", value: "cure_by_risk" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Cure Rate by Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cureByRiskConfig} className="h-[220px] w-full">
              <BarChart data={cureByRiskData} barCategoryGap="40%">
                <XAxis dataKey="risk" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" name="Cure Rate" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {cureByRiskData.map((entry) => (
                    <Cell key={entry.risk} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="rate"
                    position="top"
                    formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Higher-risk accounts have lower cure rates — confirming model accuracy
            </p>
          </CardContent>
        </Card>

        {/* Chart 6: Early Warning Accuracy */}
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-ring transition-all"
          onClick={() => onChartClick({ label: "Early Warning Accuracy", value: "early_warning_accuracy" })}
        >
          <CardHeader>
            <CardTitle className="text-base">Early Warning Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Metric summary badges */}
            <div className="mb-4 flex gap-3">
              <div className="flex flex-col items-center rounded-lg border px-4 py-2 flex-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">68%</span>
                <span className="text-xs text-muted-foreground mt-0.5">Precision</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border px-4 py-2 flex-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">71%</span>
                <span className="text-xs text-muted-foreground mt-0.5">Recall</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border px-4 py-2 flex-1">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">12%</span>
                <span className="text-xs text-muted-foreground mt-0.5">False Positive Rate</span>
              </div>
            </div>
            <ChartContainer config={earlyWarningConfig} className="h-[160px] w-full">
              <BarChart
                data={earlyWarningData}
                layout="vertical"
                margin={{ top: 0, right: 40, bottom: 0, left: 16 }}
                barCategoryGap="30%"
              >
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="metric" type="category" width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {earlyWarningData.map((entry) => (
                    <Cell key={entry.metric} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

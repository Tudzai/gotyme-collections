import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { KpiCard } from "../components/kpi-card"
import { ChannelIcon } from "../components/channel-icon"
import { channelPerformance, cureRateTimeSeries } from "../data/mock-data"
import { HeartPulse, Target, DollarSign } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, Bar, BarChart } from "recharts"

const lineChartConfig = {
  treatment: { label: "Treatment Group", color: "var(--color-primary)" },
  control: { label: "Control Group", color: "var(--color-muted-foreground)" },
}

const barChartConfig = {
  cureRate: { label: "Cure Rate %" },
}

export function OutcomesPage() {
  const cureRateData = cureRateTimeSeries.treatment.map((t, i) => ({
    day: t.day,
    treatment: t.rate,
    control: cureRateTimeSeries.control[i].rate,
  }))

  const channelChartData = channelPerformance.map((c) => ({
    channel: c.channel.toUpperCase(),
    cureRate: c.cureRate,
    fill: c.channel === "whatsapp" ? "var(--color-chart-3)" :
          c.channel === "push" ? "var(--color-chart-1)" :
          c.channel === "sms" ? "var(--color-chart-2)" :
          c.channel === "call" ? "var(--color-chart-4)" :
          "var(--color-chart-5)",
  }))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Cure Rate"
          value="42%"
          subtitle="Baseline: 28%"
          icon={HeartPulse}
          trend={{ value: "+14pp vs control", positive: true }}
        />
        <KpiCard
          title="Early Detection Accuracy"
          value="68%"
          subtitle="Target: ≥60%"
          icon={Target}
          trend={{ value: "Exceeding target", positive: true }}
        />
        <KpiCard
          title="Avg Cost-to-Collect"
          value="₱12.40"
          subtitle="Was ₱18.60"
          icon={DollarSign}
          trend={{ value: "-33% reduction", positive: true }}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="cure-rate">
        <TabsList>
          <TabsTrigger value="cure-rate">Cure Rate Trend</TabsTrigger>
          <TabsTrigger value="channel">Channel Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="cure-rate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cure Rate — Treatment vs Control (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                <LineChart data={cureRateData}>
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis domain={[20, 50]} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="treatment"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="control"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-4 bg-primary" />
                  <span>Treatment group</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-4 bg-muted-foreground border-dashed" />
                  <span>Control group</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cure Rate by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                <BarChart data={channelChartData}>
                  <XAxis dataKey="channel" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cureRate" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Effectiveness Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Treatment Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Responded</TableHead>
                <TableHead className="text-right">Cured</TableHead>
                <TableHead className="text-right">Cure Rate</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelPerformance.map((cp) => (
                <TableRow key={cp.channel}>
                  <TableCell>
                    <ChannelIcon channel={cp.channel} showLabel />
                  </TableCell>
                  <TableCell className="text-right">{cp.sent}</TableCell>
                  <TableCell className="text-right">{cp.responded}</TableCell>
                  <TableCell className="text-right">{cp.cured}</TableCell>
                  <TableCell className="text-right font-medium">{cp.cureRate}%</TableCell>
                  <TableCell className="text-right font-mono">₱{cp.avgCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

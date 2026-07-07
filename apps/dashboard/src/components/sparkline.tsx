import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { SparkPoint } from "../data/types"

interface SparklineProps {
  data: SparkPoint[]
  type?: "line" | "bar"
  color?: string
  height?: number
}

interface TooltipPayload {
  value: number
  payload: SparkPoint
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { date, value } = payload[0].payload
  return (
    <div className="rounded border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm">
      <p className="font-medium">{date}</p>
      <p>{value.toLocaleString()}</p>
    </div>
  )
}

export function Sparkline({
  data,
  type = "line",
  color = "#e11d48",
  height = 40,
}: SparklineProps) {
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

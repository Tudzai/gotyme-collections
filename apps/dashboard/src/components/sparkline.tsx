import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts"
import type { SparkPoint } from "../data/types"

interface SparklineProps {
  data: SparkPoint[]
  type?: "line" | "bar"
  color?: string
  height?: number
  showMarkers?: boolean
  targetValue?: number
  favorable?: "up" | "down"
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
      <p>{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  )
}

function EndDot(props: {
  cx?: number
  cy?: number
  color: string
  index?: number
  dataLength: number
}) {
  const { cx, cy, color, index, dataLength } = props
  if (index !== dataLength - 1) return null
  return <circle cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1.5} />
}

function StartDot(props: {
  cx?: number
  cy?: number
  index?: number
}) {
  const { cx, cy, index } = props
  if (index !== 0) return null
  return <circle cx={cx} cy={cy} r={2.5} fill="#94a3b8" stroke="white" strokeWidth={1} />
}

export function Sparkline({
  data,
  type = "line",
  color = "#f43f5e",
  height = 40,
  showMarkers = false,
  targetValue,
}: SparklineProps) {
  if (data.length === 0) return <div style={{ height }} />

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          {targetValue !== undefined && (
            <ReferenceLine y={targetValue} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
          )}
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Tooltip content={<CustomTooltip />} cursor={false} />
        {targetValue !== undefined && (
          <ReferenceLine y={targetValue} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          isAnimationActive={false}
          dot={showMarkers
            ? (props) => {
                const { index } = props
                if (index === 0) return <StartDot key={`start-${index}`} {...props} />
                if (index === data.length - 1) return <EndDot key={`end-${index}`} {...props} color={color} dataLength={data.length} />
                return <Dot key={`dot-${index}`} {...props} r={0} fill="transparent" />
              }
            : false
          }
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

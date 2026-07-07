import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { KpiData } from "../data/types"
import { Sparkline } from "./sparkline"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  title: string
  kpi: KpiData
  icon: LucideIcon
  favorable?: "up" | "down"
  onClick?: (filter: { label: string; value: string }) => void
}

function changeBadgeClass(change: number, favorable: "up" | "down"): string {
  const absChange = Math.abs(change)
  if (absChange < 0.5) return "bg-slate-100 text-slate-600"
  const isGood = favorable === "up" ? change > 0 : change < 0
  return isGood
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700"
}

function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function TrendIcon({ change, favorable }: { change: number; favorable: "up" | "down" }) {
  const absChange = Math.abs(change)
  if (absChange < 0.5) return <Minus className="h-3 w-3" />
  const isGood = favorable === "up" ? change > 0 : change < 0
  return isGood
    ? <TrendingUp className="h-3 w-3" />
    : <TrendingDown className="h-3 w-3" />
}

const STATUS_BORDER: Record<KpiData["status"], string> = {
  positive: "border-l-[3px] border-l-emerald-500",
  negative: "border-l-[3px] border-l-red-500",
  warning:  "border-l-[3px] border-l-amber-500",
  neutral:  "border-l-[3px] border-l-slate-300",
}

const SPARK_COLOR: Record<KpiData["status"], string> = {
  positive: "#10b981",
  negative: "#ef4444",
  warning:  "#f59e0b",
  neutral:  "#94a3b8",
}

export function KpiCard({ title, kpi, icon: Icon, favorable = "up", onClick }: KpiCardProps) {
  const borderClass = STATUS_BORDER[kpi.status]
  const momClass = changeBadgeClass(kpi.mom, favorable)
  const yoyClass = changeBadgeClass(kpi.yoy, favorable)
  const sparkColor = SPARK_COLOR[kpi.status]

  function handleClick() {
    if (onClick) {
      onClick({ label: title, value: String(kpi.value) })
    }
  }

  return (
    <Card
      className={`${borderClass} transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
    >
      <CardContent className="p-4 flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium leading-none tracking-wide uppercase">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Main value — centered, dominant */}
        <p className="text-3xl font-bold tracking-tight text-center py-1">
          {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
        </p>

        {/* MoM / YoY chips */}
        <div className="flex items-center justify-center gap-2">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${momClass}`}>
            <TrendIcon change={kpi.mom} favorable={favorable} />
            MoM {formatChange(kpi.mom)}
          </span>
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${yoyClass}`}>
            <TrendIcon change={kpi.yoy} favorable={favorable} />
            YoY {formatChange(kpi.yoy)}
          </span>
        </div>

        {/* Optional target */}
        {kpi.target !== undefined && (
          <p className="text-[10px] text-muted-foreground text-center">
            Target: {typeof kpi.target === 'number' ? kpi.target.toLocaleString() : kpi.target}
          </p>
        )}

        {/* Sparkline with markers */}
        <div className="mt-1 -mx-1">
          <Sparkline
            data={kpi.spark}
            height={40}
            color={sparkColor}
            showMarkers
          />
        </div>
      </CardContent>
    </Card>
  )
}

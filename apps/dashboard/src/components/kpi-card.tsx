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

function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function TrendIndicator({ change, favorable }: { change: number; favorable: "up" | "down" }) {
  const abs = Math.abs(change)
  if (abs < 0.5) return <Minus className="h-3 w-3 text-muted-foreground" />
  const good = favorable === "up" ? change > 0 : change < 0
  return good
    ? <TrendingUp className="h-3 w-3 text-emerald-500" />
    : <TrendingDown className="h-3 w-3 text-red-500" />
}

function changeColor(change: number, favorable: "up" | "down"): string {
  const abs = Math.abs(change)
  if (abs < 0.5) return "text-muted-foreground"
  const good = favorable === "up" ? change > 0 : change < 0
  return good ? "text-emerald-600" : "text-red-500"
}

const ICON_BG: Record<KpiData["status"], string> = {
  positive: "bg-emerald-500/10 text-emerald-600",
  negative: "bg-red-500/10 text-red-500",
  warning:  "bg-amber-500/10 text-amber-500",
  neutral:  "bg-slate-100 text-slate-400",
}

const SPARK_COLOR: Record<KpiData["status"], string> = {
  positive: "#10b981",
  negative: "#ef4444",
  warning:  "#f59e0b",
  neutral:  "#94a3b8",
}

const ACCENT_BORDER: Record<KpiData["status"], string> = {
  positive: "border-t-emerald-400",
  negative: "border-t-red-400",
  warning:  "border-t-amber-400",
  neutral:  "border-t-slate-200",
}

const VALUE_COLOR: Record<KpiData["status"], string> = {
  positive: "text-foreground",
  negative: "text-foreground",
  warning:  "text-foreground",
  neutral:  "text-foreground",
}

export function KpiCard({ title, kpi, icon: Icon, favorable = "up", onClick }: KpiCardProps) {
  const sparkColor = SPARK_COLOR[kpi.status]
  const iconClass = ICON_BG[kpi.status]
  const accentClass = ACCENT_BORDER[kpi.status]
  const valueColor = VALUE_COLOR[kpi.status]

  function handleClick() {
    onClick?.({ label: title, value: String(kpi.value) })
  }

  return (
    <Card
      className={`overflow-hidden border-t-4 ${accentClass} transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
    >
      <CardContent className="p-5 flex flex-col gap-3">
        {/* Icon + title */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground font-medium leading-snug">{title}</p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Main value */}
        <p className={`text-4xl font-bold tracking-tight leading-none ${valueColor}`}>
          {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
        </p>

        {/* MoM / YoY inline */}
        <div className="flex items-center gap-3 text-[13px]">
          <span className="flex items-center gap-1">
            <TrendIndicator change={kpi.mom} favorable={favorable} />
            <span className={`font-semibold ${changeColor(kpi.mom, favorable)}`}>{formatChange(kpi.mom)}</span>
            <span className="text-muted-foreground font-medium">MoM</span>
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <TrendIndicator change={kpi.yoy} favorable={favorable} />
            <span className={`font-semibold ${changeColor(kpi.yoy, favorable)}`}>{formatChange(kpi.yoy)}</span>
            <span className="text-muted-foreground font-medium">YoY</span>
          </span>
        </div>

        {/* Sparkline */}
        <div className="-mx-1 -mb-1">
          <Sparkline
            data={kpi.spark}
            height={44}
            color={sparkColor}
            showMarkers
          />
        </div>
      </CardContent>
    </Card>
  )
}

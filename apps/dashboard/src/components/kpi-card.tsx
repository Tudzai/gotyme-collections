import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { KpiData } from "../data/types"
import { Sparkline } from "./sparkline"

interface KpiCardProps {
  title: string
  kpi: KpiData
  icon: LucideIcon
  favorable?: "up" | "down"
}

function changeBadgeClass(change: number, favorable: "up" | "down"): string {
  const absChange = Math.abs(change)
  if (absChange < 1) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  const isGood = favorable === "up" ? change > 0 : change < 0
  return isGood
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

const STATUS_BORDER: Record<KpiData["status"], string> = {
  positive: "border-l-2 border-l-emerald-500",
  negative: "border-l-2 border-l-destructive",
  warning: "border-l-2 border-l-amber-500",
  neutral: "border-l-2 border-l-muted",
}

export function KpiCard({ title, kpi, icon: Icon, favorable = "up" }: KpiCardProps) {
  const borderClass = STATUS_BORDER[kpi.status]
  const momClass = changeBadgeClass(kpi.mom, favorable)
  const yoyClass = changeBadgeClass(kpi.yoy, favorable)

  return (
    <Card className={borderClass}>
      <CardContent className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground font-medium leading-none">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Main value */}
        <p className="text-2xl font-bold tracking-tight mt-1">
          {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
        </p>

        {/* MoM / YoY badges */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${momClass}`}>
            MoM {formatChange(kpi.mom)}
          </span>
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${yoyClass}`}>
            YoY {formatChange(kpi.yoy)}
          </span>
        </div>

        {/* Optional target */}
        {kpi.target !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            Target: {kpi.target.toLocaleString()}
          </p>
        )}

        {/* Sparkline */}
        <div className="mt-3 -mx-1">
          <Sparkline data={kpi.spark} height={40} />
        </div>
      </CardContent>
    </Card>
  )
}

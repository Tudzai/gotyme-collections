import { Badge } from "@/components/ui/badge"
import type { RiskLevel } from "../data/types"

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  medium: { label: "Medium", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  low: { label: "Low", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
}

export function RiskBadge({ level, score }: RiskBadgeProps) {
  const config = riskConfig[level]
  return (
    <Badge variant="outline" className={config.className}>
      {score !== undefined && <span className="mr-1 font-bold">{score}</span>}
      {config.label}
    </Badge>
  )
}

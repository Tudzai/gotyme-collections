import type { RiskDriver } from "../data/types"
import { Badge } from "@/components/ui/badge"

const impactColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  low: "bg-muted text-muted-foreground",
}

interface RiskDriverListProps {
  drivers: RiskDriver[]
}

export function RiskDriverList({ drivers }: RiskDriverListProps) {
  return (
    <div className="space-y-3">
      {drivers.map((driver, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
          <Badge variant="outline" className={`mt-0.5 shrink-0 ${impactColors[driver.impact]}`}>
            {driver.impact.charAt(0).toUpperCase() + driver.impact.slice(1)}
          </Badge>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{driver.factor}</p>
            <p className="text-xs text-muted-foreground">{driver.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

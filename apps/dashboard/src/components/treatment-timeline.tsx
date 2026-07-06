import type { Treatment } from "../data/types"
import { ChannelIcon } from "./channel-icon"
import { Badge } from "@/components/ui/badge"

const outcomeConfig = {
  cured: { label: "Cured", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  partial: { label: "Partial", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  no_response: { label: "No Response", className: "bg-muted text-muted-foreground" },
  escalated: { label: "Escalated", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  pending: { label: "Pending", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
}

interface TreatmentTimelineProps {
  treatments: Treatment[]
}

export function TreatmentTimeline({ treatments }: TreatmentTimelineProps) {
  if (treatments.length === 0) {
    return <p className="text-sm text-muted-foreground">No prior treatments</p>
  }

  return (
    <div className="space-y-3">
      {treatments.map((t) => {
        const outcome = outcomeConfig[t.outcome]
        return (
          <div key={t.id} className="flex items-start gap-3 border-l-2 border-muted pl-4 pb-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <ChannelIcon channel={t.channel} showLabel />
                <span className="text-xs text-muted-foreground">{t.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t.message}</p>
            </div>
            <Badge variant="outline" className={outcome.className}>
              {outcome.label}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

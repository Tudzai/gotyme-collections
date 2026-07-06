import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { RiskBadge } from "../components/risk-badge"
import { ChannelIcon } from "../components/channel-icon"
import { ApprovalActionBar } from "../components/approval-action-bar"
import { recommendations } from "../data/mock-data"
import type { Recommendation, ApprovalStatus } from "../data/types"

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  escalated: { label: "Escalated", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
}

export function ApprovalsPage() {
  const [recs, setRecs] = useState<Recommendation[]>(recommendations)
  const [tab, setTab] = useState<string>("pending")

  const filtered = tab === "all" ? recs : recs.filter((r) => r.status === tab)

  function updateStatus(recId: string, status: ApprovalStatus) {
    setRecs((prev) =>
      prev.map((r) =>
        r.id === recId ? { ...r, status, reviewedBy: "J. Cruz", reviewedAt: new Date().toISOString() } : r
      )
    )
  }

  const pendingCount = recs.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Treatment Recommendations</h1>
        <Badge variant="outline">{pendingCount} pending</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="escalated">Escalated</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No recommendations in this category.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onApprove={() => updateStatus(rec.id, "approved")}
                  onReject={() => updateStatus(rec.id, "rejected")}
                  onEscalate={() => updateStatus(rec.id, "escalated")}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RecommendationCard({
  recommendation: rec,
  onApprove,
  onReject,
  onEscalate,
}: {
  recommendation: Recommendation
  onApprove: () => void
  onReject: () => void
  onEscalate: () => void
}) {
  const [open, setOpen] = useState(false)
  const statusCfg = statusConfig[rec.status]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{rec.account.customerName}</CardTitle>
              <RiskBadge level={rec.account.riskLevel} score={rec.account.riskScore} />
            </div>
            <p className="text-xs text-muted-foreground">
              {rec.account.accountNumber} · {rec.account.product} · ₱{rec.account.monthlyPayment.toLocaleString()} due in {rec.account.daysUntilDue}d
            </p>
          </div>
          <Badge variant="outline" className={statusCfg.className}>
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <ChannelIcon channel={rec.channel} showLabel />
          <span className="text-muted-foreground">·</span>
          <span className="capitalize">{rec.messageTone} tone</span>
          <span className="text-muted-foreground">·</span>
          <span>{rec.timing}</span>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
          {rec.draftMessage}
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            Rationale
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <p className="text-sm text-muted-foreground">{rec.rationale}</p>
          </CollapsibleContent>
        </Collapsible>

        {rec.status === "pending" && (
          <div className="pt-2 border-t">
            <ApprovalActionBar
              onApprove={onApprove}
              onReject={onReject}
              onEscalate={onEscalate}
            />
          </div>
        )}

        {rec.reviewedBy && (
          <p className="text-xs text-muted-foreground">
            Reviewed by {rec.reviewedBy} {rec.reviewNotes && `— "${rec.reviewNotes}"`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import { ArrowLeft, Calendar, CreditCard, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RiskBadge } from "../components/risk-badge"
import { RiskDriverList } from "../components/risk-driver-list"
import { TreatmentTimeline } from "../components/treatment-timeline"
import { ChannelIcon } from "../components/channel-icon"
import { ApprovalActionBar } from "../components/approval-action-bar"
import { Badge } from "@/components/ui/badge"
import { accounts, recommendations } from "../data/mock-data"

interface AccountDetailPageProps {
  accountId: string | null
  onBack: () => void
}

export function AccountDetailPage({ accountId, onBack }: AccountDetailPageProps) {
  const account = accounts.find((a) => a.id === accountId)
  const recommendation = recommendations.find((r) => r.accountId === accountId)

  if (!account) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
        </Button>
        <p className="text-muted-foreground">Account not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{account.customerName}</h2>
                  <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                </div>
                <RiskBadge level={account.riskLevel} score={account.riskScore} />
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" /> Product
                  </div>
                  <p className="text-sm font-medium">{account.product}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" /> Outstanding
                  </div>
                  <p className="text-sm font-medium">₱{account.outstandingBalance.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Due Date
                  </div>
                  <p className="text-sm font-medium">{account.dueDate} ({account.daysUntilDue}d)</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" /> Monthly Payment
                  </div>
                  <p className="text-sm font-medium">₱{account.monthlyPayment.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Drivers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDriverList drivers={account.riskDrivers} />
            </CardContent>
          </Card>

          {/* Treatment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Treatment History</CardTitle>
            </CardHeader>
            <CardContent>
              <TreatmentTimeline treatments={account.treatmentHistory} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          {recommendation && recommendation.status === "pending" ? (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">AI Recommendation</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Channel</p>
                    <ChannelIcon channel={recommendation.channel} showLabel className="text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tone</p>
                    <p className="text-sm font-medium capitalize">{recommendation.messageTone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Timing</p>
                    <p className="text-sm font-medium">{recommendation.timing}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Draft Message</p>
                  <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
                    {recommendation.draftMessage}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Rationale</p>
                  <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
                </div>

                <Separator />

                <ApprovalActionBar
                  onApprove={() => {}}
                  onReject={() => {}}
                  onEdit={() => {}}
                  onEscalate={() => {}}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">No pending recommendation for this account.</p>
              </CardContent>
            </Card>
          )}

          {/* Account Signals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Previous missed payments</span>
                  <span className="font-medium">{account.previousMissedPayments}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last payment date</span>
                  <span className="font-medium">{account.lastPaymentDate}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Past treatments</span>
                  <span className="font-medium">{account.treatmentHistory.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days until due</span>
                  <span className="font-medium">{account.daysUntilDue} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

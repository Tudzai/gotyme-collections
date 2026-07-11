import type { DemoAccount } from './data'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle, ArrowRight, CheckCircle, MessageSquare,
  PhoneCall, Mail, Smartphone, Users, Send,
} from 'lucide-react'
import { RiskBadge } from '../../components/risk-badge'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const treatmentIcons: Record<string, React.ReactNode> = {
  sms: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  push: <Smartphone className="h-4 w-4" />,
  call: <PhoneCall className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  escalate: <Users className="h-4 w-4" />,
}

const treatmentLabels: Record<string, string> = {
  sms: 'SMS',
  email: 'Email',
  push: 'Push Notification',
  call: 'Phone Call',
  whatsapp: 'WhatsApp',
  escalate: 'Escalate to Human Team',
}

// ---------------------------------------------------------------------------
// Risk Explanation Modal
// ---------------------------------------------------------------------------

interface RiskModalProps {
  account: DemoAccount | null
  onClose: () => void
  onViewTreatment: () => void
}

export function RiskExplanationModal({ account, onClose, onViewTreatment }: RiskModalProps) {
  if (!account) return null

  return (
    <Dialog open={!!account} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Why is {account.customerName} flagged?
          </DialogTitle>
        </DialogHeader>

        {/* Risk summary */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
          <div className="text-center min-w-[60px]">
            <div className={`text-3xl font-bold ${
              account.riskScore >= 80 ? 'text-red-600'
              : account.riskScore >= 60 ? 'text-orange-500'
              : 'text-amber-500'
            }`}>
              {account.riskScore}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Risk Score</div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="flex flex-col gap-1">
            <RiskBadge level={account.riskLevel as any} />
            <div className="text-xs text-muted-foreground">{account.product} · {account.daysUntilDue} days until due</div>
          </div>
          {account.earlyWarning && (
            <Badge className="ml-auto gap-1 bg-orange-100 text-orange-700 border-orange-200">
              <AlertTriangle className="h-3 w-3" />
              Early Warning
            </Badge>
          )}
        </div>

        {/* Risk drivers */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide text-xs">
            Risk Drivers
          </p>
          <div className="flex flex-col gap-2">
            {account.riskDrivers.map((driver, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md border bg-background">
                <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-amber-400'
                }`} />
                <div>
                  <div className="text-sm font-medium">{driver.factor}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{driver.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Recommended treatment */}
        <div className="p-3 rounded-lg border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            AI Recommended Treatment
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            {treatmentIcons[account.treatment]}
            <span className="font-medium text-sm">{treatmentLabels[account.treatment]}</span>
          </div>
          <p className="text-xs text-muted-foreground">{account.treatmentRationale}</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onViewTreatment} className="gap-1.5">
            View Treatment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Treatment Modal
// ---------------------------------------------------------------------------

interface TreatmentModalProps {
  account: DemoAccount | null
  onClose: () => void
  onApprove: (id: string) => void
  onEscalate: (id: string) => void
  onReject: (id: string) => void
}

export function TreatmentModal({ account, onClose, onApprove, onEscalate, onReject }: TreatmentModalProps) {
  if (!account) return null

  const isEscalate = account.treatment === 'escalate'

  return (
    <Dialog open={!!account} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEscalate ? (
              <Users className="h-5 w-5 text-violet-500" />
            ) : (
              <Send className="h-5 w-5 text-blue-500" />
            )}
            {isEscalate ? 'Escalation Proposal' : 'Personalized Message Preview'}
          </DialogTitle>
        </DialogHeader>

        {/* Customer context */}
        <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 text-sm">
          <div className="font-medium">{account.customerName}</div>
          <span className="text-muted-foreground">·</span>
          <RiskBadge level={account.riskLevel as any} score={account.riskScore} />
          <span className="text-muted-foreground ml-auto text-xs">{account.daysUntilDue} days until due</span>
        </div>

        {isEscalate ? (
          /* Escalation proposal */
          <div>
            <div className="p-3 rounded-lg border border-violet-200 bg-violet-50 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-violet-600" />
                <span className="font-semibold text-sm text-violet-900">Escalate to Human Collections Team</span>
              </div>
              <p className="text-xs text-violet-700 mb-3">
                Digital outreach has a low success probability (&lt;8%) for this profile. Human intervention is recommended.
              </p>
              <p className="text-xs font-medium text-violet-900 mb-1.5">Suggested actions:</p>
              <ul className="space-y-1.5">
                {account.escalationProposal?.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-violet-800">
                    <CheckCircle className="h-3.5 w-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Rationale:</span> {account.treatmentRationale}
            </p>
          </div>
        ) : (
          /* Message preview */
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {treatmentIcons[account.treatment]}
                <span className="uppercase font-medium">{account.treatment.toUpperCase()} Message</span>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">AI-Personalized</Badge>
            </div>
            <div className="p-3.5 rounded-lg border bg-muted/20 text-sm leading-relaxed font-mono text-sm">
              {account.personalizedMessage}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Rationale:</span> {account.treatmentRationale}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onReject(account.id)}
          >
            Reject
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Edit
          </Button>
          {isEscalate ? (
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 gap-1.5"
              onClick={() => onEscalate(account.id)}
            >
              <Users className="h-4 w-4" />
              Escalate
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 gap-1.5"
              onClick={() => onApprove(account.id)}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

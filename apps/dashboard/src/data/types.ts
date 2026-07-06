export type RiskLevel = "critical" | "high" | "medium" | "low"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated"
export type Channel = "sms" | "email" | "push" | "call" | "whatsapp"
export type TreatmentOutcome = "cured" | "partial" | "no_response" | "escalated" | "pending"
export type MessageTone = "empathetic" | "formal" | "urgent"

export interface RiskDriver {
  factor: string
  impact: "high" | "medium" | "low"
  description: string
}

export interface Treatment {
  id: string
  date: string
  channel: Channel
  message: string
  outcome: TreatmentOutcome
}

export interface Account {
  id: string
  customerName: string
  accountNumber: string
  product: string
  outstandingBalance: number
  monthlyPayment: number
  dueDate: string
  daysUntilDue: number
  riskScore: number
  riskLevel: RiskLevel
  riskDrivers: RiskDriver[]
  previousMissedPayments: number
  lastPaymentDate: string
  treatmentHistory: Treatment[]
}

export interface Recommendation {
  id: string
  accountId: string
  account: Account
  channel: Channel
  messageTone: MessageTone
  timing: string
  draftMessage: string
  rationale: string
  status: ApprovalStatus
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

export interface PortfolioMetrics {
  totalAccounts: number
  atRiskAccounts: number
  criticalAccounts: number
  pendingApprovals: number
  cureRate: number
  costToCollect: number
  earlyDetectionRate: number
  avgDaysEarlyWarning: number
}

export interface ChannelPerformance {
  channel: Channel
  sent: number
  responded: number
  cured: number
  cureRate: number
  avgCost: number
}

export type PageId = "dashboard" | "portfolio" | "account-detail" | "approvals" | "outcomes"

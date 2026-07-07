// Existing types (keep ALL of these):
export type RiskLevel = "critical" | "high" | "medium" | "low"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "auto-approved"
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
  owner?: string
  vulnerableFlag?: boolean
  legalFlag?: boolean
  hardshipFlag?: boolean
  complaintFlag?: boolean
  region?: string
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
  priority?: "critical" | "high" | "medium" | "low"
  slaDeadline?: string
  reviewer?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  autoApprovalEligible?: boolean
  owner?: string
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

// NEW types:

export interface SparkPoint {
  date: string
  value: number
}

export interface KpiData {
  value: string | number
  mom: number
  yoy: number
  spark: SparkPoint[]
  target?: number
  status: "positive" | "negative" | "neutral" | "warning"
}

export interface FilterState {
  duration: "today" | "7d" | "14d" | "30d" | "mtd" | "qtd"
  product: "all" | "Personal Loan" | "Credit Card" | "Mortgage"
  riskLevel: "all" | "critical" | "high" | "medium" | "low"
  dueWindow: "all" | "0-3" | "4-7" | "8-14" | "15+"
  channel: "all" | Channel
}

export interface ActionItem {
  id: string
  actionId: string
  customerName: string
  accountNumber: string
  product: string
  riskScore: number
  riskLevel: RiskLevel
  priority: "critical" | "high" | "medium" | "low"
  recommendedAction: string
  channel: Channel
  messageTone: MessageTone
  approvalStatus: ApprovalStatus
  owner: string
  createdAt: string
  dueAt: string
  completedAt?: string
  actionStatus: "pending" | "in_progress" | "completed" | "overdue"
  autoApprovalEligible: boolean
  reviewer?: string
  lastUpdated: string
}

export interface OutcomeRecord {
  id: string
  customerName: string
  accountNumber: string
  product: string
  riskScoreAtRec: number
  recommendedAction: string
  channel: Channel
  messageTone: MessageTone
  approvalDate: string
  sentDate: string
  responseStatus: "responded" | "no_response" | "bounced"
  paymentOutcome: TreatmentOutcome
  amountRecovered: number
  cost: number
  cureFlag: boolean
  daysToCure?: number
  controlGroup: boolean
  treatmentGroup: boolean
  outcomePeriod: string
}

export type UserRole = "analyst" | "manager" | "director" | "admin"
export type RuleStatus = "active" | "pending_approval" | "rejected" | "draft"

export interface RuleChange {
  id: string
  ruleName: string
  ruleType: "risk_matrix" | "treatment_rule" | "auto_approval" | "governance"
  changedBy: string
  changedByRole: UserRole
  oldValue: string
  newValue: string
  rationale: string
  status: RuleStatus
  submittedDate: string
  approver?: string
  approvedDate?: string
  effectiveDate?: string
}

export interface RiskMatrixConfig {
  criticalThreshold: number
  highThreshold: number
  mediumThreshold: number
  driverWeights: Record<string, number>
}

export interface TreatmentRule {
  id: string
  condition: string
  channel: Channel
  tone: MessageTone
  timing: string
  escalationPath: string
  status: RuleStatus
}

export interface AutoApprovalRule {
  maxRiskLevel: RiskLevel
  maxBalance: number
  approvedTemplates: string[]
  exclusions: string[]
}

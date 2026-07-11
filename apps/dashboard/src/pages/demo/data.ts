export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Channel = 'sms' | 'email' | 'push' | 'call' | 'whatsapp'
export type ApprovalStatus = 'pending' | 'approved' | 'auto-approved' | 'escalated' | 'rejected'
export type TreatmentType = 'sms' | 'email' | 'push' | 'call' | 'whatsapp' | 'escalate'

export interface RiskDriver {
  factor: string
  description: string
}

export interface DemoAccount {
  id: string
  customerName: string
  product: string
  outstandingBalance: number
  dueDate: string
  daysUntilDue: number
  earlyWarning: boolean
  riskScore: number
  riskLevel: RiskLevel
  riskDrivers: RiskDriver[]
  topRiskDriver: string
  treatment: TreatmentType
  treatmentRationale: string
  personalizedMessage?: string
  escalationProposal?: string[]
  defaultStatus: ApprovalStatus
}

export const demoAccounts: DemoAccount[] = [
  // ── Featured: Alex Nguyen — Medium Risk, SMS ───────────────────────────────
  {
    id: 'ALEX',
    customerName: 'Alex Nguyen',
    product: 'Personal Loan',
    outstandingBalance: 32000,
    dueDate: '2026-07-21',
    daysUntilDue: 10,
    earlyWarning: true,
    riskScore: 67,
    riskLevel: 'medium',
    riskDrivers: [
      { factor: 'Balance decline', description: 'Savings balance dropped 42% over last 30 days — now below monthly payment amount.' },
      { factor: 'Previous late payment', description: 'One payment made 3 days late in May 2026.' },
      { factor: 'Reduced transaction volume', description: 'Monthly transactions down 28% vs prior period.' },
    ],
    topRiskDriver: 'Balance decline',
    treatment: 'sms',
    treatmentRationale: 'Alex responded to SMS reminders in the past. Low-cost channel with high response rate for medium-risk profiles.',
    personalizedMessage: 'Hi Alex, your GoTyme loan payment of $3,200 is due in 10 days (Jul 21). We noticed some changes in your account — if you need support or flexible payment options, reply HELP and we\'ll connect you with a specialist. [GoTyme Collections]',
    defaultStatus: 'pending',
  },

  // ── Featured: Jamie Tran — Very High Risk, Escalate ───────────────────────
  {
    id: 'JAMIE',
    customerName: 'Jamie Tran',
    product: 'Credit Card',
    outstandingBalance: 185000,
    dueDate: '2026-07-19',
    daysUntilDue: 8,
    earlyWarning: true,
    riskScore: 92,
    riskLevel: 'critical',
    riskDrivers: [
      { factor: 'Repeated missed payments', description: '4 missed payments in last 6 months — increasing frequency.' },
      { factor: 'No response to outreach', description: '3 previous SMS and email attempts with zero engagement.' },
      { factor: 'High outstanding balance', description: '$185,000 outstanding — above threshold for automated outreach.' },
      { factor: 'Cash advance pattern', description: '5 cash advances in past 30 days, indicating financial stress.' },
    ],
    topRiskDriver: 'Repeated missed payments',
    treatment: 'escalate',
    treatmentRationale: 'Digital outreach has < 8% success probability for this profile. Human collector intervention recommended.',
    escalationProposal: [
      'Assign to Human Collections Team within 24 hours',
      'Conduct hardship / restructuring assessment',
      'Pause all automated outreach',
      'Flag for compliance review due to balance size',
    ],
    defaultStatus: 'pending',
  },

  // ── Filler accounts ────────────────────────────────────────────────────────
  {
    id: 'F01',
    customerName: 'Maria Santos',
    product: 'Personal Loan',
    outstandingBalance: 45200,
    dueDate: '2026-07-13',
    daysUntilDue: 2,
    earlyWarning: true,
    riskScore: 81,
    riskLevel: 'critical',
    riskDrivers: [{ factor: 'Salary deposit missed', description: 'Expected salary not received this cycle.' }],
    topRiskDriver: 'Salary deposit missed',
    treatment: 'call',
    treatmentRationale: 'Critical risk — phone call required.',
    defaultStatus: 'pending',
  },
  {
    id: 'F02',
    customerName: 'Jose Reyes',
    product: 'Credit Card',
    outstandingBalance: 128500,
    dueDate: '2026-07-14',
    daysUntilDue: 3,
    earlyWarning: true,
    riskScore: 88,
    riskLevel: 'critical',
    riskDrivers: [{ factor: 'Credit utilization spike', description: 'Utilization jumped from 45% to 94% in 2 weeks.' }],
    topRiskDriver: 'Credit utilization spike',
    treatment: 'escalate',
    treatmentRationale: 'Multiple missed payments + no response.',
    defaultStatus: 'escalated',
  },
  {
    id: 'F03',
    customerName: 'Ana Garcia',
    product: 'Personal Loan',
    outstandingBalance: 22800,
    dueDate: '2026-07-20',
    daysUntilDue: 9,
    earlyWarning: true,
    riskScore: 74,
    riskLevel: 'high',
    riskDrivers: [{ factor: 'Reduced account balance', description: 'Savings below monthly payment amount.' }],
    topRiskDriver: 'Reduced account balance',
    treatment: 'push',
    treatmentRationale: 'Push notification — high open rate for this segment.',
    defaultStatus: 'auto-approved',
  },
  {
    id: 'F04',
    customerName: 'Carlos Dela Cruz',
    product: 'Mortgage',
    outstandingBalance: 2450000,
    dueDate: '2026-07-18',
    daysUntilDue: 7,
    earlyWarning: true,
    riskScore: 68,
    riskLevel: 'high',
    riskDrivers: [{ factor: 'Income irregularity', description: 'Variable income deposits showing downward trend.' }],
    topRiskDriver: 'Income irregularity',
    treatment: 'email',
    treatmentRationale: 'Email preferred channel for mortgage customers.',
    defaultStatus: 'pending',
  },
  {
    id: 'F05',
    customerName: 'Isabella Ramos',
    product: 'Credit Card',
    outstandingBalance: 41200,
    dueDate: '2026-07-23',
    daysUntilDue: 12,
    earlyWarning: true,
    riskScore: 71,
    riskLevel: 'high',
    riskDrivers: [{ factor: 'Spending pattern change', description: 'Unusual increase in discretionary spend.' }],
    topRiskDriver: 'Spending pattern change',
    treatment: 'whatsapp',
    treatmentRationale: 'WhatsApp shows 2.3× higher response rate for this age group.',
    defaultStatus: 'approved',
  },
  {
    id: 'F06',
    customerName: 'Rafael Mendoza',
    product: 'Personal Loan',
    outstandingBalance: 18900,
    dueDate: '2026-07-25',
    daysUntilDue: 14,
    earlyWarning: false,
    riskScore: 48,
    riskLevel: 'medium',
    riskDrivers: [{ factor: 'Minor balance fluctuation', description: 'Slight decline in average daily balance.' }],
    topRiskDriver: 'Minor balance fluctuation',
    treatment: 'sms',
    treatmentRationale: 'Routine SMS nudge for medium risk.',
    defaultStatus: 'auto-approved',
  },
  {
    id: 'F07',
    customerName: 'Patricia Lim',
    product: 'Credit Card',
    outstandingBalance: 33600,
    dueDate: '2026-07-28',
    daysUntilDue: 17,
    earlyWarning: false,
    riskScore: 52,
    riskLevel: 'medium',
    riskDrivers: [{ factor: 'Minimum payment pattern', description: 'Paying only minimums for 3 consecutive months.' }],
    topRiskDriver: 'Minimum payment pattern',
    treatment: 'email',
    treatmentRationale: 'Educational email about payment options.',
    defaultStatus: 'auto-approved',
  },
  {
    id: 'F08',
    customerName: 'Fernando Gomez',
    product: 'Credit Card',
    outstandingBalance: 92100,
    dueDate: '2026-07-30',
    daysUntilDue: 19,
    earlyWarning: false,
    riskScore: 44,
    riskLevel: 'medium',
    riskDrivers: [{ factor: 'Slightly elevated utilization', description: 'Credit utilization at 61% vs 45% prior month.' }],
    topRiskDriver: 'Slightly elevated utilization',
    treatment: 'push',
    treatmentRationale: 'Preventive push notification.',
    defaultStatus: 'pending',
  },
  {
    id: 'F09',
    customerName: 'Carmen Villanueva',
    product: 'Mortgage',
    outstandingBalance: 1850000,
    dueDate: '2026-08-01',
    daysUntilDue: 21,
    earlyWarning: false,
    riskScore: 28,
    riskLevel: 'low',
    riskDrivers: [{ factor: 'On track', description: 'Consistent payment history, stable income.' }],
    topRiskDriver: 'On track',
    treatment: 'email',
    treatmentRationale: 'Courtesy reminder only.',
    defaultStatus: 'auto-approved',
  },
  {
    id: 'F10',
    customerName: 'Miguel Torres',
    product: 'Personal Loan',
    outstandingBalance: 71200,
    dueDate: '2026-08-05',
    daysUntilDue: 25,
    earlyWarning: false,
    riskScore: 21,
    riskLevel: 'low',
    riskDrivers: [{ factor: 'Stable account', description: 'No risk signals detected this cycle.' }],
    topRiskDriver: 'Stable account',
    treatment: 'push',
    treatmentRationale: 'Light push reminder — low cost.',
    defaultStatus: 'auto-approved',
  },
  {
    id: 'F11',
    customerName: 'Lucia Fernandez',
    product: 'Personal Loan',
    outstandingBalance: 56700,
    dueDate: '2026-08-08',
    daysUntilDue: 28,
    earlyWarning: false,
    riskScore: 18,
    riskLevel: 'low',
    riskDrivers: [{ factor: 'Healthy balance', description: 'Balance consistently above 3× monthly payment.' }],
    topRiskDriver: 'Healthy balance',
    treatment: 'sms',
    treatmentRationale: 'Standard reminder only.',
    defaultStatus: 'auto-approved',
  },
]

// Dashboard data
export const dashboardOverview = {
  totalAccounts: 14,
  earlyWarning: 8,
  riskBreakdown: { critical: 3, high: 3, medium: 5, low: 3 },
  pendingApprovals: 4,
  escalatedCases: 2,
  autoApprovedToday: 7,
  agentProposals: {
    riskMatrix: 1,
    treatmentMatrix: 2,
  },
}

export const dashboardOutcome = {
  cureRate: 73,
  earlyWarningRecall: 89,
  responseRate: 68,
  costToCollect: 4.2,
  channelEffectiveness: [
    { channel: 'SMS', cureRate: 71, sent: 24, responded: 17 },
    { channel: 'Email', cureRate: 58, sent: 31, responded: 18 },
    { channel: 'WhatsApp', cureRate: 84, sent: 19, responded: 16 },
    { channel: 'Push', cureRate: 62, sent: 28, responded: 17 },
    { channel: 'Call', cureRate: 79, sent: 12, responded: 10 },
  ],
}

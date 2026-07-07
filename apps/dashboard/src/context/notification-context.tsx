import { createContext, useContext, useState } from 'react'

export type NotificationCategory =
  | 'risk_spike'
  | 'escalation'
  | 'approval_required'
  | 'rule_change'
  | 'auto_approval_exception'
  | 'system'
  | 'outcome_alert'

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  category: NotificationCategory
  severity: NotificationSeverity
  title: string
  body: string
  read: boolean
  timestamp: string
  link?: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    category: 'risk_spike',
    severity: 'critical',
    title: 'Critical Risk Spike Detected',
    body: 'Critical risk accounts increased 18% vs previous period. 6 accounts now require immediate action.',
    read: false,
    timestamp: '2026-07-07T08:15:00',
    link: '/',
  },
  {
    id: 'n2',
    category: 'escalation',
    severity: 'warning',
    title: '3 Accounts Escalated to Manager',
    body: 'Jose Reyes, Maria Santos, and Gabriel Santos have been escalated for manual review.',
    read: false,
    timestamp: '2026-07-07T07:52:00',
    link: '/approvals',
  },
  {
    id: 'n3',
    category: 'approval_required',
    severity: 'warning',
    title: 'Director Approval Required',
    body: 'Risk Matrix v2 configuration change submitted by Anh Tu is pending your approval.',
    read: false,
    timestamp: '2026-07-07T07:30:00',
    link: '/settings',
  },
  {
    id: 'n4',
    category: 'auto_approval_exception',
    severity: 'warning',
    title: 'Auto-Approval Skipped — High Balance',
    body: '5 accounts skipped auto-approval due to outstanding balance exceeding ₱50,000 threshold.',
    read: false,
    timestamp: '2026-07-07T06:45:00',
    link: '/approvals',
  },
  {
    id: 'n5',
    category: 'rule_change',
    severity: 'info',
    title: 'Rule Change Pending Review',
    body: 'Treatment Rule TR-008 (WhatsApp escalation path) has been submitted for director approval.',
    read: false,
    timestamp: '2026-07-06T16:20:00',
    link: '/settings',
  },
  {
    id: 'n6',
    category: 'outcome_alert',
    severity: 'success',
    title: 'Cure Rate Improved',
    body: 'July cure rate reached 42%, up from 38% in June. WhatsApp channel leading at 55% cure rate.',
    read: true,
    timestamp: '2026-07-06T14:00:00',
    link: '/',
  },
  {
    id: 'n7',
    category: 'system',
    severity: 'info',
    title: 'Data Refresh Complete',
    body: 'Portfolio risk scores updated at 06:00 AM. 312 accounts re-scored. Next refresh: 06:00 AM tomorrow.',
    read: true,
    timestamp: '2026-07-07T06:00:00',
  },
  {
    id: 'n8',
    category: 'system',
    severity: 'warning',
    title: 'Data Quality Warning',
    body: '4 accounts have missing income data — risk scores may be underestimated. Please review.',
    read: true,
    timestamp: '2026-07-06T08:30:00',
    link: '/portfolio',
  },
]

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

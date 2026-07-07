import { useState } from 'react'
import { Bell, X, CheckCheck, AlertTriangle, TrendingUp, Shield, Zap, Info, AlertCircle, CheckCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, type NotificationSeverity, type NotificationCategory } from '../context/notification-context'

const severityIcon: Record<NotificationSeverity, React.ReactNode> = {
  critical: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />,
  warning:  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />,
  info:     <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />,
  success:  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />,
}

const categoryIcon: Record<NotificationCategory, React.ReactNode> = {
  risk_spike:              <TrendingUp className="h-3.5 w-3.5" />,
  escalation:              <AlertTriangle className="h-3.5 w-3.5" />,
  approval_required:       <Shield className="h-3.5 w-3.5" />,
  rule_change:             <Zap className="h-3.5 w-3.5" />,
  auto_approval_exception: <AlertTriangle className="h-3.5 w-3.5" />,
  system:                  <Info className="h-3.5 w-3.5" />,
  outcome_alert:           <CheckCircle className="h-3.5 w-3.5" />,
}

const categoryLabel: Record<NotificationCategory, string> = {
  risk_spike:              'Risk Spike',
  escalation:              'Escalation',
  approval_required:       'Approval Required',
  rule_change:             'Rule Change',
  auto_approval_exception: 'Auto-Approval Exception',
  system:                  'System',
  outcome_alert:           'Outcome Alert',
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationPanel() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'critical' | 'warning' | 'info'>('all')

  const filtered = notifications.filter(n => {
    if (tab === 'all') return true
    if (tab === 'critical') return n.severity === 'critical'
    if (tab === 'warning') return n.severity === 'warning'
    if (tab === 'info') return n.severity === 'info' || n.severity === 'success'
    return true
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<button className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" />}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-1.5">{unreadCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark all read
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full rounded-none border-b h-9 bg-transparent px-4 gap-1 justify-start">
            <TabsTrigger value="all" className="text-xs h-7 px-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">All</TabsTrigger>
            <TabsTrigger value="critical" className="text-xs h-7 px-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Critical</TabsTrigger>
            <TabsTrigger value="warning" className="text-xs h-7 px-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Warning</TabsTrigger>
            <TabsTrigger value="info" className="text-xs h-7 px-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Info</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            <ScrollArea className="h-[380px]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <span className="text-sm">No notifications</span>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map(n => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="mt-0.5">{severityIcon[n.severity]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-muted-foreground">{categoryIcon[n.category]}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{categoryLabel[n.category]}</span>
                              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                            </div>
                            <p className="text-sm font-medium leading-tight">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 mt-0.5"
                            onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

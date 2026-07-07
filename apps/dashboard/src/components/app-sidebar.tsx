import { LayoutDashboard, Wallet, ClipboardCheck, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRole } from '../context/role-context'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

const roleLabel: Record<string, string> = {
  director: 'Director',
  manager: 'Manager',
  analyst: 'Analyst',
  admin: 'Admin',
}

export function AppSidebar() {
  const { location } = useRouterState()
  const currentPath = '/' + location.pathname.split('/')[1]
  const { currentUser } = useRole()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
            GT
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">GoTyme</span>
            <span className="text-xs text-muted-foreground truncate">Collections</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={item.to === currentPath}
                    render={<Link to={item.to} />}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground truncate">{roleLabel[currentUser.role]}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

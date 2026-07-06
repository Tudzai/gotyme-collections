import { LayoutDashboard, Wallet, ClipboardCheck, TrendingUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/outcomes', label: 'Outcomes', icon: TrendingUp },
] as const

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            GT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">GoTyme</span>
            <span className="text-xs text-muted-foreground">Collections</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton render={<Link to={item.to} />}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">JC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">J. Cruz</span>
            <span className="text-xs text-muted-foreground">Collections Analyst</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

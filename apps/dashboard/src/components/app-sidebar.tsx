import { LayoutDashboard, Wallet, ClipboardCheck, Settings, ChevronUp } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  director: 'default',
  manager: 'secondary',
  analyst: 'outline',
  admin: 'default',
}

export function AppSidebar() {
  const { location } = useRouterState()
  const currentPath = '/' + location.pathname.split('/')[1]
  const { currentUser, setUser, users } = useRole()

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

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-sidebar-accent transition-colors" />
            }
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 items-start">
              <span className="text-sm font-medium truncate leading-none">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground truncate leading-none mt-0.5">{roleLabel[currentUser.role]}</span>
            </div>
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch User</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {users.map(user => (
                <DropdownMenuItem
                  key={user.name}
                  onClick={() => setUser(user.name)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                  <Badge variant={roleBadgeVariant[user.role]} className="text-xs">
                    {roleLabel[user.role]}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

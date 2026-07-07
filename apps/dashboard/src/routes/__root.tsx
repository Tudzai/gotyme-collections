import { createRootRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronDown } from 'lucide-react'
import { AppSidebar } from '../components/app-sidebar'
import { NotificationPanel } from '../components/notification-panel'
import { useRouterState } from '@tanstack/react-router'
import { FilterProvider } from '../context/filter-context'
import { RoleProvider, useRole } from '../context/role-context'
import { NotificationProvider } from '../context/notification-context'
import { useState, useRef, useCallback } from 'react'

const MIN_WIDTH = 180
const MAX_WIDTH = 320
const DEFAULT_WIDTH = 240
const STORAGE_KEY = 'sidebar-width'

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/approvals': 'Approvals',
  '/settings': 'Settings',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  director: 'default',
  manager: 'secondary',
  analyst: 'outline',
  admin: 'default',
}

const roleLabel: Record<string, string> = {
  director: 'Director',
  manager: 'Manager',
  analyst: 'Analyst',
  admin: 'Admin',
}

function HeaderContent() {
  const { location } = useRouterState()
  const pathKey = '/' + location.pathname.split('/')[1]
  const label = pageLabels[pathKey] ?? 'Account Detail'
  const { currentUser, setUser, users } = useRole()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <NotificationPanel />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors" />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">{roleLabel[currentUser.role]}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
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
      </div>
    </header>
  )
}

function SidebarDragHandle({ sidebarWidth, onWidthChange }: { sidebarWidth: number; onWidthChange: (w: number) => void }) {
  const { open } = useSidebar()
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const delta = e.clientX - startX.current
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
    onWidthChange(newWidth)
  }, [onWidthChange])

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    localStorage.setItem(STORAGE_KEY, String(sidebarWidth))
  }, [onMouseMove, sidebarWidth])

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = sidebarWidth
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  if (!open) return null

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ left: sidebarWidth - 2, position: 'fixed', top: 0, bottom: 0, width: 4, zIndex: 30 }}
      className="cursor-col-resize hover:bg-primary/30 transition-colors"
    />
  )
}

function RootLayout() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(stored, 10))) : DEFAULT_WIDTH
  })

  return (
    <FilterProvider>
      <RoleProvider>
        <NotificationProvider>
          <TooltipProvider>
            <SidebarProvider style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}>
              <AppSidebar />
              <SidebarDragHandle sidebarWidth={sidebarWidth} onWidthChange={setSidebarWidth} />
              <SidebarInset>
                <HeaderContent />
                <main className="flex-1 overflow-auto p-6">
                  <Outlet />
                </main>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </NotificationProvider>
      </RoleProvider>
    </FilterProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})

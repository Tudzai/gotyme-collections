import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '../components/app-sidebar'
import { NotificationPanel } from '../components/notification-panel'
import { FilterProvider } from '../context/filter-context'
import { RoleProvider } from '../context/role-context'
import { NotificationProvider } from '../context/notification-context'

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/approvals': 'Approvals',
  '/settings': 'Settings',
}

function HeaderContent() {
  const { location } = useRouterState()
  const pathKey = '/' + location.pathname.split('/')[1]
  const label = pageLabels[pathKey] ?? 'Account Detail'

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
      </div>
    </header>
  )
}

function RootLayout() {
  const { location } = useRouterState()
  const isDemo = location.pathname.startsWith('/demo')

  if (isDemo) {
    return (
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    )
  }

  return (
    <FilterProvider>
      <RoleProvider>
        <NotificationProvider>
          <TooltipProvider>
            <SidebarProvider style={{ '--sidebar-width': '160px' } as React.CSSProperties}>
              <AppSidebar />
              <SidebarInset className="min-w-0">
                <HeaderContent />
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
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

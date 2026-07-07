import { createRootRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '../components/app-sidebar'
import { useRouterState } from '@tanstack/react-router'
import { FilterProvider } from '../context/filter-context'

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/approvals': 'Approvals',
  '/outcomes': 'Outcomes',
}

function RootLayout() {
  const { location } = useRouterState()
  const pathKey = '/' + location.pathname.split('/')[1]
  const label = pageLabels[pathKey] ?? 'Account Detail'

  return (
    <FilterProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </FilterProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})

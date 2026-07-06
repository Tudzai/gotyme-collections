import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardPage } from "./pages/dashboard"
import { PortfolioPage } from "./pages/portfolio"
import { AccountDetailPage } from "./pages/account-detail"
import { ApprovalsPage } from "./pages/approvals"
import { OutcomesPage } from "./pages/outcomes"
import type { PageId } from "./data/types"

const pageLabels: Record<PageId, string> = {
  dashboard: "Dashboard",
  portfolio: "Portfolio",
  "account-detail": "Account Detail",
  approvals: "Approvals",
  outcomes: "Outcomes",
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  function navigateToAccount(accountId: string) {
    setSelectedAccountId(accountId)
    setCurrentPage("account-detail")
  }

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} onViewAccount={navigateToAccount} />
      case "portfolio":
        return <PortfolioPage onViewAccount={navigateToAccount} />
      case "account-detail":
        return <AccountDetailPage accountId={selectedAccountId} onBack={() => setCurrentPage("portfolio")} />
      case "approvals":
        return <ApprovalsPage />
      case "outcomes":
        return <OutcomesPage />
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageLabels[currentPage]}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {renderPage()}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App

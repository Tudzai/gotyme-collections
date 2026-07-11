import { useState } from 'react'
import { demoAccounts } from './data'
import type { ApprovalStatus } from './data'
import { PortfolioView } from './portfolio-view'
import { RiskExplanationModal } from './customer-detail'
import { TreatmentModal } from './customer-detail'
import { DashboardView } from './dashboard-view'

type View = 'portfolio' | 'dashboard'

export function DemoPage() {
  const [view, setView] = useState<View>('portfolio')
  const [statuses, setStatuses] = useState<Record<string, ApprovalStatus>>({})
  const [riskModal, setRiskModal] = useState<string | null>(null)
  const [treatmentModal, setTreatmentModal] = useState<string | null>(null)

  const riskAccount = riskModal ? demoAccounts.find(a => a.id === riskModal) ?? null : null
  const treatmentAccount = treatmentModal ? demoAccounts.find(a => a.id === treatmentModal) ?? null : null

  function handleApprove(id: string) {
    setStatuses(prev => ({ ...prev, [id]: 'approved' }))
    setTreatmentModal(null)
  }

  function handleEscalate(id: string) {
    setStatuses(prev => ({ ...prev, [id]: 'escalated' }))
    setTreatmentModal(null)
  }

  function handleReject(id: string) {
    setStatuses(prev => ({ ...prev, [id]: 'rejected' }))
    setTreatmentModal(null)
  }

  function handleViewReason(id: string) {
    setRiskModal(id)
  }

  function handleViewTreatment() {
    if (riskModal) {
      setTreatmentModal(riskModal)
      setRiskModal(null)
    }
  }

  if (view === 'dashboard') {
    return <DashboardView onGoToPortfolio={() => setView('portfolio')} />
  }

  return (
    <>
      <PortfolioView
        accounts={demoAccounts}
        statuses={statuses}
        onViewReason={handleViewReason}
        onGoToDashboard={() => setView('dashboard')}
      />

      <RiskExplanationModal
        account={riskAccount}
        onClose={() => setRiskModal(null)}
        onViewTreatment={handleViewTreatment}
      />

      <TreatmentModal
        account={treatmentAccount}
        onClose={() => setTreatmentModal(null)}
        onApprove={handleApprove}
        onEscalate={handleEscalate}
        onReject={handleReject}
      />
    </>
  )
}

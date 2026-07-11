import { createContext, useContext, useState } from 'react'
import type { ApprovalStatus } from '../data/types'

interface ApprovalContextValue {
  overrides: Record<string, ApprovalStatus>
  setApproval: (recommendationId: string, status: ApprovalStatus) => void
}

const ApprovalContext = createContext<ApprovalContextValue | null>(null)

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ApprovalStatus>>({})

  function setApproval(recommendationId: string, status: ApprovalStatus) {
    setOverrides(prev => ({ ...prev, [recommendationId]: status }))
  }

  return (
    <ApprovalContext.Provider value={{ overrides, setApproval }}>
      {children}
    </ApprovalContext.Provider>
  )
}

export function useApproval() {
  const ctx = useContext(ApprovalContext)
  if (!ctx) throw new Error('useApproval must be used within ApprovalProvider')
  return ctx
}

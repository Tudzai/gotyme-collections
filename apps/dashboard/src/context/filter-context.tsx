import { createContext, useContext, useState } from 'react'
import type { FilterState, Channel } from '../data/types'

const defaultFilters: FilterState = {
  duration: '30d',
  product: 'all',
  riskLevel: 'all',
  dueWindow: 'all',
  channel: 'all',
}

interface FilterContextValue {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  function resetFilters() { setFilters(defaultFilters) }
  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}

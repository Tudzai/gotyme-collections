import { useFilters } from '../context/filter-context'
import type { FilterState } from '../data/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { CollapsibleTrigger } from '@/components/ui/collapsible'

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
        {label}
      </span>
      {children}
    </div>
  )
}

const DURATION_LABELS: Record<string, string> = {
  today: 'Today', '7d': '7 Days', '14d': '14 Days', '30d': '30 Days',
  mtd: 'MTD', qtd: 'QTD', custom: 'Custom',
}

const ACTIVE_DURATION_PRESETS = ['today', '7d', '14d', '30d', 'mtd', 'qtd'] as const

function getActiveFilterChips(filters: FilterState): { key: keyof FilterState; label: string; value: string }[] {
  const chips: { key: keyof FilterState; label: string; value: string }[] = []
  if (filters.duration !== '30d') chips.push({ key: 'duration', label: 'Duration', value: DURATION_LABELS[filters.duration] ?? filters.duration })
  if (filters.product !== 'all') chips.push({ key: 'product', label: 'Product', value: filters.product })
  if (filters.riskLevel !== 'all') chips.push({ key: 'riskLevel', label: 'Risk', value: filters.riskLevel.charAt(0).toUpperCase() + filters.riskLevel.slice(1) })
  if (filters.dueWindow !== 'all') chips.push({ key: 'dueWindow', label: 'Due', value: filters.dueWindow + ' days' })
  if (filters.channel !== 'all') chips.push({ key: 'channel', label: 'Channel', value: filters.channel.charAt(0).toUpperCase() + filters.channel.slice(1) })
  if (filters.owner && filters.owner !== 'all') chips.push({ key: 'owner', label: 'Owner', value: filters.owner })
  if (filters.startDate) chips.push({ key: 'startDate', label: 'From', value: filters.startDate })
  if (filters.endDate) chips.push({ key: 'endDate', label: 'To', value: filters.endDate })
  return chips
}

const defaultValues: Partial<FilterState> = {
  duration: '30d', product: 'all', riskLevel: 'all', dueWindow: 'all',
  channel: 'all', owner: 'all', startDate: undefined, endDate: undefined,
}

/** Trigger button — place inside a <Collapsible> */
export function FiltersTrigger({ open }: { open: boolean }) {
  const { filters } = useFilters()
  const chips = getActiveFilterChips(filters)
  const hasActive = chips.length > 0

  return (
    <CollapsibleTrigger
      render={<Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium" />}
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
      Filters
      {hasActive && (
        <Badge variant="default" className="h-4 px-1 text-[10px] ml-0.5">
          {chips.length}
        </Badge>
      )}
      {open ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
    </CollapsibleTrigger>
  )
}

/** Active chips row — place next to trigger when collapsed */
export function FilterChips() {
  const { filters, setFilter, resetFilters } = useFilters()
  const chips = getActiveFilterChips(filters)
  if (chips.length === 0) return null

  function removeChip(key: keyof FilterState) {
    setFilter(key, defaultValues[key] as FilterState[typeof key])
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map(chip => (
        <Badge key={chip.key} variant="secondary" className="text-xs h-6 gap-1 font-normal">
          <span className="text-muted-foreground">{chip.label}:</span>
          {chip.value}
          <button
            onClick={() => removeChip(chip.key)}
            className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground" onClick={resetFilters}>
        Clear All
      </Button>
    </div>
  )
}

/** Expanded panel content — place inside <CollapsibleContent> */
export function FiltersPanel() {
  const { filters, setFilter, resetFilters } = useFilters()

  return (
    <div className="p-4 border rounded-lg bg-muted/30 flex flex-col gap-4">
      {/* Date presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date Range</span>
        <div className="flex items-center gap-1 flex-wrap">
          {ACTIVE_DURATION_PRESETS.map(preset => (
            <Button
              key={preset}
              variant={filters.duration === preset ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                setFilter('duration', preset)
                setFilter('startDate', undefined)
                setFilter('endDate', undefined)
              }}
            >
              {DURATION_LABELS[preset]}
            </Button>
          ))}
          <Button
            variant={filters.duration === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setFilter('duration', 'custom')}
          >
            Custom
          </Button>
        </div>
        {filters.duration === 'custom' && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <FilterField label="Start Date">
              <Input type="date" className="h-8 w-[140px] text-xs" value={filters.startDate ?? ''} onChange={e => setFilter('startDate', e.target.value || undefined)} />
            </FilterField>
            <FilterField label="End Date">
              <Input type="date" className="h-8 w-[140px] text-xs" value={filters.endDate ?? ''} onChange={e => setFilter('endDate', e.target.value || undefined)} />
            </FilterField>
          </div>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-row flex-wrap gap-3 items-end">
        <FilterField label="Product">
          <Select value={filters.product} onValueChange={(v) => setFilter('product', v as FilterState['product'])}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="Personal Loan">Personal Loan</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Mortgage">Mortgage</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Risk Level">
          <Select value={filters.riskLevel} onValueChange={(v) => setFilter('riskLevel', v as FilterState['riskLevel'])}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Due Window">
          <Select value={filters.dueWindow} onValueChange={(v) => setFilter('dueWindow', v as FilterState['dueWindow'])}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Windows</SelectItem>
              <SelectItem value="0-3">0–3 Days</SelectItem>
              <SelectItem value="4-7">4–7 Days</SelectItem>
              <SelectItem value="8-14">8–14 Days</SelectItem>
              <SelectItem value="15+">15+ Days</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Channel">
          <Select value={filters.channel} onValueChange={(v) => setFilter('channel', v as FilterState['channel'])}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Owner">
          <Select value={filters.owner ?? 'all'} onValueChange={(v) => setFilter('owner', v)}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              <SelectItem value="J. Cruz">J. Cruz</SelectItem>
              <SelectItem value="M. Tan">M. Tan</SelectItem>
              <SelectItem value="A. Lopez">A. Lopez</SelectItem>
              <SelectItem value="R. Santos">R. Santos</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <Button variant="outline" size="sm" className="h-8 text-xs self-end" onClick={resetFilters}>
          Reset
        </Button>
      </div>
    </div>
  )
}

/** Legacy all-in-one component (kept for compatibility) */
export function GlobalFilters() {
  return null
}

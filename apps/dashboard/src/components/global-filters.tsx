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

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
        {label}
      </span>
      {children}
    </div>
  )
}

export function GlobalFilters() {
  const { filters, setFilter, resetFilters } = useFilters()

  return (
    <div className="flex flex-row flex-wrap gap-3 items-end">
      <FilterField label="Duration">
        <Select
          value={filters.duration}
          onValueChange={(value) => setFilter('duration', value as FilterState['duration'])}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="14d">14 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="mtd">MTD</SelectItem>
            <SelectItem value="qtd">QTD</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Product">
        <Select
          value={filters.product}
          onValueChange={(value) => setFilter('product', value as FilterState['product'])}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Mortgage">Mortgage</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Risk Level">
        <Select
          value={filters.riskLevel}
          onValueChange={(value) => setFilter('riskLevel', value as FilterState['riskLevel'])}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
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
        <Select
          value={filters.dueWindow}
          onValueChange={(value) => setFilter('dueWindow', value as FilterState['dueWindow'])}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
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
        <Select
          value={filters.channel}
          onValueChange={(value) => setFilter('channel', value as FilterState['channel'])}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
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

      <Button variant="outline" size="sm" className="h-8 text-xs self-end" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  )
}

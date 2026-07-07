import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { DataTable, type ColumnDef } from './data-table'

export type { ColumnDef }

interface DetailModalProps<T extends Record<string, unknown>> {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  columns: ColumnDef<T>[]
  data: T[]
  activeFilter?: { label: string; value: string }
  onClearFilter?: () => void
  exportFilename?: string
}

export function DetailModal<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  subtitle,
  columns,
  data,
  activeFilter,
  onClearFilter,
  exportFilename = 'detail-export',
}: DetailModalProps<T>) {
  const filteredData = activeFilter
    ? data.filter(row =>
        Object.values(row).some(val =>
          val !== null &&
          val !== undefined &&
          String(val).toLowerCase().includes(activeFilter.value.toLowerCase())
        )
      )
    : data

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {activeFilter && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Filtered by:</span>
              <Badge variant="secondary" className="text-xs gap-1">
                {activeFilter.label}: {activeFilter.value}
                <button
                  onClick={onClearFilter}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={onClearFilter}
              >
                Clear
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          <DataTable<T>
            columns={columns}
            data={filteredData}
            searchable
            searchPlaceholder="Search records…"
            pageSize={10}
            stickyHeader
            exportFilename={exportFilename}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  exportFilename = 'detail-export',
}: DetailModalProps<T>) {
  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="!max-w-5xl w-[min(90vw,1024px)] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          <DataTable<T>
            columns={columns}
            data={data}
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

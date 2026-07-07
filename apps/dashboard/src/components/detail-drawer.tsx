import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { DataTable, type ColumnDef } from "./data-table"

export type { ColumnDef }

interface ActiveFilter {
  label: string
  value: string
}

interface DetailDrawerProps<T extends Record<string, unknown>> {
  open: boolean
  onClose: () => void
  title: string
  columns: ColumnDef<T>[]
  data: T[]
  activeFilter?: ActiveFilter
  onClearFilter?: () => void
}

export function DetailDrawer<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  columns,
  data,
  activeFilter,
  onClearFilter,
}: DetailDrawerProps<T>) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:w-[80vw] sm:max-w-none flex flex-col p-0"
      >
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <SheetTitle className="truncate">{title}</SheetTitle>

            {activeFilter && (
              <Badge
                variant="secondary"
                className="flex shrink-0 items-center gap-1"
              >
                <span>{activeFilter.label}: {activeFilter.value}</span>
                {onClearFilter && (
                  <button
                    type="button"
                    onClick={onClearFilter}
                    className="ml-0.5 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={`Clear filter: ${activeFilter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close drawer"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-auto p-4">
          <DataTable
            columns={columns}
            data={data}
            searchable
            stickyHeader
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

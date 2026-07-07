import React, { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColumnDef<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  rowExpansion?: (row: T) => React.ReactNode
  checkboxSelection?: boolean
  onSelectionChange?: (selected: T[]) => void
  stickyHeader?: boolean
  exportFilename?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRowId<T extends Record<string, unknown>>(row: T, index: number): string {
  if ("id" in row && (typeof row.id === "string" || typeof row.id === "number")) {
    return String(row.id)
  }
  return String(index)
}

function getCellValue<T extends Record<string, unknown>>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function matchesSearch<T extends Record<string, unknown>>(row: T, query: string): boolean {
  const lower = query.toLowerCase()
  return Object.values(row).some((val) => {
    if (val === null || val === undefined) return false
    if (typeof val === "string") return val.toLowerCase().includes(lower)
    if (typeof val === "number") return String(val).includes(lower)
    return false
  })
}

function rowsToCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[]
): string {
  const header = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",")
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = getCellValue(row, c.key)
        const str = val === null || val === undefined ? "" : String(val)
        return `"${str.replace(/"/g, '""')}"`
      })
      .join(",")
  )
  return [header, ...body].join("\n")
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = "Search…",
  pageSize: initialPageSize = 10,
  rowExpansion,
  checkboxSelection = false,
  onSelectionChange,
  stickyHeader = false,
  exportFilename = "export",
}: DataTableProps<T>) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Reset to page 1 when search/sort/pageSize changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortKey, sortDir, pageSize])

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data
    return data.filter((row) => matchesSearch(row, searchQuery))
  }, [data, searchQuery])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = getCellValue(a, sortKey)
      const bv = getCellValue(b, sortKey)
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      if (as < bs) return sortDir === "asc" ? -1 : 1
      if (as > bs) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalRows = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, totalRows)
  const pageRows = sorted.slice(startIdx, endIdx)

  // Total column count for colSpan calculations
  const colCount =
    columns.length +
    (checkboxSelection ? 1 : 0) +
    (rowExpansion ? 1 : 0)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortKey(key)
        setSortDir("asc")
      }
    },
    [sortKey]
  )

  const toggleExpand = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        if (onSelectionChange) {
          onSelectionChange(sorted.filter((r, i) => next.has(getRowId(r, i))))
        }
        return next
      })
    },
    [sorted, onSelectionChange]
  )

  const allPageSelected =
    pageRows.length > 0 &&
    pageRows.every((row, i) => selectedRows.has(getRowId(row, startIdx + i)))

  const somePageSelected =
    !allPageSelected &&
    pageRows.some((row, i) => selectedRows.has(getRowId(row, startIdx + i)))

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        pageRows.forEach((row, i) => next.delete(getRowId(row, startIdx + i)))
      } else {
        pageRows.forEach((row, i) => next.add(getRowId(row, startIdx + i)))
      }
      if (onSelectionChange) {
        onSelectionChange(sorted.filter((r, i) => next.has(getRowId(r, i))))
      }
      return next
    })
  }, [allPageSelected, pageRows, startIdx, sorted, onSelectionChange])

  const handleExport = useCallback(() => {
    const csv = rowsToCSV(sorted, columns)
    downloadCSV(csv, exportFilename)
  }, [sorted, columns, exportFilename])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader
            className={
              stickyHeader
                ? "sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]"
                : undefined
            }
          >
            <TableRow>
              {/* Checkbox header */}
              {checkboxSelection && (
                <TableHead className="w-10 px-3">
                  <Checkbox
                    checked={
                      allPageSelected ? true : somePageSelected ? "indeterminate" : false
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all on this page"
                  />
                </TableHead>
              )}

              {/* Expand header spacer */}
              {rowExpansion && <TableHead className="w-10 px-3" />}

              {/* Column headers */}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.className}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={
                    col.sortable ? { cursor: "pointer", userSelect: "none" } : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex flex-col -space-y-1 text-muted-foreground/40">
                        <ChevronUp
                          className={`h-3 w-3 transition-colors ${
                            sortKey === col.key && sortDir === "asc"
                              ? "text-foreground"
                              : ""
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 transition-colors ${
                            sortKey === col.key && sortDir === "desc"
                              ? "text-foreground"
                              : ""
                          }`}
                        />
                      </span>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, localIdx) => {
                const absIdx = startIdx + localIdx
                const rowId = getRowId(row, absIdx)
                const isExpanded = expandedRows.has(rowId)
                const isSelected = selectedRows.has(rowId)

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      data-state={isSelected ? "selected" : undefined}
                      className={isSelected ? "bg-muted/40" : undefined}
                    >
                      {/* Checkbox cell */}
                      {checkboxSelection && (
                        <TableCell className="w-10 px-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(rowId)}
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}

                      {/* Expand toggle cell */}
                      {rowExpansion && (
                        <TableCell className="w-10 px-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleExpand(rowId)}
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            aria-expanded={isExpanded}
                          >
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </Button>
                        </TableCell>
                      )}

                      {/* Data cells */}
                      {columns.map((col) => (
                        <TableCell key={col.key} className={col.className}>
                          {col.render
                            ? col.render(row)
                            : (() => {
                                const val = getCellValue(row, col.key)
                                return val === null || val === undefined
                                  ? "—"
                                  : String(val)
                              })()}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expansion row */}
                    {rowExpansion && isExpanded && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={colCount} className="px-6 py-4">
                          {rowExpansion(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-1">
        <p className="text-sm text-muted-foreground shrink-0">
          {totalRows === 0
            ? "No results"
            : `Showing ${startIdx + 1}–${endIdx} of ${totalRows}`}
        </p>

        <div className="flex items-center gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Rows per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

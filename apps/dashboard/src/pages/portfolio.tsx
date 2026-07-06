import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Eye } from "lucide-react"
import { RiskBadge } from "../components/risk-badge"
import { accounts } from "../data/mock-data"
import type { RiskLevel } from "../data/types"

interface PortfolioPageProps {
  onViewAccount: (accountId: string) => void
}

export function PortfolioPage({ onViewAccount }: PortfolioPageProps) {
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all")
  const [productFilter, setProductFilter] = useState<string>("all")

  const filtered = accounts.filter((a) => {
    if (riskFilter !== "all" && a.riskLevel !== riskFilter) return false
    if (productFilter !== "all" && a.product !== productFilter) return false
    return true
  }).sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Mortgage">Mortgage</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} accounts
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((account) => (
              <TableRow key={account.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewAccount(account.id)}>
                <TableCell>
                  <div>
                    <p className="font-medium">{account.customerName}</p>
                    <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                  </div>
                </TableCell>
                <TableCell>{account.product}</TableCell>
                <TableCell className="text-right font-mono">
                  ₱{account.outstandingBalance.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{account.dueDate}</p>
                    <p className="text-xs text-muted-foreground">{account.daysUntilDue}d remaining</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono w-6">{account.riskScore}</span>
                    <Progress value={account.riskScore} className="h-2 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <RiskBadge level={account.riskLevel} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onViewAccount(account.id) }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

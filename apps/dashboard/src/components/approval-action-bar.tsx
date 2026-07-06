import { Button } from "@/components/ui/button"
import { Check, X, Pencil, ArrowUpRight } from "lucide-react"

interface ApprovalActionBarProps {
  onApprove: () => void
  onReject: () => void
  onEdit?: () => void
  onEscalate?: () => void
}

export function ApprovalActionBar({ onApprove, onReject, onEdit, onEscalate }: ApprovalActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Check className="mr-1 h-3.5 w-3.5" />
        Approve
      </Button>
      {onEdit && (
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" />
          Edit
        </Button>
      )}
      <Button size="sm" variant="destructive" onClick={onReject}>
        <X className="mr-1 h-3.5 w-3.5" />
        Reject
      </Button>
      {onEscalate && (
        <Button size="sm" variant="secondary" onClick={onEscalate}>
          <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
          Escalate
        </Button>
      )}
    </div>
  )
}

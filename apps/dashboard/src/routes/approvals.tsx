import { createFileRoute } from '@tanstack/react-router'
import { ApprovalsPage } from '../pages/approvals'

export const Route = createFileRoute('/approvals')({
  component: ApprovalsPage,
})

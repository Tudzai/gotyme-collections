import { createFileRoute } from '@tanstack/react-router'
import { OutcomesPage } from '../pages/outcomes'

export const Route = createFileRoute('/outcomes')({
  component: OutcomesPage,
})

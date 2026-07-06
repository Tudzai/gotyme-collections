import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../pages/dashboard'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  return (
    <DashboardPage
      onNavigate={(path) => navigate({ to: path as '/' })}
      onViewAccount={(accountId) => navigate({ to: '/portfolio/$accountId', params: { accountId } })}
    />
  )
}

import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { PortfolioPage } from '../pages/portfolio'
import { AccountDetailPage } from '../pages/account-detail'

export const Route = createFileRoute('/portfolio')({
  component: Portfolio,
})

function Portfolio() {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const match = location.pathname.match(/^\/portfolio\/(.+)$/)
  const accountId = match ? match[1] : null

  if (accountId) {
    return (
      <AccountDetailPage
        accountId={accountId}
        onBack={() => navigate({ to: '/portfolio' })}
      />
    )
  }

  return (
    <PortfolioPage
      onViewAccount={(id) => navigate({ to: '/portfolio/$accountId', params: { accountId: id } })}
    />
  )
}

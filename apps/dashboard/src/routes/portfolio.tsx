import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PortfolioPage } from '../pages/portfolio'

export const Route = createFileRoute('/portfolio')({
  component: Portfolio,
})

function Portfolio() {
  const navigate = useNavigate()
  return (
    <PortfolioPage
      onViewAccount={(accountId) => navigate({ to: '/portfolio/$accountId', params: { accountId } })}
    />
  )
}

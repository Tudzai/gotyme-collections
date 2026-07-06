import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AccountDetailPage } from '../pages/account-detail'

export const Route = createFileRoute('/portfolio/$accountId')({
  component: AccountDetail,
})

function AccountDetail() {
  const { accountId } = Route.useParams()
  const navigate = useNavigate()
  return (
    <AccountDetailPage
      accountId={accountId}
      onBack={() => navigate({ to: '/portfolio' })}
    />
  )
}

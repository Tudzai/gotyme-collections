import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableIcon, X } from 'lucide-react'
import { GlobalFilters } from '../../components/global-filters'
import { DetailModal, type ColumnDef as DetailColDef } from '../../components/detail-modal'
import { OverviewTab } from './overview-tab'
import { ActionTab } from './action-tab'
import { OutcomeTab } from './outcome-tab'
import { accounts } from '../../data/mock-data'

type ActiveTab = 'overview' | 'action' | 'outcome'

// ---------------------------------------------------------------------------
// Detail row shapes
// ---------------------------------------------------------------------------

interface OverviewDetailRow extends Record<string, unknown> {
  customer: string; accountNumber: string; product: string
  outstandingBalance: string; dueDate: string; daysUntilDue: number
  riskScore: number; riskLevel: string; status: string
}

interface ActionDetailRow extends Record<string, unknown> {
  actionId: string; customer: string; product: string; riskScore: number
  riskLevel: string; channel: string; approvalStatus: string
  owner: string; dueTime: string; autoApprovalEligible: string
}

interface OutcomeDetailRow extends Record<string, unknown> {
  customer: string; product: string; channel: string
  paymentOutcome: string; amountRecovered: string
  cost: string; cureFlag: string; daysToCure: string; controlGroup: string
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const overviewColumns: DetailColDef<OverviewDetailRow>[] = [
  { key: 'customer',           header: 'Customer',            sortable: true },
  { key: 'accountNumber',      header: 'Account #'           },
  { key: 'product',            header: 'Product',             sortable: true },
  { key: 'outstandingBalance', header: 'Outstanding Balance', sortable: true },
  { key: 'dueDate',            header: 'Due Date',            sortable: true },
  { key: 'daysUntilDue',       header: 'Days Until Due',      sortable: true },
  { key: 'riskScore',          header: 'Risk Score',          sortable: true },
  { key: 'riskLevel',          header: 'Risk Level',          sortable: true },
  { key: 'status',             header: 'Status',              sortable: true },
]

const actionColumns: DetailColDef<ActionDetailRow>[] = [
  { key: 'actionId',             header: 'Action ID'              },
  { key: 'customer',             header: 'Customer',     sortable: true },
  { key: 'product',              header: 'Product',      sortable: true },
  { key: 'riskScore',            header: 'Risk Score',   sortable: true },
  { key: 'riskLevel',            header: 'Risk Level',   sortable: true },
  { key: 'channel',              header: 'Channel'                },
  { key: 'approvalStatus',       header: 'Approval Status', sortable: true },
  { key: 'owner',                header: 'Owner',        sortable: true },
  { key: 'dueTime',              header: 'Due Time'               },
  { key: 'autoApprovalEligible', header: 'Auto-Approval'          },
]

const outcomeColumns: DetailColDef<OutcomeDetailRow>[] = [
  { key: 'customer',        header: 'Customer',          sortable: true },
  { key: 'product',         header: 'Product',           sortable: true },
  { key: 'channel',         header: 'Channel'            },
  { key: 'paymentOutcome',  header: 'Payment Outcome',   sortable: true },
  { key: 'amountRecovered', header: 'Amount Recovered',  sortable: true },
  { key: 'cost',            header: 'Cost'               },
  { key: 'cureFlag',        header: 'Cured?'             },
  { key: 'daysToCure',      header: 'Days to Cure',      sortable: true },
  { key: 'controlGroup',    header: 'Control Group'      },
]

// ---------------------------------------------------------------------------
// Data mappers
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string { return `₱${n.toLocaleString()}` }
function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1) }

const overviewData: OverviewDetailRow[] = accounts.map(a => ({
  customer:           a.customerName,
  accountNumber:      a.accountNumber,
  product:            a.product,
  outstandingBalance: formatCurrency(a.outstandingBalance),
  dueDate:            a.dueDate,
  daysUntilDue:       a.daysUntilDue,
  riskScore:          a.riskScore,
  riskLevel:          capitalize(a.riskLevel),
  status:             a.previousMissedPayments > 0 ? 'Has Missed Payments' : 'On Track',
}))

const actionData: ActionDetailRow[] = [
  { actionId: 'ACT001', customer: 'Maria Santos',     product: 'Personal Loan', riskScore: 87, riskLevel: 'Critical', channel: 'WhatsApp', approvalStatus: 'Pending',        owner: 'J. Cruz',   dueTime: '2026-07-07 17:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT002', customer: 'Jose Reyes',       product: 'Credit Card',   riskScore: 92, riskLevel: 'Critical', channel: 'Call',     approvalStatus: 'Pending',        owner: 'M. Tan',    dueTime: '2026-07-07 12:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT003', customer: 'Isabella Ramos',   product: 'Credit Card',   riskScore: 82, riskLevel: 'Critical', channel: 'WhatsApp', approvalStatus: 'Pending',        owner: 'A. Lopez',  dueTime: '2026-07-07 17:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT004', customer: 'Lucia Fernandez',  product: 'Personal Loan', riskScore: 79, riskLevel: 'Critical', channel: 'Email',    approvalStatus: 'Approved',       owner: 'J. Cruz',   dueTime: '2026-07-08 17:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT005', customer: 'Gabriel Santos',   product: 'Personal Loan', riskScore: 85, riskLevel: 'Critical', channel: 'Call',     approvalStatus: 'Pending',        owner: 'R. Santos', dueTime: '2026-07-07 10:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT006', customer: 'Teresa Magsaysay', product: 'Personal Loan', riskScore: 76, riskLevel: 'Critical', channel: 'SMS',      approvalStatus: 'Auto-Approved',  owner: 'M. Tan',    dueTime: '2026-07-09 17:00', autoApprovalEligible: 'Yes' },
  { actionId: 'ACT007', customer: 'Ana Garcia',       product: 'Personal Loan', riskScore: 74, riskLevel: 'High',    channel: 'Push',     approvalStatus: 'Auto-Approved',  owner: 'A. Lopez',  dueTime: '2026-07-10 17:00', autoApprovalEligible: 'Yes' },
  { actionId: 'ACT008', customer: 'Angela Rivera',    product: 'Personal Loan', riskScore: 71, riskLevel: 'High',    channel: 'SMS',      approvalStatus: 'Pending',        owner: 'J. Cruz',   dueTime: '2026-07-08 17:00', autoApprovalEligible: 'Yes' },
  { actionId: 'ACT009', customer: 'Carlos Dela Cruz', product: 'Mortgage',      riskScore: 68, riskLevel: 'High',    channel: 'Email',    approvalStatus: 'Pending',        owner: 'M. Tan',    dueTime: '2026-07-10 17:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT010', customer: 'Patricia Lim',     product: 'Credit Card',   riskScore: 61, riskLevel: 'High',    channel: 'Push',     approvalStatus: 'Auto-Approved',  owner: 'A. Lopez',  dueTime: '2026-07-11 17:00', autoApprovalEligible: 'Yes' },
  { actionId: 'ACT011', customer: 'Fernando Gomez',   product: 'Credit Card',   riskScore: 65, riskLevel: 'High',    channel: 'WhatsApp', approvalStatus: 'Pending',        owner: 'R. Santos', dueTime: '2026-07-09 17:00', autoApprovalEligible: 'No'  },
  { actionId: 'ACT012', customer: 'Miguel Torres',    product: 'Personal Loan', riskScore: 55, riskLevel: 'High',    channel: 'Push',     approvalStatus: 'Auto-Approved',  owner: 'M. Tan',    dueTime: '2026-07-12 17:00', autoApprovalEligible: 'Yes' },
]

const outcomeData: OutcomeDetailRow[] = [
  { customer: 'Maria Santos',      product: 'Personal Loan', channel: 'SMS',      paymentOutcome: 'Cured',       amountRecovered: formatCurrency(4520),  cost: '₱2.10',  cureFlag: 'Yes', daysToCure: '5',  controlGroup: 'No'  },
  { customer: 'Jose Reyes',        product: 'Credit Card',   channel: 'Call',     paymentOutcome: 'No Response', amountRecovered: formatCurrency(0),     cost: '₱18.50', cureFlag: 'No',  daysToCure: '—',  controlGroup: 'No'  },
  { customer: 'Carlos Dela Cruz',  product: 'Mortgage',      channel: 'SMS',      paymentOutcome: 'Cured',       amountRecovered: formatCurrency(18200), cost: '₱2.10',  cureFlag: 'Yes', daysToCure: '3',  controlGroup: 'No'  },
  { customer: 'Isabella Ramos',    product: 'Credit Card',   channel: 'WhatsApp', paymentOutcome: 'Cured',       amountRecovered: formatCurrency(2060),  cost: '₱3.20',  cureFlag: 'Yes', daysToCure: '4',  controlGroup: 'No'  },
  { customer: 'Miguel Torres',     product: 'Personal Loan', channel: 'Push',     paymentOutcome: 'Cured',       amountRecovered: formatCurrency(3560),  cost: '₱0.80',  cureFlag: 'Yes', daysToCure: '6',  controlGroup: 'No'  },
  { customer: 'Lucia Fernandez',   product: 'Personal Loan', channel: 'Email',    paymentOutcome: 'Cured',       amountRecovered: formatCurrency(5670),  cost: '₱1.50',  cureFlag: 'Yes', daysToCure: '2',  controlGroup: 'No'  },
  { customer: 'Rafael Mendoza',    product: 'Personal Loan', channel: 'Push',     paymentOutcome: 'Partial',     amountRecovered: formatCurrency(945),   cost: '₱0.80',  cureFlag: 'No',  daysToCure: '—',  controlGroup: 'Yes' },
  { customer: 'Carmen Villanueva', product: 'Mortgage',      channel: 'Email',    paymentOutcome: 'Cured',       amountRecovered: formatCurrency(14200), cost: '₱1.50',  cureFlag: 'Yes', daysToCure: '7',  controlGroup: 'Yes' },
  { customer: 'Patricia Lim',      product: 'Credit Card',   channel: 'Push',     paymentOutcome: 'Partial',     amountRecovered: formatCurrency(1682),  cost: '₱0.80',  cureFlag: 'No',  daysToCure: '—',  controlGroup: 'No'  },
  { customer: 'Fernando Gomez',    product: 'Credit Card',   channel: 'WhatsApp', paymentOutcome: 'Cured',       amountRecovered: formatCurrency(4605),  cost: '₱3.20',  cureFlag: 'Yes', daysToCure: '8',  controlGroup: 'No'  },
  { customer: 'Ana Garcia',        product: 'Personal Loan', channel: 'Push',     paymentOutcome: 'Cured',       amountRecovered: formatCurrency(2280),  cost: '₱0.80',  cureFlag: 'Yes', daysToCure: '9',  controlGroup: 'No'  },
  { customer: 'Angela Rivera',     product: 'Personal Loan', channel: 'SMS',      paymentOutcome: 'Partial',     amountRecovered: formatCurrency(3920),  cost: '₱2.10',  cureFlag: 'No',  daysToCure: '—',  controlGroup: 'No'  },
]

const drawerTitles: Record<ActiveTab, string> = {
  overview: 'Portfolio Detail — All Accounts',
  action:   'Action Queue Detail',
  outcome:  'Outcome Records Detail',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<{ label: string; value: string } | undefined>(undefined)
  const [chartFilters, setChartFilters] = useState<{ label: string; value: string }[]>([])

  function handleKpiClick(filter: { label: string; value: string }) {
    setActiveFilter(filter)
    setDetailOpen(true)
  }

  function handleChartClick(filter: { label: string; value: string }, event?: React.MouseEvent) {
    const isMulti = event?.ctrlKey || event?.metaKey
    if (isMulti) {
      setChartFilters(prev => {
        const exists = prev.some(f => f.label === filter.label && f.value === filter.value)
        return exists ? prev.filter(f => !(f.label === filter.label && f.value === filter.value)) : [...prev, filter]
      })
    } else {
      setChartFilters(prev => {
        const existing = prev.find(f => f.label === filter.label && f.value === filter.value)
        return (existing && prev.length === 1) ? [] : [filter]
      })
    }
  }

  function handleDetailOpen() {
    setActiveFilter(undefined)
    setDetailOpen(true)
  }

  function handleDetailClose() {
    setDetailOpen(false)
  }

  function handleClearFilter() {
    setActiveFilter(undefined)
  }

  function removeChartFilter(filter: { label: string; value: string }) {
    setChartFilters(prev => prev.filter(f => !(f.label === filter.label && f.value === filter.value)))
  }

  function renderModal() {
    if (activeTab === 'overview') {
      return (
        <DetailModal<OverviewDetailRow>
          open={detailOpen}
          onClose={handleDetailClose}
          title={drawerTitles.overview}
          subtitle="All monitored accounts with risk and status data"
          columns={overviewColumns}
          data={overviewData}
          activeFilter={activeFilter}
          onClearFilter={handleClearFilter}
          exportFilename="portfolio-detail"
        />
      )
    }
    if (activeTab === 'action') {
      return (
        <DetailModal<ActionDetailRow>
          open={detailOpen}
          onClose={handleDetailClose}
          title={drawerTitles.action}
          subtitle="Pending and completed treatment actions"
          columns={actionColumns}
          data={actionData}
          activeFilter={activeFilter}
          onClearFilter={handleClearFilter}
          exportFilename="action-queue-detail"
        />
      )
    }
    return (
      <DetailModal<OutcomeDetailRow>
        open={detailOpen}
        onClose={handleDetailClose}
        title={drawerTitles.outcome}
        subtitle="Treatment outcomes and recovery data"
        columns={outcomeColumns}
        data={outcomeData}
        activeFilter={activeFilter}
        onClearFilter={handleClearFilter}
        exportFilename="outcome-detail"
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Global Filters */}
      <GlobalFilters />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as ActiveTab); setChartFilters([]) }}
        className="w-full"
      >
        {/* Tab bar with Detail button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="action">Action</TabsTrigger>
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDetailOpen}
            className="flex items-center gap-1.5"
          >
            <TableIcon className="h-4 w-4" />
            Detail
          </Button>
        </div>

        {/* Chart filter chips */}
        {chartFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2 px-1">
            <span className="text-xs text-muted-foreground">Chart filters:</span>
            {chartFilters.map(f => (
              <Badge
                key={`${f.label}:${f.value}`}
                variant="secondary"
                className="text-xs gap-1 font-normal"
              >
                <span className="text-muted-foreground">{f.label}:</span>
                {f.value}
                <button
                  onClick={() => removeChartFilter(f)}
                  className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                  aria-label={`Remove ${f.label} filter`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-muted-foreground"
              onClick={() => setChartFilters([])}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Tab content */}
        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            onKpiClick={handleKpiClick}
            onChartClick={(f, e) => handleChartClick(f, e)}
          />
        </TabsContent>

        <TabsContent value="action" className="mt-4">
          <ActionTab
            onKpiClick={handleKpiClick}
            onChartClick={(f, e) => handleChartClick(f, e)}
          />
        </TabsContent>

        <TabsContent value="outcome" className="mt-4">
          <OutcomeTab
            onKpiClick={handleKpiClick}
            onChartClick={(f, e) => handleChartClick(f, e)}
          />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {renderModal()}
    </div>
  )
}

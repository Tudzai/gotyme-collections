import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, XCircle, AlertCircle, Clock, Plus, ShieldCheck } from "lucide-react"
import { DataTable } from "../components/data-table"
import type { ColumnDef } from "../components/data-table"
import {
  treatmentRules,
  autoApprovalRule as initialAutoApprovalRule,
  ruleChanges as initialRuleChanges,
} from "../data/mock-data"
import type { TreatmentRule, AutoApprovalRule, RuleChange, RuleStatus } from "../data/types"
import { useRole } from "../context/role-context"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRoleCan(role: string) {
  return function roleCan(action: "propose" | "approve" | "publish" | "manage_roles" | "edit_drafts") {
    const caps: Record<string, string[]> = {
      analyst: [],
      manager: ["propose", "edit_drafts"],
      director: ["propose", "edit_drafts", "approve", "publish"],
      admin: ["propose", "edit_drafts", "approve", "publish", "manage_roles"],
    }
    return caps[role]?.includes(action) ?? false
  }
}

function ruleStatusBadge(status: RuleStatus) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
          Active
        </Badge>
      )
    case "pending_approval":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
          Pending Approval
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10">
          Rejected
        </Badge>
      )
    case "draft":
      return (
        <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
          Draft
        </Badge>
      )
  }
}

// ---------------------------------------------------------------------------
// Driver weights config
// ---------------------------------------------------------------------------

interface DriverWeight {
  factor: string
  weight: number
}

const INITIAL_DRIVER_WEIGHTS: DriverWeight[] = [
  { factor: "Missed Payments", weight: 30 },
  { factor: "Balance Depletion", weight: 20 },
  { factor: "Utilization Spike", weight: 15 },
  { factor: "Failed Debit", weight: 15 },
  { factor: "Low Salary Inflow", weight: 10 },
  { factor: "Prior Collections", weight: 5 },
  { factor: "New Credit Apps", weight: 3 },
  { factor: "Dormancy Signals", weight: 2 },
]

// ---------------------------------------------------------------------------
// Tab 1: Risk Matrix
// ---------------------------------------------------------------------------

type RoleCanFn = (action: "propose" | "approve" | "publish" | "manage_roles" | "edit_drafts") => boolean

function RiskMatrixTab({ roleCan }: { roleCan: RoleCanFn }) {
  const canEdit = roleCan("propose")

  const [critical, setCritical] = useState(76)
  const [high, setHigh] = useState(51)
  const [medium, setMedium] = useState(26)
  const [weights, setWeights] = useState<DriverWeight[]>(INITIAL_DRIVER_WEIGHTS)

  function updateWeight(index: number, value: string) {
    const num = parseInt(value, 10)
    if (isNaN(num)) return
    setWeights((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], weight: num }
      return next
    })
  }

  const totalWeight = weights.reduce((acc, w) => acc + w.weight, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">Risk Matrix Settings</h2>
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/10">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Director approval required
        </Badge>
        <Badge variant="outline" className="ml-auto text-xs">
          Active Version: v2.3 — Effective Jun 1 2026
        </Badge>
      </div>

      {/* Thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Score Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Critical (≥)", value: critical, onChange: setCritical, color: "text-red-600" },
              { label: "High (≥)", value: high, onChange: setHigh, color: "text-orange-500" },
              { label: "Medium (≥)", value: medium, onChange: setMedium, color: "text-amber-500" },
              { label: "Low (≥)", value: 0, onChange: () => {}, color: "text-emerald-600" },
            ].map(({ label, value, onChange, color }) => (
              <div key={label} className="space-y-1.5">
                <Label className={`text-xs font-medium ${color}`}>{label}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                  disabled={!canEdit || label === "Low (≥)"}
                  className="h-9 text-sm"
                  min={0}
                  max={100}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Weights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Driver Weights
            </CardTitle>
            <span
              className={`text-xs font-medium ${
                totalWeight === 100 ? "text-emerald-600" : "text-destructive"
              }`}
            >
              Total: {totalWeight}%{totalWeight !== 100 && " (must equal 100%)"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Factor</TableHead>
                  <TableHead className="w-32">Weight (%)</TableHead>
                  {canEdit && <TableHead className="w-28">Edit</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {weights.map((w, i) => (
                  <TableRow key={w.factor}>
                    <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{w.factor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-muted flex-1 max-w-20">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, w.weight)}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums w-8">{w.weight}%</span>
                      </div>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Input
                          type="number"
                          value={w.weight}
                          onChange={(e) => updateWeight(i, e.target.value)}
                          className="h-7 w-20 text-sm"
                          min={0}
                          max={100}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {roleCan("propose") && (
        <div className="flex justify-end">
          <Button size="sm" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Propose Change
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 2: Treatment Rules
// ---------------------------------------------------------------------------

const TREATMENT_RULE_COLUMNS: ColumnDef<Record<string, unknown>>[] = [
  {
    key: "condition",
    header: "Condition",
    sortable: true,
    className: "max-w-52",
    render: (row) => (
      <span className="text-sm">{row.condition as string}</span>
    ),
  },
  {
    key: "channel",
    header: "Channel",
    render: (row) => (
      <span className="capitalize text-sm">{row.channel as string}</span>
    ),
  },
  {
    key: "tone",
    header: "Tone",
    render: (row) => (
      <span className="capitalize text-sm">{row.tone as string}</span>
    ),
  },
  {
    key: "timing",
    header: "Timing",
    sortable: true,
    render: (row) => (
      <span className="text-sm">{row.timing as string}</span>
    ),
  },
  {
    key: "escalationPath",
    header: "Escalation Path",
    render: (row) => (
      <span className="text-sm text-muted-foreground">{row.escalationPath as string}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => ruleStatusBadge(row.status as RuleStatus),
  },
]

function TreatmentRulesTab({ roleCan }: { roleCan: RoleCanFn }) {
  const [rules, setRules] = useState<TreatmentRule[]>(treatmentRules)

  const tableData = rules.map((r) => ({ ...r } as unknown as Record<string, unknown>))

  const columns = roleCan("propose")
    ? [
        ...TREATMENT_RULE_COLUMNS,
        {
          key: "actions",
          header: "Actions",
          render: (_row: Record<string, unknown>) => (
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Edit
            </Button>
          ),
        } as ColumnDef<Record<string, unknown>>,
      ]
    : TREATMENT_RULE_COLUMNS

  // Suppress unused variable warning
  void setRules

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Treatment Rules</h2>
        {roleCan("propose") && (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={tableData}
          searchable
          searchPlaceholder="Search rules..."
          pageSize={10}
          exportFilename="treatment-rules"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 3: Auto-Approval Rules
// ---------------------------------------------------------------------------

const EXCLUSION_OPTIONS = [
  "Vulnerable Customer",
  "Legal Hold",
  "Hardship Flag",
  "Complaint Open",
  "Fraud Investigation",
  "Critical Risk",
  "Balance > ₱100K",
  "Custom Message",
]

function AutoApprovalTab({ roleCan }: { roleCan: RoleCanFn }) {
  const [rule, setRule] = useState<AutoApprovalRule>(initialAutoApprovalRule)
  const canEdit = roleCan("propose")

  function toggleTemplate(template: string) {
    if (!canEdit) return
    setRule((prev) => ({
      ...prev,
      approvedTemplates: prev.approvedTemplates.includes(template)
        ? prev.approvedTemplates.filter((t) => t !== template)
        : [...prev.approvedTemplates, template],
    }))
  }

  function toggleExclusion(exclusion: string) {
    if (!canEdit) return
    setRule((prev) => ({
      ...prev,
      exclusions: prev.exclusions.includes(exclusion)
        ? prev.exclusions.filter((e) => e !== exclusion)
        : [...prev.exclusions, exclusion],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">Auto-Approval Rules</h2>
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/10">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Director approval required
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Max Risk Level & Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Eligibility Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Maximum Risk Level</Label>
              <Select
                value={rule.maxRiskLevel}
                onValueChange={(v) =>
                  canEdit &&
                  setRule((prev) => ({ ...prev, maxRiskLevel: v as AutoApprovalRule["maxRiskLevel"] }))
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Accounts above this risk level require manual approval.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Maximum Outstanding Balance (₱)</Label>
              <Input
                type="number"
                value={rule.maxBalance}
                onChange={(e) =>
                  canEdit && setRule((prev) => ({ ...prev, maxBalance: Number(e.target.value) }))
                }
                disabled={!canEdit}
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Accounts above ₱{rule.maxBalance.toLocaleString()} require manual approval.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approved Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Approved Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                "Standard 7-day Reminder",
                "Empathetic Early Outreach",
                "Formal Payment Notice",
                "Push Notification - Due Date",
                "Salary Miss Notification",
                "Auto-Debit Retry Notice",
              ].map((template) => (
                <div key={template} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`tpl-${template}`}
                    checked={rule.approvedTemplates.includes(template)}
                    onCheckedChange={() => toggleTemplate(template)}
                    disabled={!canEdit}
                  />
                  <Label
                    htmlFor={`tpl-${template}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {template}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exclusions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Exclusions — accounts matching any flag are excluded from auto-approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EXCLUSION_OPTIONS.map((tag) => {
              const active = rule.exclusions.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleExclusion(tag)}
                  disabled={!canEdit}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-muted text-muted-foreground border-border"
                  } ${canEdit ? "cursor-pointer hover:border-foreground/30" : "cursor-default opacity-70"}`}
                >
                  {active && <XCircle className="h-3 w-3" />}
                  {tag}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {rule.exclusions.length} of {EXCLUSION_OPTIONS.length} exclusion flags active.
          </p>
        </CardContent>
      </Card>

      {roleCan("propose") && (
        <div className="flex justify-end">
          <Button size="sm" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Propose Change
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 4: Approval Governance
// ---------------------------------------------------------------------------

type Permission =
  | "View Rules"
  | "Suggest Changes"
  | "Edit Drafts"
  | "Propose Changes"
  | "Approve Changes"
  | "Publish Changes"
  | "Manage Roles"

type Role = "Analyst" | "Manager" | "Director" | "Admin"

const PERMISSION_MATRIX: Record<Permission, Record<Role, boolean>> = {
  "View Rules":       { Analyst: true,  Manager: true,  Director: true,  Admin: true  },
  "Suggest Changes":  { Analyst: true,  Manager: true,  Director: true,  Admin: true  },
  "Edit Drafts":      { Analyst: false, Manager: true,  Director: true,  Admin: true  },
  "Propose Changes":  { Analyst: false, Manager: true,  Director: true,  Admin: true  },
  "Approve Changes":  { Analyst: false, Manager: false, Director: true,  Admin: true  },
  "Publish Changes":  { Analyst: false, Manager: false, Director: true,  Admin: true  },
  "Manage Roles":     { Analyst: false, Manager: false, Director: false, Admin: true  },
}

const ROLES: Role[] = ["Analyst", "Manager", "Director", "Admin"]
const PERMISSIONS: Permission[] = [
  "View Rules",
  "Suggest Changes",
  "Edit Drafts",
  "Propose Changes",
  "Approve Changes",
  "Publish Changes",
  "Manage Roles",
]

function GovernanceTab({ roleCan, currentRole }: { roleCan: RoleCanFn; currentRole: string }) {
  const [makerCheckerEnabled, setMakerCheckerEnabled] = useState(true)
  const isAdmin = currentRole === "admin"

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Approval Governance</h2>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Role Permissions Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Permission</TableHead>
                  {ROLES.map((role) => (
                    <TableHead key={role} className="text-center w-24">
                      {role}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map((perm) => (
                  <TableRow key={perm}>
                    <TableCell className="font-medium text-sm">{perm}</TableCell>
                    {ROLES.map((role) => {
                      const has = PERMISSION_MATRIX[perm][role]
                      return (
                        <TableCell key={role} className="text-center">
                          {has ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground/40 text-base leading-none">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Maker-Checker Config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Maker-Checker Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                Director approval required for all rule changes
              </p>
              <p className="text-xs text-muted-foreground">
                Any change to risk matrix, treatment rules, or auto-approval config requires
                Director or Admin sign-off before taking effect.
              </p>
            </div>
            <Switch
              checked={makerCheckerEnabled}
              onCheckedChange={isAdmin ? setMakerCheckerEnabled : undefined}
              disabled={!isAdmin}
              aria-label="Director approval required toggle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Effective Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              {
                step: "1",
                title: "Draft",
                desc: "Manager drafts a rule change and adds rationale. Change is not yet visible to other roles.",
              },
              {
                step: "2",
                title: "Propose",
                desc: "Manager submits the draft as a formal change proposal. Status moves to Pending Approval.",
              },
              {
                step: "3",
                title: "Director Review",
                desc: "Director or Admin reviews the proposal — can approve, reject, or request modifications.",
              },
              {
                step: "4",
                title: "Publish",
                desc: "Approved changes are published by Director or Admin. The effective date is recorded in the change log.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-3">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {step}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 5: Rule Change Log
// ---------------------------------------------------------------------------

function ChangeLogTab({ roleCan }: { roleCan: RoleCanFn }) {
  const [changes, setChanges] = useState<RuleChange[]>(initialRuleChanges)
  const canApprove = roleCan("approve")

  function handleApprove(id: string) {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "active" as RuleStatus,
              approver: "Director Santos",
              approvedDate: new Date().toISOString(),
              effectiveDate: new Date().toISOString(),
            }
          : c
      )
    )
  }

  function handleReject(id: string) {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "rejected" as RuleStatus, approver: "Director Santos" } : c
      )
    )
  }

  const ruleTypeLabel: Record<RuleChange["ruleType"], string> = {
    risk_matrix: "Risk Matrix",
    treatment_rule: "Treatment Rule",
    auto_approval: "Auto-Approval",
    governance: "Governance",
  }

  const changeColumns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: "ruleName",
      header: "Rule Name",
      sortable: true,
      render: (row) => <span className="font-medium text-sm">{row.ruleName as string}</span>,
    },
    {
      key: "ruleType",
      header: "Rule Type",
      render: (row) => (
        <Badge variant="outline" className="text-xs">
          {ruleTypeLabel[row.ruleType as RuleChange["ruleType"]]}
        </Badge>
      ),
    },
    {
      key: "changedBy",
      header: "Changed By",
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <span>{row.changedBy as string}</span>
          <span className="text-muted-foreground ml-1 capitalize text-xs">
            ({row.changedByRole as string})
          </span>
        </div>
      ),
    },
    {
      key: "oldValue",
      header: "Old Value",
      render: (row) => (
        <span className="text-sm text-muted-foreground line-through">{row.oldValue as string}</span>
      ),
    },
    {
      key: "newValue",
      header: "New Value",
      render: (row) => (
        <span className="text-sm font-medium">{row.newValue as string}</span>
      ),
    },
    {
      key: "rationale",
      header: "Rationale",
      className: "max-w-[200px]",
      render: (row) => (
        <Tooltip>
          <TooltipTrigger
            render={<span className="text-xs text-muted-foreground truncate block max-w-[200px] cursor-default" />}
          >
            {row.rationale as string}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            {row.rationale as string}
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => ruleStatusBadge(row.status as RuleStatus),
    },
    {
      key: "submittedDate",
      header: "Submitted",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.submittedDate as string).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "approver",
      header: "Approver",
      render: (row) => (
        <span className="text-sm">{(row.approver as string | undefined) ?? "—"}</span>
      ),
    },
    ...(canApprove
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (row: Record<string, unknown>) => {
              if (row.status !== "pending_approval") return <span className="text-muted-foreground text-xs">—</span>
              return (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(row.id as string)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleReject(row.id as string)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              )
            },
          } as ColumnDef<Record<string, unknown>>,
        ]
      : []),
  ]

  const tableData = changes.map((c) => ({ ...c } as unknown as Record<string, unknown>))

  const pendingCount = changes.filter((c) => c.status === "pending_approval").length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">Pending &amp; Recent Rule Changes</h2>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 gap-1">
            <Clock className="h-3 w-3" />
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {canApprove && pendingCount > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
          You have {pendingCount} change proposal{pendingCount > 1 ? "s" : ""} awaiting your
          approval. Review and approve or reject each below.
        </div>
      )}

      <div className="overflow-x-auto">
        <DataTable
          columns={changeColumns}
          data={tableData}
          searchable
          searchPlaceholder="Search change log..."
          pageSize={10}
          stickyHeader
          exportFilename="rule-change-log"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main SettingsPage
// ---------------------------------------------------------------------------

const TABS = [
  { value: "risk-matrix",     label: "Risk Matrix" },
  { value: "treatment-rules", label: "Treatment Rules" },
  { value: "auto-approval",   label: "Auto-Approval" },
  { value: "governance",      label: "Governance" },
  { value: "change-log",      label: "Change Log" },
] as const

type TabValue = (typeof TABS)[number]["value"]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("risk-matrix")
  const { currentUser } = useRole()
  const roleCan = makeRoleCan(currentUser.role)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Settings</h1>
        <Badge variant="outline" className="capitalize">
          {currentUser.role}
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex gap-6"
        orientation="vertical"
      >
        {/* Vertical Tab List */}
        <TabsList className="flex flex-col h-auto w-44 shrink-0 items-stretch justify-start gap-1 bg-transparent p-0">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="justify-start text-left rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <TabsContent value="risk-matrix" className="mt-0">
            <RiskMatrixTab roleCan={roleCan} />
          </TabsContent>
          <TabsContent value="treatment-rules" className="mt-0">
            <TreatmentRulesTab roleCan={roleCan} />
          </TabsContent>
          <TabsContent value="auto-approval" className="mt-0">
            <AutoApprovalTab roleCan={roleCan} />
          </TabsContent>
          <TabsContent value="governance" className="mt-0">
            <GovernanceTab roleCan={roleCan} currentRole={currentUser.role} />
          </TabsContent>
          <TabsContent value="change-log" className="mt-0">
            <ChangeLogTab roleCan={roleCan} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

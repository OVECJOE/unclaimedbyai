"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BrandfetchIcon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { NameResult } from "@/lib/constants"
import {
  ApiError,
  cancelAllChecks,
  cancelCheck,
  checkAllNames,
  runCheck,
  type PendingName,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { aiAssociationColor, tierColor } from "@/lib/name-results"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"

const INITIAL_ROWS = 5

const STEP_LABELS: Record<string, string> = {
  domains: "Checking domains",
  socials: "Checking handles",
  ai: "Consulting AI models",
  scoring: "Scoring",
}

function stepLabel(step: string | null): string {
  if (!step) return "Working"
  return STEP_LABELS[step] ?? "Working"
}

type ResultsTableProps = {
  searchId: string
  results: NameResult[]
  pending?: PendingName[]
  anonSessionId?: string
  detailBase?: string | null
  onMutation?: () => void
}

function AvailabilityList({
  items,
}: {
  items: { label: string; available: boolean }[]
}) {
  return (
    <span className="flex items-center gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className={
            item.available
              ? "text-xs font-medium text-foreground"
              : "text-xs text-muted-foreground line-through decoration-border"
          }
        >
          {item.label}
        </span>
      ))}
    </span>
  )
}

function NameRow({
  result,
  searchId,
  detailBase,
}: {
  result: NameResult
  searchId: string
  detailBase?: string | null
}) {
  const searchParams = useSearchParams()
  const carry = new URLSearchParams()
  for (const key of ["available", "sort", "q"]) {
    const value = searchParams.get(key)
    if (value) carry.set(key, value)
  }
  const suffix = carry.toString()
  const base = detailBase ?? `/dashboard/history/${searchId}/results`
  const href = `${base}/${encodeURIComponent(result.name)}${suffix ? `?${suffix}` : ""}`
  const clickable = detailBase !== null

  return (
    <TableRow
      className={clickable ? "group relative cursor-pointer" : undefined}
    >
      <TableCell>
        {clickable ? (
          <Link
            href={href}
            aria-label={`View ${result.name} details`}
            className="absolute inset-0 z-0"
          />
        ) : null}
        <span
          className={`flex items-center gap-3 font-medium transition-colors ${clickable ? "group-hover:text-primary" : ""}`}
        >
          <Avatar size="sm">
            <AvatarImage src={result.logo} alt={result.name} />
            <AvatarFallback>
              <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
            </AvatarFallback>
          </Avatar>
          {result.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <span className="font-medium tabular-nums">{result.score}</span>
          <Badge className={tierColor(result.tier)}>{result.tier}</Badge>
        </span>
      </TableCell>
      <TableCell>
        <AvailabilityList
          items={result.domains.map(({ tld, available }) => ({
            label: `.${tld}`,
            available,
          }))}
        />
      </TableCell>
      <TableCell>
        <SocialAvailabilityList socials={result.socials} />
      </TableCell>
      <TableCell>
        <Badge className={aiAssociationColor(result.aiAssociation)}>
          {result.aiAssociation}
        </Badge>
      </TableCell>
      <TableCell>
        {clickable ? (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
          />
        ) : null}
      </TableCell>
    </TableRow>
  )
}

function PendingRow({
  item,
  selected,
  disabled,
  onSelect,
  onCheck,
  onCancel,
}: {
  item: PendingName
  selected: boolean
  disabled: boolean
  onSelect: (nameId: number, selected: boolean) => void
  onCheck: (nameId: number) => void
  onCancel: (nameId: number) => void
}) {
  const job = item.job
  const active =
    job !== null && (job.status === "queued" || job.status === "running")

  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-3 font-medium">
          <Checkbox
            checked={selected}
            disabled={disabled || active}
            onCheckedChange={(value) => onSelect(item.id, value === true)}
            aria-label={`Select ${item.name} for checking`}
          />
          <Avatar size="sm">
            <AvatarImage
              src={`https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(item.name)}`}
              alt={item.name}
            />
            <AvatarFallback>
              <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
            </AvatarFallback>
          </Avatar>
          {item.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">Not checked</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">Pending</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">Pending</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">Pending</span>
      </TableCell>
      <TableCell>
        {active && job ? (
          <span className="flex min-w-32 flex-col gap-1">
            <span className="text-xs text-muted-foreground" role="status">
              {job.status === "queued"
                ? "Queued…"
                : `${stepLabel(job.current_step)}… {job.progress}%`}
            </span>
            <span
              className="h-1 w-full bg-muted"
              role="progressbar"
              aria-valuenow={job.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Checking ${item.name}`}
            >
              <span
                className="block h-full bg-primary transition-all"
                style={{ width: `${job.progress}%` }}
              />
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-auto justify-start p-0 text-xs"
              onClick={() => onCancel(item.id)}
            >
              Cancel
            </Button>
          </span>
        ) : job && (job.status === "failed" || job.status === "canceled") ? (
          <span className="flex flex-col gap-1">
            <span className="text-xs text-destructive">
              {job.status === "failed"
                ? (job.error ?? "The check failed.")
                : "Canceled."}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onCheck(item.id)}
            >
              Retry
            </Button>
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onCheck(item.id)}
          >
            Run check
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function ResultsTable({
  searchId,
  results,
  pending = [],
  anonSessionId,
  detailBase,
  onMutation,
}: ResultsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [firing, setFiring] = useState(false)

  function toggleSelect(nameId: number, value: boolean) {
    setSelected((current) =>
      value ? [...current, nameId] : current.filter((id) => id !== nameId)
    )
  }

  function anonInput() {
    return anonSessionId ? { anon_session_id: anonSessionId } : {}
  }

  async function runOne(nameId: number) {
    setFiring(true)
    try {
      await runCheck(nameId, anonInput())
      onMutation?.()
    } catch (error) {
      toastApiError(error, "The check failed. Try again in a moment.")
    } finally {
      setFiring(false)
    }
  }

  async function cancelOne(nameId: number) {
    try {
      await cancelCheck(nameId, anonInput())
      onMutation?.()
    } catch (error) {
      toastApiError(error, "Could not cancel. Try again in a moment.")
    }
  }

  async function onCheckAll() {
    if (!pending.length || firing) return
    setFiring(true)
    try {
      let skipped = 0
      for (let round = 0; round < 20; round += 1) {
        const result = await checkAllNames(Number(searchId), {
          ...anonInput(),
          ...(validSelected.length > 0 ? { name_ids: validSelected } : {}),
        })
        skipped += result.skipped
        if (result.queued === 0) break
      }
      if (skipped > 0) {
        toastApiError(
          new ApiError(402, "Some re-checks need credits."),
          "Some checks need credits."
        )
      }
      setSelected([])
      onMutation?.()
    } catch (error) {
      toastApiError(error, "The checks failed to start. Try again in a moment.")
    } finally {
      setFiring(false)
    }
  }

  async function onCancelAll() {
    try {
      await cancelAllChecks(Number(searchId), anonInput())
      onMutation?.()
    } catch (error) {
      toastApiError(error, "Could not cancel. Try again in a moment.")
    }
  }

  const pendingCount = pending.length
  const validSelected = selected.filter((id) =>
    pending.some((item) => item.id === id)
  )
  const bulkCount =
    validSelected.length > 0 ? validSelected.length : pendingCount
  const bulkLabel =
    validSelected.length > 0
      ? `Check (${bulkCount})`
      : `Check all (${bulkCount})`
  const allSelected = pendingCount > 0 && validSelected.length === pendingCount
  const someSelected =
    validSelected.length > 0 && validSelected.length < pendingCount
  const activeJobs = pending.filter(
    (item) =>
      item.job !== null &&
      (item.job.status === "queued" || item.job.status === "running")
  ).length

  function toggleSelectAll() {
    setSelected(allSelected ? [] : pending.map((item) => item.id))
  }

  const visibleChecked = results.slice(0, INITIAL_ROWS)
  const hiddenChecked = results.slice(INITIAL_ROWS)
  const visiblePending = pending.slice(
    0,
    Math.max(0, INITIAL_ROWS - visibleChecked.length)
  )
  const hiddenPending = pending.slice(visiblePending.length)
  const overflowCount = hiddenChecked.length + hiddenPending.length

  function pendingRowProps(item: PendingName) {
    return {
      item,
      selected: validSelected.includes(item.id),
      disabled: firing,
      onSelect: toggleSelect,
      onCheck: (nameId: number) => void runOne(nameId),
      onCancel: (nameId: number) => void cancelOne(nameId),
    }
  }

  return (
    <div className="w-full">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead>
              <span className="flex items-center gap-3">
                {pendingCount > 0 ? (
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    disabled={firing}
                    onCheckedChange={() => toggleSelectAll()}
                    aria-label={
                      allSelected
                        ? "Unselect all unchecked names"
                        : "Select all unchecked names"
                    }
                  />
                ) : null}
                Name
              </span>
            </TableHead>
            <TableHead>Overall</TableHead>
            <TableHead>Domains</TableHead>
            <TableHead>Social</TableHead>
            <TableHead>AI Association</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              {pendingCount > 0 ? (
                <span className="flex items-center gap-2">
                  {activeJobs > 0 ? (
                    <>
                      <Button size="sm" disabled>
                        Checking {pendingCount - activeJobs} of {pendingCount}…
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void onCancelAll()}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      disabled={firing}
                      onClick={() => void onCheckAll()}
                      aria-label={
                        validSelected.length > 0
                          ? `Run check on ${bulkCount} selected names`
                          : `Run check on all ${bulkCount} unchecked names`
                      }
                    >
                      {bulkLabel}
                    </Button>
                  )}
                </span>
              ) : null}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleChecked.map((result) => (
            <NameRow
              key={result.name}
              result={result}
              searchId={searchId}
              detailBase={detailBase}
            />
          ))}
          {visiblePending.map((item) => (
            <PendingRow key={item.id} {...pendingRowProps(item)} />
          ))}
        </TableBody>
        {expanded && overflowCount > 0 ? (
          <TableBody>
            {hiddenChecked.map((result) => (
              <NameRow
                key={result.name}
                result={result}
                searchId={searchId}
                detailBase={detailBase}
              />
            ))}
            {hiddenPending.map((item) => (
              <PendingRow key={item.id} {...pendingRowProps(item)} />
            ))}
          </TableBody>
        ) : null}
      </Table>
      {overflowCount > 0 ? (
        <Button
          variant="ghost"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex h-12 w-full items-center justify-center rounded-none border-t bg-muted/50 font-medium text-primary"
        >
          {expanded ? (
            <>Show fewer</>
          ) : (
            <>
              Show {overflowCount} more {overflowCount === 1 ? "name" : "names"}
            </>
          )}
          <HugeiconsIcon
            icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
        </Button>
      ) : null}
    </div>
  )
}

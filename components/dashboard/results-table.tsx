"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
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
import { useTurnstile } from "@/components/public/turnstile"
import { WatchButton } from "@/components/dashboard/watch-button"

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

function liveStepLabel(job: PendingName["job"]): string {
  if (!job) return "Working"
  if (job.current_step) return stepLabel(job.current_step)
  const snapshot = job.snapshot
  if (!snapshot) return "Starting checks"
  if (snapshot.ai?.verdict) return "Scoring"
  if (snapshot.ai) return "Consulting AI models"
  if (snapshot.socials) return "Checking handles"
  if (snapshot.domains) return "Checking domains"
  return "Starting checks"
}

type ResultsTableProps = {
  searchId: string
  results: NameResult[]
  pending?: PendingName[]
  anonSessionId?: string
  detailBase?: string | null
  watched?: Record<string, number>
  onMutation?: () => void
  onShortage?: () => void
}

function AvailabilityList({
  items,
  max = 3,
}: {
  items: { label: string; available: boolean }[]
  max?: number
}) {
  const shown = items.slice(0, max)
  const remaining = items.length - shown.length
  return (
    <span className="flex items-center gap-2">
      {shown.map((item) => (
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
      {remaining > 0 ? (
        <span
          className="text-xs text-muted-foreground"
          title={items
            .slice(max)
            .map((i) => i.label)
            .join(", ")}
        >
          +{remaining}
        </span>
      ) : null}
    </span>
  )
}

function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || value === 0) {
      const id = setTimeout(() => setDisplay(value), 0)
      return () => clearTimeout(id)
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / 800, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{display}</>
}

function ModelDots({ models }: { models: { model: string; ok: boolean }[] }) {
  const slots = Math.max(models.length, 3)
  return (
    <span
      role="status"
      aria-label={`${models.length} of ${slots} AI models responded`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: slots }).map((_, index) => {
        const probe = models[index]
        return (
          <span
            key={index}
            title={probe ? probe.model : "Waiting on a model"}
            className={
              probe
                ? probe.ok
                  ? "size-2 rounded-full bg-primary"
                  : "size-2 rounded-full bg-destructive"
                : "size-2 animate-pulse rounded-full bg-muted-foreground/30"
            }
          />
        )
      })}
    </span>
  )
}

const AI_VERDICT_LABEL: Record<string, string> = {
  clean: "Clean",
  minor: "Minor",
  hard: "Hard",
}

const AI_VERDICT_TONE: Record<string, string> = {
  clean:
    "bg-green-600/10 text-green-700 dark:bg-green-400/10 dark:text-green-400",
  minor:
    "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-500",
  hard: "bg-destructive/10 text-destructive",
}

function NameRow({
  result,
  searchId,
  detailBase,
  showWatch,
  watchId,
}: {
  result: NameResult
  searchId: string
  detailBase?: string | null
  showWatch?: boolean
  watchId?: number
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
      <TableCell className="max-w-[10rem] min-w-28 md:max-w-none">
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
          <span className="truncate">{result.name}</span>
          {showWatch ? (
            <WatchButton
              name={result.name}
              searchId={Number(searchId)}
              watchId={watchId}
            />
          ) : null}
        </span>
        {result.rationale ? (
          <span className="mt-0.5 block max-w-sm truncate pl-8 text-xs text-muted-foreground italic">
            {result.rationale}
          </span>
        ) : null}
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <span className="font-medium tabular-nums">
            <AnimatedScore value={result.score} />
          </span>
          <Badge
            className={`${tierColor(result.tier)} animate-in duration-500 fade-in-0 zoom-in-95`}
          >
            {result.tier}
          </Badge>
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
      <TableCell className="hidden md:table-cell">
        <SocialAvailabilityList socials={result.socials} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
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
  searchId,
  selected,
  disabled,
  onSelect,
  onCheck,
  onCancel,
  showWatch,
  watchId,
}: {
  item: PendingName
  searchId: string
  selected: boolean
  disabled: boolean
  onSelect: (nameId: number, selected: boolean) => void
  onCheck: (nameId: number) => void
  onCancel: (nameId: number) => void
  showWatch?: boolean
  watchId?: number
}) {
  const job = item.job
  const snapshot = job?.snapshot ?? null
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
          <span className="truncate">{item.name}</span>
          {showWatch ? (
            <WatchButton
              name={item.name}
              searchId={Number(searchId)}
              watchId={watchId}
            />
          ) : null}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">Not checked</span>
      </TableCell>
      <TableCell>
        {snapshot?.domains?.length ? (
          <AvailabilityList
            items={snapshot.domains.map(({ tld, available }) => ({
              label: `.${tld}`,
              available,
            }))}
          />
        ) : (
          <span className="text-sm text-muted-foreground">Pending</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {snapshot?.socials?.length ? (
          <SocialAvailabilityList socials={snapshot.socials} />
        ) : (
          <span className="text-sm text-muted-foreground">Pending</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {snapshot?.ai?.verdict ? (
          <Badge
            className={`animate-in duration-500 fade-in-0 zoom-in-95 ${
              AI_VERDICT_TONE[snapshot.ai.verdict] ?? ""
            }`}
          >
            {AI_VERDICT_LABEL[snapshot.ai.verdict] ?? "Checked"}
          </Badge>
        ) : snapshot?.ai?.models.length ? (
          <ModelDots models={snapshot.ai.models} />
        ) : (
          <span className="text-sm text-muted-foreground">Pending</span>
        )}
      </TableCell>
      <TableCell>
        <PendingActions
          item={item}
          job={job}
          active={active}
          disabled={disabled}
          onCheck={onCheck}
          onCancel={onCancel}
        />
      </TableCell>
    </TableRow>
  )
}

function PendingActions({
  item,
  job,
  active,
  disabled,
  onCheck,
  onCancel,
}: {
  item: PendingName
  job: PendingName["job"]
  active: boolean
  disabled: boolean
  onCheck: (nameId: number) => void
  onCancel: (nameId: number) => void
}) {
  if (active && job) {
    return (
      <span className="flex min-w-32 flex-col gap-1">
        <span className="text-xs text-muted-foreground" role="status">
          {job.status === "queued"
            ? "Queued…"
            : `${liveStepLabel(job)}… ${job.progress}%`}
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
    )
  }
  if (job && (job.status === "failed" || job.status === "canceled")) {
    return (
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
    )
  }
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={() => onCheck(item.id)}
    >
      Run check
    </Button>
  )
}

function PillarRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

function MobileNameCard({
  result,
  searchId,
  detailBase,
  showWatch,
  watchId,
}: {
  result: NameResult
  searchId: string
  detailBase?: string | null
  showWatch?: boolean
  watchId?: number
}) {
  const base = detailBase ?? `/dashboard/history/${searchId}/results`
  const href = `${base}/${encodeURIComponent(result.name)}`
  const clickable = detailBase !== null

  return (
    <div className="group relative space-y-3 p-4">
      {clickable ? (
        <Link
          href={href}
          aria-label={`View ${result.name} details`}
          className="absolute inset-0 z-0"
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex min-w-0 items-center gap-3 font-medium ${clickable ? "group-hover:text-primary" : ""}`}
        >
          <Avatar size="sm">
            <AvatarImage src={result.logo} alt={result.name} />
            <AvatarFallback>
              <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{result.name}</span>
          {showWatch ? (
            <WatchButton
              name={result.name}
              searchId={Number(searchId)}
              watchId={watchId}
            />
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-medium tabular-nums">
            <AnimatedScore value={result.score} />
          </span>
          <Badge
            className={`${tierColor(result.tier)} animate-in duration-500 fade-in-0 zoom-in-95`}
          >
            {result.tier}
          </Badge>
        </span>
      </div>
      {result.rationale ? (
        <p className="truncate text-xs text-muted-foreground italic">
          {result.rationale}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <PillarRow label="Domains">
          <AvailabilityList
            items={result.domains.map(({ tld, available }) => ({
              label: `.${tld}`,
              available,
            }))}
          />
        </PillarRow>
        <PillarRow label="Handles">
          <SocialAvailabilityList socials={result.socials} />
        </PillarRow>
        <PillarRow label="AI">
          <Badge className={aiAssociationColor(result.aiAssociation)}>
            {result.aiAssociation}
          </Badge>
        </PillarRow>
      </div>
    </div>
  )
}

function MobilePendingCard({
  item,
  searchId,
  selected,
  disabled,
  onSelect,
  onCheck,
  onCancel,
  showWatch,
  watchId,
}: {
  item: PendingName
  searchId: string
  selected: boolean
  disabled: boolean
  onSelect: (nameId: number, selected: boolean) => void
  onCheck: (nameId: number) => void
  onCancel: (nameId: number) => void
  showWatch?: boolean
  watchId?: number
}) {
  const job = item.job
  const snapshot = job?.snapshot ?? null
  const active =
    job !== null && (job.status === "queued" || job.status === "running")

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={selected}
          disabled={disabled || active}
          onCheckedChange={(value) => onSelect(item.id, value === true)}
          aria-label={`Select ${item.name} for checking`}
        />
        <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
        {showWatch ? (
          <WatchButton
            name={item.name}
            searchId={Number(searchId)}
            watchId={watchId}
          />
        ) : null}
      </div>
      <div className="space-y-1.5">
        <PillarRow label="Overall">
          <span className="text-sm text-muted-foreground">Not checked</span>
        </PillarRow>
        <PillarRow label="Domains">
          {snapshot?.domains?.length ? (
            <AvailabilityList
              items={snapshot.domains.map(({ tld, available }) => ({
                label: `.${tld}`,
                available,
              }))}
            />
          ) : (
            <span className="text-sm text-muted-foreground">Pending</span>
          )}
        </PillarRow>
        <PillarRow label="Handles">
          {snapshot?.socials?.length ? (
            <SocialAvailabilityList socials={snapshot.socials} />
          ) : (
            <span className="text-sm text-muted-foreground">Pending</span>
          )}
        </PillarRow>
        <PillarRow label="AI">
          {snapshot?.ai?.verdict ? (
            <Badge
              className={`animate-in duration-500 fade-in-0 zoom-in-95 ${
                AI_VERDICT_TONE[snapshot.ai.verdict] ?? ""
              }`}
            >
              {AI_VERDICT_LABEL[snapshot.ai.verdict] ?? "Checked"}
            </Badge>
          ) : snapshot?.ai?.models.length ? (
            <ModelDots models={snapshot.ai.models} />
          ) : (
            <span className="text-sm text-muted-foreground">Pending</span>
          )}
        </PillarRow>
      </div>
      <PendingActions
        item={item}
        job={job}
        active={active}
        disabled={disabled}
        onCheck={onCheck}
        onCancel={onCancel}
      />
    </div>
  )
}

export default function ResultsTable({
  searchId,
  results,
  pending = [],
  anonSessionId,
  detailBase,
  watched = {},
  onMutation,
  onShortage,
}: ResultsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [firing, setFiring] = useState(false)
  // Anonymous spend calls need a Turnstile token, and this page is the
  // only surface where people can act without ever having seen the
  // landing widget, so it carries its own (invisible unless challenged).
  const turnstile = useTurnstile("anonymous_check")

  // The dashboard leaves detailBase undefined while the public page
  // passes an explicit null, so compare strictly against null here.
  const showWatch = !anonSessionId && detailBase !== null

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
      // verify re-arms the widget itself, and only once a 403 has proven
      // the previous token was consumed. Resetting an unconsumed token
      // discards a valid solve and forces a fresh challenge, which is how
      // an interactive-only widget ends up demanding a click it had
      // already been given.
      const result = await turnstile.verify(
        async (token) =>
          runCheck(nameId, { ...anonInput(), cf_turnstile_token: token }),
        { waitMs: 30000 }
      )
      if (!result) {
        toast.error(
          "The human check didn't complete. Finish the Cloudflare challenge and retry — or sign in to skip it."
        )
        return
      }
      onMutation?.()
    } catch (error) {
      if (error instanceof ApiError && error.status === 402 && onShortage) {
        onShortage()
      } else {
        toastApiError(error, "The check failed. Try again in a moment.")
      }
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
        // Every round consumes its token server-side, so each gets its
        // own verify. The wait is bounded: an unattended loop must not
        // hang forever on a challenge nobody is solving.
        const result = await turnstile.verify(
          (token) =>
            checkAllNames(Number(searchId), {
              ...anonInput(),
              cf_turnstile_token: token,
              ...(validSelected.length > 0 ? { name_ids: validSelected } : {}),
            }),
          { waitMs: 15000 }
        )
        if (!result) {
          toast.error(
            "The human check didn't complete. Finish the Cloudflare challenge and retry — or sign in to skip it."
          )
          return
        }
        skipped += result.skipped
        if (result.queued === 0) break
      }
      if (skipped > 0) {
        if (onShortage) {
          onShortage()
        } else {
          toast.error(
            "Some re-checks were skipped because they need credits. Sign in to top up, then try again."
          )
        }
      }
      setSelected([])
      onMutation?.()
    } catch (error) {
      if (error instanceof ApiError && error.status === 402 && onShortage) {
        onShortage()
      } else {
        toastApiError(
          error,
          "The checks failed to start. Try again in a moment."
        )
      }
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
      searchId,
      selected: validSelected.includes(item.id),
      disabled: firing,
      onSelect: toggleSelect,
      onCheck: (nameId: number) => void runOne(nameId),
      onCancel: (nameId: number) => void cancelOne(nameId),
      showWatch,
      watchId: watched[item.name],
    }
  }

  return (
    <div className="w-full">
      {anonSessionId ? turnstile.widget : null}

      {/* Mobile: stacked cards so nothing hides behind breakpoints. */}
      <div className="border lg:hidden">
        <div className="divide-y divide-border">
          {visibleChecked.map((result) => (
            <MobileNameCard
              key={result.name}
              result={result}
              searchId={searchId}
              detailBase={detailBase}
              showWatch={showWatch}
              watchId={watched[result.name]}
            />
          ))}
          {visiblePending.map((item) => (
            <MobilePendingCard key={item.id} {...pendingRowProps(item)} />
          ))}
          {expanded
            ? hiddenChecked.map((result) => (
                <MobileNameCard
                  key={result.name}
                  result={result}
                  searchId={searchId}
                  detailBase={detailBase}
                  showWatch={showWatch}
                  watchId={watched[result.name]}
                />
              ))
            : null}
          {expanded
            ? hiddenPending.map((item) => (
                <MobilePendingCard key={item.id} {...pendingRowProps(item)} />
              ))
            : null}
        </div>
        {pendingCount > 0 ? (
          <div className="flex items-center justify-between gap-3 border-t p-3">
            {activeJobs > 0 ? (
              <span className="text-xs text-muted-foreground" role="status">
                Checking {pendingCount - activeJobs} of {pendingCount}…
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {pendingCount} unchecked {pendingCount === 1 ? "name" : "names"}
              </span>
            )}
            {activeJobs > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void onCancelAll()}
              >
                Cancel
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={firing}
                onClick={() => void onCheckAll()}
              >
                {bulkLabel}
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Desktop: the full table. */}
      <div className="hidden w-full overflow-x-auto lg:block">
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
              <TableHead className="hidden md:table-cell">Social</TableHead>
              <TableHead className="hidden md:table-cell">
                AI Association
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">
                {pendingCount > 0 ? (
                  <span className="flex items-center gap-2">
                    {activeJobs > 0 ? (
                      <>
                        <Button size="sm" disabled>
                          Checking {pendingCount - activeJobs} of {pendingCount}
                          …
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
                showWatch={showWatch}
                watchId={watched[result.name]}
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
                  showWatch={showWatch}
                  watchId={watched[result.name]}
                />
              ))}
              {hiddenPending.map((item) => (
                <PendingRow key={item.id} {...pendingRowProps(item)} />
              ))}
            </TableBody>
          ) : null}
        </Table>
      </div>

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

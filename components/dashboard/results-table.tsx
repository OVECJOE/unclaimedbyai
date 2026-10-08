"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { runCheck } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { aiAssociationColor, tierColor } from "@/lib/name-results"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"

const INITIAL_ROWS = 5

type ResultsTableProps = {
  searchId: string
  results: NameResult[]
  pending?: { id: number; name: string }[]
  anonSessionId?: string
  detailBase?: string | null
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
  name,
  nameId,
  selected,
  checking,
  disabled,
  onSelect,
  onCheck,
}: {
  name: string
  nameId: number
  selected: boolean
  checking: boolean
  disabled: boolean
  onSelect: (nameId: number, selected: boolean) => void
  onCheck: (nameId: number) => void
}) {
  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-3 font-medium">
          <Checkbox
            checked={selected}
            disabled={disabled}
            onCheckedChange={(value) => onSelect(nameId, value === true)}
            aria-label={`Select ${name} for checking`}
          />
          <Avatar size="sm">
            <AvatarImage
              src={`https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(name)}`}
              alt={name}
            />
            <AvatarFallback>
              <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
            </AvatarFallback>
          </Avatar>
          {name}
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
        {checking ? (
          <span className="text-xs text-muted-foreground">Checking…</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onCheck(nameId)}
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
}: ResultsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [checkingId, setCheckingId] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const cancelRef = useRef(false)
  const router = useRouter()

  function toggleSelect(nameId: number, value: boolean) {
    setSelected((current) =>
      value ? [...current, nameId] : current.filter((id) => id !== nameId)
    )
  }

  async function runOne(nameId: number) {
    setCheckingId(nameId)
    try {
      await runCheck(
        nameId,
        anonSessionId ? { anon_session_id: anonSessionId } : {}
      )
      router.refresh()
    } catch (error) {
      toastApiError(error, "The check failed. Try again in a moment.")
    } finally {
      setCheckingId(null)
    }
  }

  async function onCheckAll() {
    const targets =
      validSelected.length > 0
        ? pending.filter((item) => validSelected.includes(item.id))
        : pending
    if (!targets.length) return
    cancelRef.current = false
    setRunning(true)
    setProgress({ done: 0, total: targets.length })
    for (const [index, item] of targets.entries()) {
      if (cancelRef.current) break
      setCheckingId(item.id)
      try {
        await runCheck(
          item.id,
          anonSessionId ? { anon_session_id: anonSessionId } : {}
        )
      } catch (error) {
        toastApiError(error, "The check failed. Try again in a moment.")
      }
      setProgress({ done: index + 1, total: targets.length })
    }
    setCheckingId(null)
    setRunning(false)
    setProgress(null)
    setSelected([])
    router.refresh()
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

  function pendingRowProps(item: { id: number; name: string }) {
    return {
      name: item.name,
      nameId: item.id,
      selected: validSelected.includes(item.id),
      checking: checkingId === item.id,
      disabled: running,
      onSelect: toggleSelect,
      onCheck: (nameId: number) => void runOne(nameId),
    }
  }

  return (
    <div className="w-full">
      <Table>
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
                    disabled={running}
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
            <TableHead className="w-10">
              {pendingCount > 0 ? (
                <span className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={running}
                    onClick={() => void onCheckAll()}
                    aria-label={
                      validSelected.length > 0
                        ? `Run check on ${bulkCount} selected names`
                        : `Run check on all ${bulkCount} unchecked names`
                    }
                  >
                    {running && progress
                      ? `Checking ${progress.done} of ${progress.total}…`
                      : running
                        ? "Checking…"
                        : bulkLabel}
                  </Button>
                  {running ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        cancelRef.current = true
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
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

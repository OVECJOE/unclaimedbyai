"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { ApiError, runCheck } from "@/lib/api"
import { aiAssociationColor, tierColor } from "@/lib/name-results"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"

const INITIAL_ROWS = 5

type ResultsTableProps = {
  searchId: string
  results: NameResult[]
  pending?: { id: number; name: string }[]
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
}: {
  result: NameResult
  searchId: string
}) {
  const href = `/dashboard/history/${searchId}/results/${encodeURIComponent(result.name)}`

  return (
    <TableRow className="group relative cursor-pointer">
      <TableCell>
        <Link
          href={href}
          aria-label={`View ${result.name} details`}
          className="absolute inset-0 z-0"
        />
        <span className="flex items-center gap-3 font-medium transition-colors group-hover:text-primary">
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
        <Badge className={tierColor(result.tier)}>{result.tier}</Badge>
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
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={2}
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
        />
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
}: ResultsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [checkingId, setCheckingId] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const remaining = results.length - INITIAL_ROWS
  const router = useRouter()

  function toggleSelect(nameId: number, value: boolean) {
    setSelected((current) =>
      value ? [...current, nameId] : current.filter((id) => id !== nameId)
    )
  }

  async function runOne(nameId: number) {
    setCheckingId(nameId)
    try {
      await runCheck(nameId, {})
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "The check failed. Try again in a moment."
      )
    } finally {
      setCheckingId(null)
    }
  }

  async function onCheckAll() {
    const targets =
      selected.length > 0
        ? pending.filter((item) => selected.includes(item.id))
        : pending
    if (!targets.length) return
    setRunning(true)
    for (const item of targets) {
      setCheckingId(item.id)
      try {
        await runCheck(item.id, {})
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "The check failed. Try again in a moment."
        )
      }
    }
    setCheckingId(null)
    setRunning(false)
    setSelected([])
    router.refresh()
  }

  const pendingCount = pending.length
  const bulkCount = selected.length > 0 ? selected.length : pendingCount
  const bulkLabel =
    selected.length > 0 ? `Check (${bulkCount})` : `Check all (${bulkCount})`
  const allSelected = pendingCount > 0 && selected.length === pendingCount
  const someSelected = selected.length > 0 && selected.length < pendingCount

  function toggleSelectAll() {
    setSelected(allSelected ? [] : pending.map((item) => item.id))
  }

  return (
    <Collapsible asChild open={expanded} onOpenChange={setExpanded}>
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
                  <Button
                    size="sm"
                    disabled={running}
                    onClick={() => void onCheckAll()}
                    aria-label={
                      selected.length > 0
                        ? `Run check on ${bulkCount} selected names`
                        : `Run check on all ${bulkCount} unchecked names`
                    }
                  >
                    {running ? "Checking…" : bulkLabel}
                  </Button>
                ) : null}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.slice(0, INITIAL_ROWS).map((result) => (
              <NameRow key={result.name} result={result} searchId={searchId} />
            ))}
            {pending.map((item) => (
              <PendingRow
                key={item.id}
                name={item.name}
                nameId={item.id}
                selected={selected.includes(item.id)}
                checking={checkingId === item.id}
                disabled={running}
                onSelect={toggleSelect}
                onCheck={(nameId) => void runOne(nameId)}
              />
            ))}
          </TableBody>
          {remaining > 0 && (
            <CollapsibleContent asChild>
              <TableBody>
                {results.slice(INITIAL_ROWS).map((result) => (
                  <NameRow
                    key={result.name}
                    result={result}
                    searchId={searchId}
                  />
                ))}
              </TableBody>
            </CollapsibleContent>
          )}
        </Table>
        {remaining > 0 && (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-12 w-full items-center justify-center rounded-none border-t bg-muted/50 font-medium text-primary"
            >
              {expanded ? (
                <>Show fewer</>
              ) : (
                <>
                  Show {remaining} more {remaining === 1 ? "name" : "names"}
                </>
              )}
              <HugeiconsIcon
                icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
    </Collapsible>
  )
}

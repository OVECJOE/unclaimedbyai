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
  onCheck,
  checking,
}: {
  name: string
  nameId: number
  onCheck: (nameId: number) => void
  checking: boolean
}) {
  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-3 font-medium">
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
        <Button
          size="sm"
          variant="outline"
          disabled={checking}
          onClick={() => onCheck(nameId)}
        >
          {checking ? "Checking…" : "Run check"}
        </Button>
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
  const [checkingId, setCheckingId] = useState<number | null>(null)
  const remaining = results.length - INITIAL_ROWS
  const router = useRouter()

  async function onCheck(nameId: number) {
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

  return (
    <Collapsible asChild open={expanded} onOpenChange={setExpanded}>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Domains</TableHead>
              <TableHead>Social</TableHead>
              <TableHead>AI Association</TableHead>
              <TableHead className="w-10" />
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
                onCheck={(nameId) => void onCheck(nameId)}
                checking={checkingId === item.id}
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

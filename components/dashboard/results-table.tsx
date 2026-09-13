"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BrandfetchIcon,
} from "@hugeicons/core-free-icons"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { NameResult } from "@/lib/constants"
import { aiAssociationColor, tierColor } from "@/lib/name-results"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"

const INITIAL_ROWS = 5

type ResultsTableProps = {
  searchId: string
  results: NameResult[]
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

export default function ResultsTable({
  searchId,
  results,
}: ResultsTableProps) {
  const [expanded, setExpanded] = useState(false)
  const remaining = results.length - INITIAL_ROWS

  return (
    <Collapsible asChild open={expanded} onOpenChange={setExpanded}>
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
        {remaining > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mx-auto text-primary flex items-center justify-end"
                  >
                    {expanded ? (
                      <>Show fewer</>
                    ) : (
                      <>
                        Show {remaining} more{" "}
                        {remaining === 1 ? "name" : "names"}
                      </>
                    )}
                    <HugeiconsIcon
                      icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                  </Button>
                </CollapsibleTrigger>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </Collapsible>
  )
}

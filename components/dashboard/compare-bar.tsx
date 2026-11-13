"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AvailabilityList } from "@/components/dashboard/availability-list"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"
import { aiAssociationColor, nextStep, tierColor } from "@/lib/name-results"
import type { NameResult } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const COMPARE_MAX = 4

const TONE: Record<"good" | "warn" | "bad", string> = {
  good: "text-green-700 dark:text-green-400",
  warn: "text-amber-700 dark:text-amber-400",
  bad: "text-red-700 dark:text-red-400",
}

/**
 * The shortlist bar and the side-by-side. It appears once a name is
 * ticked, offers the comparison from two names, and the comparison puts
 * what people actually weigh (score, .com, handles, chatbots, what to do)
 * in the same rows so differences read across instead of scrolling.
 */
export default function CompareBar({
  chosen,
  detailHref,
  onRemove,
  onClear,
}: {
  chosen: NameResult[]
  detailHref: (name: string) => string
  onRemove: (name: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  if (!chosen.length) return null

  const best = [...chosen].sort((a, b) => b.score - a.score)[0]

  return (
    <>
      <div
        role="region"
        aria-label="Your shortlist"
        className="fixed inset-x-0 bottom-[calc(4rem_+_env(safe-area-inset-bottom))] z-40 border-t bg-background/95 backdrop-blur-sm md:bottom-0 md:left-60"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">
              {chosen.length} {chosen.length === 1 ? "name" : "names"} on your
              shortlist
            </span>
            <span className="ml-2 hidden text-muted-foreground sm:inline">
              {chosen.length < 2
                ? "Tick one more to compare."
                : `Up to ${COMPARE_MAX} can be compared.`}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button
              size="sm"
              disabled={chosen.length < 2}
              onClick={() => setOpen(true)}
            >
              Compare {chosen.length > 1 ? chosen.length : ""}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-5xl">
          <DialogHeader className="border-b p-5">
            <DialogTitle className="font-heading text-2xl">
              Side by side
            </DialogTitle>
            <DialogDescription>
              {best.name} scores highest at {best.score}. A higher score is not
              the only thing that matters, so read the last row too.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-32 p-4 text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase" />
                  {chosen.map((result) => (
                    <th key={result.name} className="p-4 text-left align-top">
                      <span className="block font-heading text-xl font-normal">
                        {result.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onRemove(result.name)
                          if (chosen.length <= 2) setOpen(false)
                        }}
                        className="mt-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:p-4 [&_td]:align-top [&_th]:p-4 [&_th]:text-left [&_th]:align-top [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-widest [&_th]:text-muted-foreground [&_th]:uppercase [&>tr]:border-b">
                <tr>
                  <th scope="row">Overall</th>
                  {chosen.map((result) => (
                    <td key={result.name}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-heading text-3xl leading-none tabular-nums",
                            result.name === best.name && "text-primary"
                          )}
                        >
                          {result.score}
                        </span>
                        <Badge className={tierColor(result.tier)}>
                          {result.tier}
                        </Badge>
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Domains</th>
                  {chosen.map((result) => (
                    <td key={result.name}>
                      <AvailabilityList
                        name={result.name}
                        items={result.domains}
                        max={4}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Handles</th>
                  {chosen.map((result) => (
                    <td key={result.name}>
                      <SocialAvailabilityList socials={result.socials} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">What chatbots think</th>
                  {chosen.map((result) => (
                    <td key={result.name}>
                      <Badge
                        className={aiAssociationColor(result.aiAssociation)}
                      >
                        {result.aiAssociation} overlap
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">What to do</th>
                  {chosen.map((result) => {
                    const step = nextStep(result)
                    return (
                      <td key={result.name} className={TONE[step.tone]}>
                        {step.text}
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <th scope="row" />
                  {chosen.map((result) => (
                    <td key={result.name}>
                      <Button asChild size="sm" variant="outline">
                        <Link href={detailHref(result.name)}>Full report</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

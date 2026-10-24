"use client"

import Link from "next/link"
import { CheckmarkCircle01Icon, CircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type SetupStep = {
  id: string
  title: string
  done: boolean
  href: string
  cta: string
}

/**
 * Endowed progress: step 1 (account) is pre-checked because it's already
 * true the moment this page renders for a signed-in user. The rest come
 * from real account state — no fabricated work. The card disappears once
 * everything is done, so existing power users never see a nag.
 */
export default function OnboardingChecklist({
  searchesUsed,
  sandboxesCount,
}: {
  searchesUsed: number
  sandboxesCount: number
}) {
  const steps: SetupStep[] = [
    {
      id: "account",
      title: "Create your account",
      done: true,
      href: "/dashboard",
      cta: "Done",
    },
    {
      id: "search",
      title: "Run your first search",
      done: searchesUsed > 0,
      href: "/",
      cta: "Start a search",
    },
    {
      id: "sandbox",
      title: "Tuck a name into a sandbox",
      done: sandboxesCount > 0,
      href: "/dashboard/playground/sandboxes",
      cta: "Open playground",
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Get set up
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">
            Your first few moves
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {doneCount} of {steps.length} done
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step.done ? (
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary" />
              ) : (
                <HugeiconsIcon icon={CircleIcon} className="size-4 text-muted-foreground" />
              )}
              <span
                className={
                  step.done
                    ? "text-sm text-muted-foreground line-through"
                    : "text-sm"
                }
              >
                {step.title}
              </span>
            </div>
            {step.done ? (
              <span className="text-xs text-muted-foreground">{step.cta}</span>
            ) : (
              <Link href={step.href} className="text-xs text-primary underline">
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

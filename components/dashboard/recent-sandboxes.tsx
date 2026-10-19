import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { Sandbox } from "@/lib/api"
import { signalSummary } from "@/lib/signals"

/**
 * The three most recent sandboxes as cards. Server-rendered and passed
 * as props, so the home page paints them without a client round trip.
 */
export default function RecentSandboxes({
  sandboxes,
}: {
  sandboxes: Sandbox[]
}) {
  if (sandboxes.length === 0) {
    return (
      <div className="border p-5">
        <p className="text-sm text-muted-foreground">
          No sandboxes yet.{" "}
          <Link href="/dashboard/playground" className="text-primary underline">
            Open the playground
          </Link>{" "}
          and answer three questions to generate your first batch of ideas.
        </p>
      </div>
    )
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sandboxes.map((sandbox) => {
        const summary = signalSummary(sandbox.signals)
        return (
          <li key={sandbox.public_id}>
            <Link
              href={`/dashboard/playground?sandbox=${sandbox.public_id}`}
              className="block border p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="line-clamp-2 font-heading text-xl font-semibold">
                  {sandbox.name}
                </p>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </div>
              {summary ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {summary}
                </p>
              ) : null}{" "}
              <p className="mt-3 text-sm text-muted-foreground">
                {sandbox.idea_count} idea{sandbox.idea_count === 1 ? "" : "s"}
                {sandbox.search_count > 0
                  ? ` · ${sandbox.search_count} search${sandbox.search_count === 1 ? "" : "es"}`
                  : ""}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Watch01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { Sandbox } from "@/lib/api"
import NewSandboxDialog from "@/components/playground/new-sandbox-dialog"

/**
 * Which sandbox the canvas is showing, as chips rather than a dropdown:
 * the list is short by plan (ten at most), and chips keep every name
 * one click away with no menu to open first.
 */
export default function SandboxSwitcher({
  sandboxes,
  activeId,
}: {
  sandboxes: Sandbox[]
  activeId: string | null
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  return (
    <div data-tour="switcher" className="flex flex-wrap items-center gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 overflow-x-auto">
        {sandboxes.map((sandbox) => (
          <button
            key={sandbox.public_id}
            type="button"
            onClick={() =>
              router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
            }
            aria-current={sandbox.public_id === activeId ? "true" : undefined}
            className={cn(
              "border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              sandbox.public_id === activeId
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {sandbox.name}
          </button>
        ))}
        {sandboxes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sandboxes yet. Start one to generate ideas.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          New sandbox
        </button>
        <Link
          href="/dashboard/playground/watchlist"
          className="flex items-center gap-1.5 border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <HugeiconsIcon icon={Watch01Icon} className="size-4" />
          Watchlist
        </Link>
      </div>

      <NewSandboxDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

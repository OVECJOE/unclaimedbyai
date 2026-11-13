"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from "@/components/ui/command"
import {
  canvasHref,
  historyNavItem,
  playgroundNavItems,
  topNavItems,
} from "@/components/dashboard/nav"
import { directCheck, listSearches, type SearchItem } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { cn, nameToSlug } from "@/lib/utils"

type Page = { href: string; label: string; icon: IconSvgElement }

/** Lets a button anywhere open the menu without sharing state. */
export const OPEN_EVENT = "uba:open-command-menu"

const PAGES: Page[] = [
  topNavItems[0],
  historyNavItem,
  { href: canvasHref, label: "Canvas", icon: playgroundNavItems[0].icon },
  ...playgroundNavItems,
  ...topNavItems.slice(1),
]

/**
 * Jump to anywhere from the keyboard: Ctrl or Cmd + K (or "/" outside a
 * text box) opens it from every dashboard page. It lists the pages and
 * your recent searches, filters as you type, and offers to check
 * whatever you typed as a name. The searches load the first time it
 * opens, so it costs nothing until it is used.
 */
export function useCommandMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
        return
      }
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return
      const el = event.target as HTMLElement | null
      const typing =
        el?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName ?? "")
      if (typing) return
      event.preventDefault()
      setOpen(true)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  return { open, setOpen }
}

export function CommandMenuButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={cn(
        "flex w-full items-center gap-3 border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
        className
      )}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4 shrink-0" />
      <span className="flex-1">Search or jump to…</span>
      <kbd className="hidden border px-1.5 py-0.5 font-mono text-[0.625rem] lg:block">
        Ctrl K
      </kbd>
    </button>
  )
}

export default function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [searches, setSearches] = useState<SearchItem[] | null>(null)

  useEffect(() => {
    if (!open || searches) return
    let live = true
    listSearches(1, 30)
      .then((data) => live && setSearches(data.items))
      .catch(() => live && setSearches([]))
    return () => {
      live = false
    }
  }, [open, searches])

  const go = useCallback(
    (href: string) => {
      onOpenChange(false)
      setQuery("")
      router.push(href)
    },
    [onOpenChange, router]
  )

  const typed = query.trim()
  // A one-word-ish entry reads as a name to check; a longer sentence
  // reads as a brief, so both are offered when there is text.
  const showActions = typed.length >= 2
  const recent = useMemo(() => searches ?? [], [searches])

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery("")
      }}
      title="Search or jump to"
      description="Go to a page or a past search, or check a name."
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Type a page, a past search, or a name to check"
        />
        <CommandList className="max-h-96">
          {showActions ? null : (
            <CommandEmpty>Nothing matches. Try a different word.</CommandEmpty>
          )}

          {showActions ? (
            <CommandGroup heading="Do this" forceMount>
              <CommandItem
                value={`check ${typed}`}
                forceMount
                onSelect={() => {
                  // Same path as the dashboard box: start the check so it
                  // is saved to your history, then open its live page.
                  onOpenChange(false)
                  setQuery("")
                  directCheck({ name: typed })
                    .then((result) =>
                      router.push(
                        `/check/${nameToSlug(typed)}?s=${result.search_id}`
                      )
                    )
                    .catch((error) =>
                      toastApiError(error, "Could not start that check.")
                    )
                }}
              >
                <HugeiconsIcon icon={Search01Icon} />
                Check &ldquo;{typed}&rdquo; as a name
              </CommandItem>
            </CommandGroup>
          ) : null}

          <CommandGroup heading="Pages">
            {PAGES.map((page) => (
              <CommandItem
                key={page.href}
                value={`page ${page.label}`}
                onSelect={() => go(page.href)}
              >
                <HugeiconsIcon icon={page.icon} />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {recent.length ? (
            <CommandGroup heading="Recent searches">
              {recent.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`search ${item.id} ${item.query} ${item.preview_names.join(" ")}`}
                  onSelect={() => go(`/dashboard/history/${item.id}`)}
                >
                  <HugeiconsIcon icon={Clock01Icon} />
                  <span className="min-w-0 flex-1 truncate">{item.query}</span>
                  {item.top ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Best: {item.top.name}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type TocItem = { id: string; title: string; depth?: number }

/**
 * Desktop keeps the sticky rail beside the article. On phones the
 * widget moves to the thumb: the summary pins to the bottom edge in
 * the dashboard's bottom-bar dress, revealed only while the reader
 * scrolls down and gone the moment they scroll back up — a bar that
 * sits on top of a reading session the whole time is what this
 * replaces. The panel opens upward (column-reverse) so the toggle
 * stays under the thumb with the list growing above it.
 */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "")
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    // The 4px deadzone keeps a jittery trackpad from flickering the
    // bar between two tiny opposite deltas.
    const REVEAL_AFTER = 200
    const DEADZONE = 4
    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      lastY = y

      if (y < REVEAL_AFTER) {
        // At the top the article header is what deserves the screen.
        setPinned(false)
        setOpen(false)
      } else if (delta > DEADZONE) {
        setPinned(true)
      } else if (delta < -DEADZONE) {
        setPinned(false)
        setOpen(false)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        inert={!pinned}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex flex-col-reverse border-t bg-background/95 backdrop-blur-sm transition-transform duration-200 ease-out lg:hidden",
          pinned ? "translate-y-0" : "pointer-events-none translate-y-full"
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] text-xs font-semibold tracking-widest uppercase select-none [&::-webkit-details-marker]:hidden">
          <span>On this page</span>
          <HugeiconsIcon
            icon={open ? MinusSignIcon : PlusSignIcon}
            size="1.5rem"
            strokeWidth={2}
            aria-hidden="true"
            className="shrink-0"
          />
        </summary>
        <nav
          aria-label="Table of contents"
          className="max-h-[45vh] overflow-y-auto border-b px-4 py-2"
        >
          <TocList items={items} active={active} onNavigate={() => setOpen(false)} />
        </nav>
      </details>
      <nav
        aria-label="Table of contents"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
      >
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          On this page
        </p>
        <TocList items={items} active={active} />
      </nav>
    </>
  )
}

function TocList({
  items,
  active,
  onNavigate,
}: {
  items: TocItem[]
  active: string
  onNavigate?: () => void
}) {
  return (
    <ol className="space-y-1">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "true" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex gap-2 border-l-2 py-1.5 pr-2 text-sm transition-colors",
              item.depth === 3 ? "pl-7" : "pl-3",
              active === item.id
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-ring hover:text-foreground"
            )}
          >
            <span className="font-mono text-xs leading-5 text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  )
}

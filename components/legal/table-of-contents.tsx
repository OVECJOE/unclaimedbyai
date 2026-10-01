"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type TocItem = { id: string; title: string }

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "")

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

  return (
    <>
      <details className="border bg-muted/40 lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-xs font-semibold tracking-widest uppercase">
          On this page
        </summary>
        <nav aria-label="Table of contents" className="border-t px-4 py-2">
          <TocList items={items} active={active} />
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

function TocList({ items, active }: { items: TocItem[]; active: string }) {
  return (
    <ol className="space-y-1">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "true" : undefined}
            className={cn(
              "flex gap-2 border-l-2 py-1.5 pr-2 pl-3 text-sm transition-colors",
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

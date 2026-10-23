"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { isActivePath, topNavItems } from "@/components/dashboard/nav"
import { Layout01Icon } from "@hugeicons/core-free-icons"

/**
 * The phone shell: a fixed bottom bar, four destinations, thumb reach.
 * Playground lands on the canvas, which opens the last-used sandbox or
 * the sandboxes list on its own, so the bar stays one link deep.
 */
export default function MobileNav() {
  const pathname = usePathname()
  const items = [
    ...topNavItems.slice(0, 1),
    { href: "/dashboard/playground", label: "Playground", icon: Layout01Icon },
    ...topNavItems.slice(1),
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-medium tracking-wide uppercase transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} className="size-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

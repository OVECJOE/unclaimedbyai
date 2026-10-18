import {
  CreditCardIcon,
  Folder02Icon,
  Home01Icon,
  UserIcon,
  Watch01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type NavItem = {
  href: string
  label: string
  icon: IconSvgElement
}

export const topNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home01Icon },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/dashboard/account", label: "Account", icon: UserIcon },
]

export const playgroundNavItems: NavItem[] = [
  {
    href: "/dashboard/playground/sandboxes",
    label: "Sandboxes",
    icon: Folder02Icon,
  },
  {
    href: "/dashboard/playground/watchlist",
    label: "Watchlist",
    icon: Watch01Icon,
  },
]

export const canvasHref = "/dashboard/playground"

/**
 * A link is active when the pathname is inside its section. The canvas
 * and its two subsections share one Playground section, and Home only
 * matches the bare /dashboard route so the section links never light it
 * up by prefix.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

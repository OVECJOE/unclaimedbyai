"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChevronDownIcon,
  Logout02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import Logo from "@/components/app/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { accountAvatarUrl } from "@/lib/avatar"
import { cn } from "@/lib/utils"
import type { ApiUser } from "@/lib/api"
import { signOut } from "@/app/dashboard/actions"
import {
  canvasHref,
  isActivePath,
  playgroundNavItems,
  topNavItems,
} from "@/components/dashboard/nav"

function UserAvatar({ user }: { user?: ApiUser | null }) {
  const src = user ? accountAvatarUrl(user) : null
  const initial = (user?.full_name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase()
  return (
    // Square overrides: the house style is flat and bordered, never
    // rounded. Avatar handles the image-failed fallback itself.
    <Avatar className="size-8 shrink-0 rounded-none border after:rounded-none">
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className="rounded-none bg-primary/10 text-xs font-semibold text-primary">
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}

function linkClass(active: boolean): string {
  return cn(
    "flex items-center gap-3 border-l-2 px-4 py-2 text-sm transition-colors",
    active
      ? "border-primary bg-primary/5 font-medium text-primary"
      : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
  )
}

/**
 * The desktop shell: one persistent rail, so the dashboard stops paying
 * for a header on every page. The Playground group folds because two
 * destinations do not deserve permanent vertical space, and its header
 * is the canvas itself, which is where the fold usually leads anyway.
 */
export default function DashboardSidebar({ user }: { user?: ApiUser | null }) {
  const pathname = usePathname()
  const playgroundActive = isActivePath(pathname, canvasHref)
  const [open, setOpen] = useState(playgroundActive)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-background md:flex">
      <div className="border-b px-4 py-5">
        <Logo className="h-7 w-auto" href="/dashboard" />
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto py-4">
        <Link
          href="/dashboard"
          aria-current={
            isActivePath(pathname, "/dashboard") ? "page" : undefined
          }
          className={linkClass(isActivePath(pathname, "/dashboard"))}
        >
          <HugeiconsIcon icon={topNavItems[0].icon} className="size-4" />
          Home
        </Link>

        <div className={linkClass(playgroundActive)}>
          <Link
            href={canvasHref}
            aria-current={pathname === canvasHref ? "page" : undefined}
            className="flex flex-1 items-center gap-3"
          >
            <HugeiconsIcon
              icon={playgroundNavItems[0].icon}
              className="size-4"
            />
            Playground
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Collapse playground" : "Expand playground"}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon
              icon={ChevronDownIcon}
              className={cn(
                "size-4 transition-transform",
                open ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
        </div>
        {open ? (
          <div className="border-l-2 border-transparent">
            <Link
              href={canvasHref}
              aria-current={pathname === canvasHref ? "page" : undefined}
              className={cn(
                "block py-2 pr-4 pl-11 text-sm transition-colors",
                pathname === canvasHref
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Canvas
            </Link>
            {playgroundNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActivePath(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "block py-2 pr-4 pl-11 text-sm transition-colors",
                  isActivePath(pathname, item.href)
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        {topNavItems.slice(1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              isActivePath(pathname, item.href) ? "page" : undefined
            }
            className={linkClass(isActivePath(pathname, item.href))}
          >
            <HugeiconsIcon icon={item.icon} className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">
              {user?.full_name || "Account"}
            </span>
            <span className="block truncate text-xs text-muted-foreground lowercase">
              {user?.email ?? "not signed in"}
            </span>
          </span>
        </div>
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 px-2 text-muted-foreground hover:text-destructive"
            onClick={() => void signOut()}
          >
            <HugeiconsIcon icon={Logout02Icon} className="size-4" />
            Sign out
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
            <Link href="/auth">
              <HugeiconsIcon icon={UserIcon} className="size-4" />
              Sign in
            </Link>
          </Button>
        )}
      </div>
    </aside>
  )
}

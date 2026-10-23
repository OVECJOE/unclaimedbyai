"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Compass01Icon, Logout02Icon } from "@hugeicons/core-free-icons"
import Logo from "@/components/app/logo"
import SoundToggle from "@/components/sound/sound-toggle"
import NotificationsBell from "@/components/dashboard/notifications-bell"
import { UserAvatar } from "@/components/dashboard/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTourStore } from "@/lib/store/tour"
import type { ApiUser } from "@/lib/api"
import { signOut } from "@/app/dashboard/actions"

export default function MobileHeader({ user }: { user: ApiUser }) {
  const [signingOut, setSigningOut] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
      <Logo className="h-6 w-auto" href="/dashboard" />
      <div className="flex items-center gap-1">
        <NotificationsBell />
        <SoundToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Account menu" className="flex">
              <UserAvatar user={user} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => useTourStore.getState().start()}>
              <HugeiconsIcon icon={Compass01Icon} />
              Take the tour
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true)
                void signOut().finally(() => setSigningOut(false))
              }}
            >
              <HugeiconsIcon icon={Logout02Icon} />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

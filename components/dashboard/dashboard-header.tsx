"use client"

import Logo from "@/components/app/logo"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu09Icon, UserIcon } from "@hugeicons/core-free-icons"
import { useCallback } from "react"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/account", label: "Account" },
]

export default function DashboardHeader() {
  const pathname = usePathname()

  const isActive = useCallback((href: string) => {
    const excludedPathsForDashboard = ["/dashboard/billing", "/dashboard/account"]
    if (href === "/dashboard" && excludedPathsForDashboard.some((path) => pathname.startsWith(path))) return false
    const slices = href.split("/").filter(Boolean)
    return slices.every((slice) => pathname.includes(slice))
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Logo className="h-8 w-auto" />

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1 text-muted-foreground transition-colors hover:text-primary",
                  "after:absolute after:-bottom-px after:left-0 after:h-[1.5px] after:bg-primary after:transition-all after:content-['']",
                  active ? "font-medium text-primary after:w-full" : "after:w-0 hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full p-0.5"
                aria-label="Account menu"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <HugeiconsIcon icon={UserIcon} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block font-heading text-sm font-semibold text-primary">@username</span>
                <span className="mt-0.5 block text-xs text-muted-foreground font-normal lowercase">
                  user@unclaimedby.ai
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/5 focus:text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="p-1 md:hidden"
              >
                <HugeiconsIcon icon={Menu09Icon} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-4 px-4">
                {navLinks.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "text-base transition-colors hover:text-primary",
                          active ? "font-medium text-primary" : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

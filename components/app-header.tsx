"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/components/logo"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu09Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
]

export default function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href
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

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            Sign in
          </Link>
          <Button asChild>
            <Link href="/auth">Get started</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu" className="p-1 md:hidden">
              <HugeiconsIcon icon={Menu09Icon} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-4 px-4">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <SheetClose key={link.href} asChild>
                    <Link
                      key={link.href}
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
              <Link href="/auth" className="text-base text-muted-foreground hover:text-primary">
                Sign in
              </Link>
              <Button className="mt-4" asChild>
                <Link href="/auth">Get started</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

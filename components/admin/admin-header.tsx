"use client"

import { useState } from "react"
import Logo from "@/components/app/logo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signOut } from "@/lib/blog/actions"
import type { Editor } from "@/lib/blog/types"
import Link from "next/link"

export default function AdminHeader({ editor }: { editor: Editor }) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 shrink-0 items-end gap-1.5">
          <Logo href="/admin/blog" className="h-6 w-auto sm:h-8" />
          <Link
            href="/admin/blog"
            aria-label="Blog admin home"
            className="pb-0.75 font-heading text-base leading-none text-primary sm:text-xl"
          >
            Admin
          </Link>
        </div>
        <div className="flex min-w-0 shrink-0 items-center gap-2 text-sm sm:gap-3">
          <span className="hidden truncate text-muted-foreground sm:block">
            {editor.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You’ll need a new sign-in link to get back into the blog admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <form action={signOut}>
              <Button type="submit" variant="destructive">
                Sign out
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

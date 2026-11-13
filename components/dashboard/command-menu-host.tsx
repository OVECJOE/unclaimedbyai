"use client"

import CommandMenu, { useCommandMenu } from "@/components/dashboard/command-menu"

/** Mounted once in the dashboard layout so the shortcut works everywhere. */
export default function CommandMenuHost() {
  const { open, setOpen } = useCommandMenu()
  return <CommandMenu open={open} onOpenChange={setOpen} />
}

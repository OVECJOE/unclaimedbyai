"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import NewSandboxDialog from "@/components/playground/new-sandbox-dialog"

/**
 * The sandboxes list's way to start a sandbox: a button that opens the
 * shared intake dialog. The list used to expand the form inline, which
 * shoved the page header apart when opened and carried its own copy of
 * every signal field; one dialog now serves the list and the canvas.
 */
export default function NewSandboxButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>New sandbox</Button>
      <NewSandboxDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

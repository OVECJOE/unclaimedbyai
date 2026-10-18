"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { nameToSlug } from "@/lib/utils"

/**
 * Copies the public /check/<name> permalink for a name. The link works
 * for whoever opens it: existing reports resolve, fresh names run the
 * free first check.
 */
export default function CopyPermalink({
  name,
  size = "sm",
  variant = "ghost",
}: {
  name: string
  size?: "sm" | "default"
  variant?: "ghost" | "outline"
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = `${window.location.origin}/check/${nameToSlug(name)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(`Link to ${name} copied.`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("The link could not be copied. Copy it from the address bar.")
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={copied}
      onClick={() => void copy()}
      className="flex-1 text-xs"
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  )
}

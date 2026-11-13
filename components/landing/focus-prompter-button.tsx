"use client"

import type { ComponentProps } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { fillPrompter, type PrompterMode } from "@/components/app/prompter"

/**
 * Sends the visitor to the page's one prompter instead of mounting a
 * second one (two prompters would mean two Turnstile widgets and two
 * fields with the same id). With no prompter on the page it goes home,
 * where there always is one. Extra props pass through, so a Radix
 * `asChild` parent (a sheet's close) can attach its own handler.
 */
export default function FocusPrompterButton({
  mode = "name",
  onClick,
  ...props
}: ComponentProps<typeof Button> & { mode?: PrompterMode }) {
  const router = useRouter()
  return (
    <Button
      type="button"
      size="lg"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (document.getElementById("prompt")) {
          fillPrompter({ value: "", mode })
          return
        }
        router.push(`/?mode=${mode}`)
      }}
    />
  )
}

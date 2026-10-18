"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CubeIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SignalProfile } from "@/lib/api"
import { useDashboardStore } from "@/lib/store/dashboard"
import SignalFields from "@/components/playground/signal-fields"

/**
 * The three-question intake as a dialog, with the remaining five behind
 * an expander. "Create and generate" saves a step for the common path:
 * name it, answer a little, and the first batch is already running.
 */
export default function NewSandboxDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const createAndOpen = useDashboardStore((state) => state.createAndOpen)
  const startGeneration = useDashboardStore((state) => state.startGeneration)
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState("")
  const [signals, setSignals] = useState<Partial<SignalProfile>>({})
  const [generateToo, setGenerateToo] = useState(true)

  async function create(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Give the sandbox a name so you can find it later.")
      return
    }
    setPending(true)
    try {
      const sandbox = await createAndOpen({ name: name.trim(), signals })
      if (!sandbox) {
        throw new Error("The sandbox could not be created.")
      }
      if (generateToo) {
        try {
          await startGeneration(sandbox.public_id, { count: 6 })
        } catch {
          // The board still opens; the generate panel explains what
          // went wrong and can start the run again.
        }
      }
      onOpenChange(false)
      router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The sandbox failed."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New sandbox</DialogTitle>
          <DialogDescription>
            Three questions start the steer. Answer the rest any time; a partial
            answer still beats a blank one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ns-name">Name</Label>
            <Input
              id="ns-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Weekend bets, B2B invoicing, ..."
              autoFocus
            />
          </div>
          <SignalFields
            signals={signals}
            onChange={setSignals}
            expanded={expanded}
          />
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-sm text-primary underline"
          >
            {expanded ? "Hide details" : "Answer more for sharper ideas"}
          </button>
          <div className="flex items-center gap-2">
            <Checkbox
              id="ns-generate"
              checked={generateToo}
              onCheckedChange={(checked) => setGenerateToo(checked === true)}
            />
            <Label htmlFor="ns-generate" className="font-normal">
              Generate the first batch of ideas now
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <HugeiconsIcon icon={CubeIcon} className="size-4" />
              {pending ? "Creating..." : "Create sandbox"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

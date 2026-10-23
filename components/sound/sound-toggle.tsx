"use client"

import { useSyncExternalStore } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { VolumeHighIcon, VolumeMuteIcon } from "@hugeicons/core-free-icons"
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
  subscribeSound,
} from "@/lib/sound/engine"
import { cn } from "@/lib/utils"

/**
 * The one control for the interface's voice. Toggling on answers
 * itself with a spark, so the switch proves it works; toggling off
 * gets one last tap, because the click itself still happened.
 */
export default function SoundToggle({ className }: { className?: string }) {
  const enabled = useSyncExternalStore(
    subscribeSound,
    isSoundEnabled,
    () => true
  )
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Mute interface sounds"
          : "Play interface sounds — every interaction has its own voice"
      }
      title={
        enabled
          ? "Sound on — each interaction has its own voice, unique to you"
          : "Sound off"
      }
      onClick={() => {
        const next = !isSoundEnabled()
        setSoundEnabled(next)
        if (next) playSound("spark", "sound-on")
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        className
      )}
    >
      <HugeiconsIcon
        icon={enabled ? VolumeHighIcon : VolumeMuteIcon}
        className="size-4"
      />
    </button>
  )
}

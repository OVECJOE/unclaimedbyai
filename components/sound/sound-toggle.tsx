"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { VolumeMuteIcon } from "@hugeicons/core-free-icons"
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
  subscribeActivity,
  subscribeSound,
} from "@/lib/sound/engine"
import { cn } from "@/lib/utils"

/**
 * The one control for the interface's voice. When sound is on it shows
 * three small level bars that jump whenever something plays, so the
 * switch always shows what it's doing. Toggling on answers itself with
 * a spark; toggling off gets one last tap.
 */
export default function SoundToggle({ className }: { className?: string }) {
  const enabled = useSyncExternalStore(
    subscribeSound,
    isSoundEnabled,
    () => true
  )
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let timer = 0
    const unsubscribe = subscribeActivity(() => {
      setPlaying(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setPlaying(false), 700)
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Turn interface sounds on"}
      title={
        enabled
          ? "Sound on. Your interface plays in its own key, unique to you."
          : "Sound off"
      }
      onClick={() => {
        const next = !isSoundEnabled()
        setSoundEnabled(next)
        if (next) playSound("spark", "sound-on")
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        enabled && playing && "text-primary",
        className
      )}
    >
      {enabled ? (
        <span
          aria-hidden
          data-playing={playing || undefined}
          className="uba-meter flex h-3.5 items-end gap-[3px]"
        >
          <span />
          <span />
          <span />
        </span>
      ) : (
        <HugeiconsIcon icon={VolumeMuteIcon} className="size-4" />
      )}
    </button>
  )
}

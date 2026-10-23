"use client"

import { useEffect } from "react"
import { playSound, type SoundMood } from "@/lib/sound/engine"

/**
 * Render once inside a view whose arrival deserves a cue — "check
 * your email", a fresh report, a completed unlock. Plays on mount and
 * never renders anything.
 */
export default function PlaySound({
  mood,
  seed,
}: {
  mood: SoundMood
  seed?: string
}) {
  useEffect(() => {
    playSound(mood, seed)
  }, [mood, seed])
  return null
}

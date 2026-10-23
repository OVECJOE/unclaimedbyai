import { playSound } from "@/lib/sound/engine"

/**
 * The completion moment. When a run settles while the visitor is
 * looking, they hear the chord. When it settles in a background tab,
 * the document title carries the news ("✓ …") so the tab itself asks
 * to be reopened — and the reward chord plays on return, pairing the
 * act of coming back with the payoff.
 */
export function announceCompletion(seed: string, flashTitle?: string): void {
  if (typeof window === "undefined") return
  if (document.visibilityState !== "hidden") {
    playSound("complete", seed)
    return
  }
  if (!flashTitle) return
  const original = document.title
  document.title = `✓ ${flashTitle}`
  let restored = false
  const restore = () => {
    if (restored) return
    if (document.visibilityState === "hidden") return
    restored = true
    document.removeEventListener("visibilitychange", restore)
    window.removeEventListener("focus", restore)
    document.title = original
    playSound("complete", seed)
  }
  document.addEventListener("visibilitychange", restore)
  window.addEventListener("focus", restore)
}

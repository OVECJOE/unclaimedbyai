"use client"

import { useEffect } from "react"
import {
  playSound,
  resumeSoundContext,
  syncSoundEnabledFromStorage,
  type SoundMood,
} from "@/lib/sound/engine"

const INTERACTIVE = "button, a[href], [role='button'], [data-sound]"

function moodOf(element: Element): SoundMood | null {
  const raw = element.getAttribute("data-sound")
  if (raw === "none") return null
  if (
    raw === "tap" ||
    raw === "launch" ||
    raw === "reveal" ||
    raw === "complete" ||
    raw === "error" ||
    raw === "spark" ||
    raw === "reward"
  ) {
    return raw
  }
  return "tap"
}

/**
 * Every control sounds like itself: the seed is the control's own
 * words (or its destination), salted per browser in the engine, so
 * the same button always sounds the same — and no two visitors hear
 * the same interface.
 */
function seedOf(element: Element): string {
  const explicit = element.getAttribute("data-sound-seed")
  if (explicit) return explicit
  const own = (element.textContent ?? "").trim()
  if (own) return own.slice(0, 80)
  const label = element.getAttribute("aria-label")
  if (label) return label.slice(0, 80)
  return (element.getAttribute("href") ?? "").slice(0, 80)
}

function targetOf(event: Event): Element | null {
  const { target } = event
  if (!(target instanceof Element)) return null
  return target.closest(INTERACTIVE)
}

function audible(element: Element): boolean {
  if (element.closest('[data-sound="none"]')) return false
  if (element instanceof HTMLButtonElement && element.disabled) return false
  if (element.getAttribute("aria-disabled") === "true") return false
  return true
}

/**
 * Mounted once in the root layout. Listens in the capture-free bubble
 * phase for the two gestures that mean "I pressed something" — the
 * pointer going down (instant, before the click lands) and the
 * keyboard activating a focused control. Everything else on the page
 * stays silent.
 */
export default function SoundBridge() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent): void {
      if (event.pointerType === "mouse" && event.button !== 0) return
      const element = targetOf(event)
      if (!element || !audible(element)) return
      const mood = moodOf(element)
      if (!mood) return
      resumeSoundContext()
      playSound(mood, seedOf(element))
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.repeat) return
      if (event.key !== "Enter" && event.key !== " ") return
      const element = targetOf(event)
      if (!element || !audible(element)) return
      const mood = moodOf(element)
      if (!mood) return
      resumeSoundContext()
      playSound(mood, seedOf(element))
    }

    function onStorage(event: StorageEvent): void {
      if (event.key === "uba-sound") syncSoundEnabledFromStorage()
    }

    // Every error toast in the app sounds, without touching a single
    // call site: sonner mounts each toast as
    // <li data-sonner-toast data-type="…">. Successes are sounded
    // where they earn it (watch, copy, payment) so they stay special.
    const toastObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue
          const toast =
            node.matches?.("li[data-sonner-toast]")
              ? node
              : node.querySelector?.("li[data-sonner-toast]")
          if (!toast || toast.getAttribute("data-type") !== "error") continue
          playSound("error", (toast.textContent ?? "error").slice(0, 80))
        }
      }
    })

    document.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    })
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("storage", onStorage)
    toastObserver.observe(document.body, { childList: true, subtree: true })
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("storage", onStorage)
      toastObserver.disconnect()
    }
  }, [])

  return null
}

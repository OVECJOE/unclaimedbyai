"use client"

import { create } from "zustand"

const SEEN_KEY = "uba-tour-seen"

function readSeen(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(SEEN_KEY) === "1"
}

/**
 * The dashboard tour's life support. The tour spans three pages, and
 * driver.js itself only lives as long as one page's DOM, so the store
 * carries the one thing that must survive a navigation: whether a tour
 * is still running. Each page's Tour mount rebuilds its steps from the
 * pathname and picks the tour back up; closing it anywhere marks it
 * seen so it never auto-runs again.
 */
type TourStore = {
  active: boolean
  seen: boolean
  start: () => void
  stop: () => void
  markSeen: () => void
}

export const useTourStore = create<TourStore>((set) => ({
  active: false,
  seen: readSeen(),
  start: () => set({ active: true }),
  // Wandered off the choreography: end the run without marking it seen,
  // so the sidebar button can start it again.
  stop: () => set({ active: false }),
  markSeen: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SEEN_KEY, "1")
    }
    set({ active: false, seen: true })
  },
}))

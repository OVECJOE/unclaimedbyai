"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { driver, type Driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useTourStore } from "@/lib/store/tour"
import { stepsFor } from "@/components/dashboard/tour-steps"

/**
 * The dashboard tour's engine, mounted once in the dashboard layout.
 *
 * driver.js only lives as long as one page's DOM, so this component
 * rebuilds the steps whenever the pathname changes and drives the act
 * that belongs to the new page, while the store keeps the run alive
 * across the navigation. A destroy we cause ourselves (page change)
 * continues the run; any destroy the user causes (close, escape,
 * overlay, finishing the last act) ends it and marks it seen.
 */
export default function DashboardTour() {
  const pathname = usePathname()
  const router = useRouter()
  const active = useTourStore((state) => state.active)
  const markSeen = useTourStore((state) => state.markSeen)
  const stop = useTourStore((state) => state.stop)
  const instanceRef = useRef<Driver | null>(null)
  const navigatingRef = useRef(false)
  const autoRunRef = useRef(false)

  // The magic-link handoff lands on /dashboard?welcome=1; that first
  // visit is when attention is highest, so the tour runs there once.
  useEffect(() => {
    if (autoRunRef.current) return
    autoRunRef.current = true
    const params = new URLSearchParams(window.location.search)
    if (params.get("welcome") !== "1") return
    if (useTourStore.getState().seen) return
    // Strip the flag so a refresh does not replay the tour.
    params.delete("welcome")
    const query = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    )
    useTourStore.getState().start()
  }, [])

  useEffect(() => {
    if (!active) {
      instanceRef.current?.destroy()
      instanceRef.current = null
      return
    }

    const navigate = (href: string) => {
      navigatingRef.current = true
      router.push(href)
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const steps = stepsFor(pathname, navigate)
    if (steps.length === 0) {
      // No act written for this page; end quietly without marking it
      // seen, so the run can resume from the sidebar later.
      stop()
      return
    }

    const instance = driver({
      steps,
      animate: !reduced,
      smoothScroll: true,
      allowClose: true,
      // The drop zone and the board's cards only exist once a sandbox
      // holds ideas; skipping keeps the tour honest on empty accounts.
      skipMissingElement: true,
      // The canvas page suspends behind a skeleton, so its anchors do
      // not exist in the first paint. Wait for them instead of letting
      // driver skip every step and end the run on arrival.
      waitForElement: 4000,
      overlayColor: "rgb(0 0 0)",
      overlayOpacity: 0.55,
      showProgress: true,
      progressText: "STEP {{current}} / {{total}}",
      popoverClass: "tour-popover",
      onDestroyed: () => {
        if (navigatingRef.current) {
          // Our own teardown for a page change: the next page's mount
          // picks the run up at its own first step.
          navigatingRef.current = false
          return
        }
        // close, escape, overlay, or finishing the final act.
        markSeen()
      },
    })
    instanceRef.current = instance
    instance.drive(0)

    return () => {
      instance.destroy()
      instanceRef.current = null
    }
  }, [active, pathname, router, markSeen, stop])

  return null
}

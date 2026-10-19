import type { DriveStep } from "driver.js"

/**
 * The tour's choreography, one page at a time.
 *
 * driver.js only lives as long as one page's DOM, so the tour is cut
 * into three page-sized acts. The last step of the first two carries
 * an onNextClick that navigates instead of advancing; the Tour mount
 * on the destination page rebuilds its steps from the pathname and
 * picks the tour up where the choreography left it. Elements are
 * addressed through data-tour attributes on the real components, so a
 * redesign moves the tour with the UI instead of breaking it.
 */

export const TOUR_ROUTES = {
  home: "/dashboard",
  canvas: "/dashboard/playground",
  watchlist: "/dashboard/playground/watchlist",
} as const

type Navigate = (href: string) => void

/** The steps for a pathname; empty means the tour has no act here. */
export function stepsFor(pathname: string, navigate: Navigate): DriveStep[] {
  if (pathname === TOUR_ROUTES.home) return homeSteps(navigate)
  if (pathname === TOUR_ROUTES.canvas) return canvasSteps(navigate)
  if (pathname === TOUR_ROUTES.watchlist) return watchlistSteps()
  return []
}

function homeSteps(navigate: Navigate): DriveStep[] {
  return [
    {
      element: '[data-tour="prompter"]',
      popover: {
        title: "Start with a brief",
        description:
          "Describe what you are building and press Generate: four naming studios and an editor turn it into scored name candidates. Name mode checks one exact name instead.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="stats"]',
      popover: {
        title: "Your month at a glance",
        description:
          "Searches, sandboxes, ideas, checks, and credits. Every number links to the place you act on it, so a dry allowance is one click from a top-up.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="activity"]',
      popover: {
        title: "Last 30 days",
        description:
          "Your searches and checks, day by day. The line climbs while you work and rests when you do not.",
        side: "left",
        align: "center",
      },
    },
    {
      element: '[data-tour="recent-sandboxes"]',
      popover: {
        title: "Everything starts in a sandbox",
        description:
          "A sandbox holds ideas the way a search holds names. Yours is waiting on the canvas.",
        side: "top",
        align: "center",
        nextBtnText: "Open the canvas",
        onNextClick: () => navigate(TOUR_ROUTES.canvas),
      },
    },
  ]
}

function canvasSteps(navigate: Navigate): DriveStep[] {
  return [
    {
      element: '[data-tour="switcher"]',
      popover: {
        title: "One sandbox at a time",
        description:
          "The chips above switch which sandbox the board is showing. Start a new one here whenever a fresh idea deserves its own steer.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="idea-board"]',
      popover: {
        title: "The board is yours",
        description:
          "Drag cards to reorder the batch. Open one to read its full canvas, buy its market research, or jump straight to the names it produced.",
        side: "top",
        align: "center",
        nextBtnText: "Try a drag",
      },
    },
    {
      element: '[data-tour="dropzone"]',
      popover: {
        title: "One drag to names",
        description:
          "Pull any card onto this strip and a search starts for that idea. Your first check on every name is free.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="generate"]',
      popover: {
        title: "When you want more",
        description:
          "Four to eight ideas per run, steered by a seed if you have one. Free accounts get three runs a day; they refill with the clock.",
        side: "left",
        align: "center",
        nextBtnText: "Next: keep a name",
        onNextClick: () => navigate(TOUR_ROUTES.watchlist),
      },
    },
  ]
}

function watchlistSteps(): DriveStep[] {
  return [
    {
      element: '[data-tour="watchlist-tabs"]',
      popover: {
        title: "Park a name, sleep at night",
        description:
          "Star any name you are considering. We recheck its domains and handles every few hours and email you the morning something changes. That is the whole loop: think, name, check, watch.",
        side: "top",
        align: "center",
        doneBtnText: "Start building",
      },
    },
  ]
}

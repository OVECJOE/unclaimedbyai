import type { NotificationItem } from "@/lib/api"

// Built by Vite's define — same source of truth as the panel.
const SITE = process.env.NEXT_PUBLIC_API_URL

const MENU_ID = "uba-screen-selection"
const ALARM_ID = "uba-watch-poll"

chrome.runtime.onInstalled.addListener(() => {
  // Toolbar click opens the side panel, same surface as the context
  // menu — one UI to keep honest.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {})
  // removeAll first: reloading an unpacked extension leaves the old
  // menu in place, and create() would then throw a duplicate-id error
  // taking down everything after it in this listener — the alarm.
  chrome.contextMenus.removeAll(() => {
    try {
      chrome.contextMenus.create({
        id: MENU_ID,
        title: 'Screen "%s" with Unclaimed AI',
        contexts: ["selection"],
      })
    } catch (error) {
      console.error("context menu create failed:", error)
    }
    // The daily engine: a watch sweep can free a .com or a handle while
    // the browser is open, and the badge is where that shows up.
    chrome.alarms.create(ALARM_ID, { periodInMinutes: 1 })
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return
  // Write the handoff first — the write is issued synchronously and
  // the panel cannot read before its bundle has loaded — but OPEN the
  // panel before any await: sidePanel.open() only honors a live user
  // gesture, and doing it inside storage.set().then() (what this
  // replaces) makes the API reject and the click vanish silently.
  void chrome.storage.session.set({
    selection: info.selectionText.slice(0, 400),
    sourceUrl: info.pageUrl ?? "",
    // Stamps the write: re-picking the same text must still fire the
    // storage change listener in an already-open panel (identical
    // values fire no change event).
    pickedAt: Date.now(),
  })
  if (tab?.id === undefined) {
    // No tab to anchor to (rare): the panel is just a page, so a tab
    // renders the exact same component.
    void chrome.tabs.create({ url: "index.html" })
    return
  }
  chrome.sidePanel.open({ tabId: tab.id }).catch((error) => {
    // Belt and braces: if the gesture check ever fails anyway, the
    // click still lands somewhere visible instead of nowhere.
    console.error("sidePanel.open failed, opening as a tab:", error)
    void chrome.tabs.create({ url: "index.html" })
  })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_ID) void pollWatches()
})

async function pollWatches(): Promise<void> {
  const { apiKey } = await chrome.storage.local.get("apiKey")
  if (typeof apiKey !== "string" || !apiKey) return
  try {
    const stored = await chrome.storage.local.get("afterId")
    const afterId = typeof stored.afterId === "number" ? stored.afterId : 0
    const res = await fetch(
      `${SITE}/api/v1/notifications?after_id=${afterId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )
    if (!res.ok) return
    const items = (await res.json()) as NotificationItem[]
    if (items.length === 0) return
    await chrome.storage.local.set({
      afterId: Math.max(afterId, ...items.map((item) => item.id)),
    })
    chrome.action.setBadgeBackgroundColor({ color: "#6d28d9" })
    chrome.action.setBadgeText({ text: String(Math.min(99, items.length)) })
  } catch {
    // Offline or mid-sleep: the next alarm tries again.
  }
}

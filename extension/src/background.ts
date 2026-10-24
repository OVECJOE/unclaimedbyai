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
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Screen "%s" with Unclaimed AI',
    contexts: ["selection"],
  })
  // The daily engine: a watch sweep can free a .com or a handle while
  // the browser is open, and the badge is where that shows up.
  chrome.alarms.create(ALARM_ID, { periodInMinutes: 1 })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return
  void chrome.storage.session
    .set({
      selection: info.selectionText.slice(0, 400),
      sourceUrl: info.pageUrl ?? "",
    })
    .then(() => {
      if (tab?.id !== undefined) {
        // Opening from a context-menu click is a user gesture, which
        // the sidePanel API requires.
        chrome.sidePanel.open({ tabId: tab.id }).catch(() => {})
      }
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

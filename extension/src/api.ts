import {
  apiRequest,
  type NotificationItem,
  type PendingName,
  type SearchResultsPayload,
} from "@/lib/api"

export const SITE = process.env.NEXT_PUBLIC_API_URL

export type ScreenResult = {
  searchId: number
  item: SearchResultsPayload["items"][number] | null
  pending: PendingName[]
  failed: boolean
  timedOut: boolean
}

function auth(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` }
}

/* ---------------------------------------------------------------- storage */

export async function loadApiKey(): Promise<string | null> {
  const { apiKey = null } = await chrome.storage.local.get("apiKey")
  return typeof apiKey === "string" && apiKey.startsWith("uba_live_")
    ? apiKey
    : null
}

export async function saveApiKey(apiKey: string | null): Promise<void> {
  await chrome.storage.local.set({ apiKey })
}

/** The context menu stashes the selection here before opening the panel. */
export async function getSelectionHandoff(): Promise<{
  selection?: string
  sourceUrl?: string
}> {
  return chrome.storage.session.get(["selection", "sourceUrl"])
}

/* ----------------------------------------------------------- watch notices */

/**
 * The badge's read-state cursor lives beside the key: events newer than
 * `afterId` are unseen, and both the alarm poller and the panel advance
 * it the same way the site's bell does.
 */
export async function syncNotifications(
  apiKey: string
): Promise<NotificationItem[]> {
  const stored = await chrome.storage.local.get("afterId")
  const afterId = typeof stored.afterId === "number" ? stored.afterId : 0
  const items = await apiRequest<NotificationItem[]>(
    `/api/v1/notifications?after_id=${afterId}`,
    { base: SITE, headers: auth(apiKey) }
  )
  if (items.length > 0) {
    await chrome.storage.local.set({
      afterId: Math.max(afterId, ...items.map((item) => item.id)),
    })
  }
  return items
}

/* ---------------------------------------------------------------- screening */

const ACTIVE_JOB = new Set(["queued", "running"])

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * One direct check plus its poll, the way the site does it in pieces:
 * POST the name (free first check per name per day, skipped Turnstile
 * because a key holder is signed in), then poll the search's results
 * until no job is queued or running — with a 45-second leash so the
 * panel can never hang on a stuck check.
 */
export async function screenName(
  name: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<ScreenResult> {
  const headers = auth(apiKey)
  const created = await apiRequest<{ search_id: number; name_id: number }>(
    "/api/v1/checks/direct",
    { method: "POST", body: { name }, base: SITE, headers, signal }
  )

  const deadline = Date.now() + 45_000
  let last: SearchResultsPayload | null = null
  while (Date.now() < deadline) {
    last = await apiRequest<SearchResultsPayload>(
      `/api/v1/searches/${created.search_id}/results`,
      { base: SITE, headers, signal }
    )
    // A pending entry with no job yet is still spawning; only terminal
    // statuses mean the checks have stopped moving.
    const working = last.pending.some(
      (entry) => !entry.job || ACTIVE_JOB.has(entry.job.status)
    )
    if (!working) {
      const failed = last.pending.some(
        (entry) =>
          entry.job?.status === "failed" || entry.job?.status === "canceled"
      )
      return {
        searchId: created.search_id,
        item: last.items[0] ?? null,
        pending: last.pending,
        failed,
        timedOut: false,
      }
    }
    await sleep(1200)
  }

  return {
    searchId: created.search_id,
    item: last?.items[0] ?? null,
    pending: last?.pending ?? [],
    failed: false,
    timedOut: true,
  }
}

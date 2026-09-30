const MAX_ATTEMPTS = 3
const RETRYABLE_STATUSES = new Set([502, 503, 504])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Drop-in fetch with transparent retries for transient connection-level
// failures. Only retried when fetch itself throws (no HTTP response was
// received) or the gateway reports 502/503/504. Application-level
// responses pass straight through, so error semantics are unchanged.
export async function fetchWithRetry(
  url: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, init)
      if (!RETRYABLE_STATUSES.has(response.status)) return response
      try {
        await response.arrayBuffer()
      } catch {
        // ignore body-drain errors; we are retrying anyway
      }
      lastError = new Error(
        `Neon endpoint unavailable (HTTP ${response.status})`
      )
    } catch (error) {
      lastError = error
    }
    if (attempt < MAX_ATTEMPTS) await sleep(250 * 2 ** (attempt - 1))
  }
  throw lastError
}

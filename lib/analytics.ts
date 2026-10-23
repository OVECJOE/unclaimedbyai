import { getAnonSessionId } from "@/lib/anon"

/**
 * First-party funnel events. One POST to our own `/api/v1/events`,
 * which writes a structured line to the server's log stream — no
 * third-party script, no cookies beyond the session we already keep,
 * no PII (the brief text never travels, only its mode).
 *
 * `keepalive` lets the last beat survive navigation: the event that
 * matters most — starting checkout, submitting the brief — often
 * happens on the way out of a page.
 *
 * The name is machine vocabulary (lowercase, bounded) so the log
 * stays greppable; a bad name is dropped here rather than rejected
 * in the network tab.
 */
const NAME_RE = /^[a-z0-9_.:-]{1,64}$/

export function track(name: string, detail?: string): void {
  if (typeof window === "undefined") return
  if (!NAME_RE.test(name)) return
  try {
    void fetch("/api/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        name,
        path: window.location.pathname.slice(0, 300),
        detail: detail?.slice(0, 120) ?? null,
        anon_session_id: getAnonSessionId(),
      }),
    }).catch(() => {
      // The funnel never breaks the product.
    })
  } catch {
    // Same, for environments without fetch at all.
  }
}

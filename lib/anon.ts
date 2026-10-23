export const ANON_SESSION_KEY = "uba-anon-session"
const ANON_COOKIE = "uba-anon-session"

function fallbackUuid(): string {
  const hex = "0123456789abcdef"
  const bytes = new Uint8Array(16)
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  let out = ""
  for (let i = 0; i < 16; i += 1) {
    if (i === 4 || i === 6 || i === 8 || i === 10) out += "-"
    out += hex[bytes[i] >> 4] + hex[bytes[i] & 0x0f]
  }
  return out
}

function newSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : fallbackUuid()
}

function readCookie(): string | null {
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ANON_COOKIE}=`))
    return match ? decodeURIComponent(match.slice(ANON_COOKIE.length + 1)) : null
  } catch {
    return null
  }
}

function writeCookie(value: string): void {
  try {
    document.cookie = `${ANON_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
  } catch {
    // Cookies unavailable; the in-memory value still holds for this load.
  }
}

// One id per page load when storage is blocked (private modes), so a
// sandbox created in this tab is the same one the next call reads.
let memorySessionId: string | null = null

export function getAnonSessionId(): string {
  try {
    const existing = localStorage.getItem(ANON_SESSION_KEY)
    if (existing) return existing
    const fresh = memorySessionId ?? newSessionId()
    memorySessionId = fresh
    localStorage.setItem(ANON_SESSION_KEY, fresh)
    writeCookie(fresh)
    return fresh
  } catch {
    const existing = readCookie()
    if (existing) {
      memorySessionId = existing
      return existing
    }
    const fresh = memorySessionId ?? newSessionId()
    memorySessionId = fresh
    writeCookie(fresh)
    return fresh
  }
}

export function clearAnonSessionId(): void {
  memorySessionId = null
  try {
    localStorage.removeItem(ANON_SESSION_KEY)
  } catch {
    // Storage unavailable; nothing to clear.
  }
  try {
    document.cookie = `${ANON_COOKIE}=; path=/; max-age=0`
  } catch {
    // Cookies unavailable; nothing to clear.
  }
}

// The one-shot "claim my anonymous work when I next arrive signed in"
// flag, armed ONLY by the sign-in buttons on the anon results page.
// A sign-in from anywhere else must never silently adopt searches the
// user never chose to keep — that is how anonymous work quietly pushed
// people over their plan's monthly count.
const CLAIM_INTENT_KEY = "uba-claim-on-signin"

export function armClaimOnSignIn(): void {
  try {
    localStorage.setItem(CLAIM_INTENT_KEY, getAnonSessionId())
  } catch {
    // Storage unavailable; the click simply won't claim.
  }
}

export function readClaimIntent(): string | null {
  try {
    return localStorage.getItem(CLAIM_INTENT_KEY)
  } catch {
    return null
  }
}

export function clearClaimIntent(): void {
  try {
    localStorage.removeItem(CLAIM_INTENT_KEY)
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

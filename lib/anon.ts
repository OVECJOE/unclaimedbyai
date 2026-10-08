export const ANON_SESSION_KEY = "uba-anon-session"

export function getAnonSessionId(): string {
  try {
    const existing = localStorage.getItem(ANON_SESSION_KEY)
    if (existing) return existing
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(ANON_SESSION_KEY, fresh)
    return fresh
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export function clearAnonSessionId(): void {
  try {
    localStorage.removeItem(ANON_SESSION_KEY)
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

export const ANON_SESSION_KEY = "uba-anon-session"

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

export function getAnonSessionId(): string {
  try {
    const existing = localStorage.getItem(ANON_SESSION_KEY)
    if (existing) return existing
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : fallbackUuid()
    localStorage.setItem(ANON_SESSION_KEY, fresh)
    return fresh
  } catch {
    return fallbackUuid()
  }
}

export function clearAnonSessionId(): void {
  try {
    localStorage.removeItem(ANON_SESSION_KEY)
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

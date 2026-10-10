import { useSyncExternalStore } from "react"

export const CONSENT_COOKIE = "uba-consent"

export type ConsentChoice = "accepted" | "declined"

const EMPTY_SUBSCRIBE = () => () => {}

function cookieSnapshot(): string {
  return typeof document === "undefined" ? "" : document.cookie
}

function parseChoice(cookieString: string): ConsentChoice | null {
  const row = cookieString
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
  const value = row?.split("=")[1]
  return value === "accepted" || value === "declined" ? value : null
}

/**
 * Reads the stored consent choice. document.cookie is external state, so
 * it's read through useSyncExternalStore: the server (and the hydration
 * pass) see an empty snapshot, then the client resolves the real value.
 */
export function useConsent(): ConsentChoice | null {
  const cookieString = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    cookieSnapshot,
    () => ""
  )
  return parseChoice(cookieString)
}

export function writeConsent(value: ConsentChoice): void {
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`
}

export function isSafeCoverUrl(value: string | null | undefined): boolean {
  if (!value) return false
  if (value.startsWith("/")) return !value.startsWith("//")
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

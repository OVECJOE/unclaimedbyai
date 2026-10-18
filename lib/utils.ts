export { cn } from "cn"

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", "")
}

export function nameToSlug(name: string): string {
  return name.trim().replace(/-/g, "--").replace(/\s+/g, "-")
}

export function slugToName(slug: string): string {
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    decoded = slug
  }
  return decoded
    .replace(/-{2}/g, "\u0000")
    .replace(/-/g, " ")
    .replace(/\u0000/g, "-")
    .trim()
}

export function localDayKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function shiftLocalDays(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number)
  if (!year || !month || !day) return key
  return localDayKey(new Date(year, month - 1, day + days))
}

export function localDayDiff(from: string, to: string): number {
  const parse = (key: string): number => {
    const [year, month, day] = key.split("-").map(Number)
    if (!year || !month || !day) return Number.NaN
    return new Date(year, month - 1, day).getTime()
  }
  const fromMs = parse(from)
  const toMs = parse(to)
  if (Number.isNaN(fromMs) || Number.isNaN(toMs))
    return Number.POSITIVE_INFINITY
  return Math.round((toMs - fromMs) / 86400000)
}

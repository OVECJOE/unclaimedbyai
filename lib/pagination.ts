export function getVisiblePages(
  currentPage: number,
  pageCount: number,
  windowSize = 3
): number[] {
  const last = Math.max(pageCount, 0)
  const clamped = Math.min(Math.max(currentPage, 1), last || 1)
  const start = Math.floor((clamped - 1) / windowSize) * windowSize + 1

  const pages: number[] = []
  for (let page = start; page <= last && page < start + windowSize; page++) {
    pages.push(page)
  }
  return pages
}

export function clampPage(page: number, pageCount: number): number {
  if (Number.isNaN(page)) return 1
  return Math.min(Math.max(page, 1), Math.max(pageCount, 1))
}
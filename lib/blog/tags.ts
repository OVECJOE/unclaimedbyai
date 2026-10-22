/**
 * Tags are stored lowercase and free-form (the admin form lowercases and
 * trims them), so the archive URL is derived, not stored: one normalizer
 * shared by the store queries, the tag routes and the links in post
 * headers. Anything that is not a letter or a digit collapses into a
 * single hyphen, and edge hyphens are trimmed, so "AI Collision Detection"
 * and "ai collision detection" land on the same /blog/tag/ai-collision-detection.
 */
export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Words a title-case pass must keep short. CSS text-transform:
// capitalize would render "ai collision detection" as "Ai Collision
// Detection", and an "Ai" heading is exactly the kind of detail that
// makes a page look machine-stamped.
const ACRONYMS = new Set([
  "ai", "api", "crm", "cta", "gpt", "llm", "llms", "mvp", "rdap", "saas",
  "seo", "ui", "ux",
])

/**
 * Display casing for a stored (lowercase) tag: every word capitalized,
 * acronyms kept short. "ai collision detection" becomes "AI Collision
 * Detection"; chips keep rendering the raw tag under uppercase CSS.
 */
export function tagToDisplay(tag: string): string {
  return tag
    .trim()
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (ACRONYMS.has(lower)) return lower.toUpperCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}

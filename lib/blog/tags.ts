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

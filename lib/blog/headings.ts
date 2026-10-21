import "server-only"

import GithubSlugger from "github-slugger"
import { toString } from "mdast-util-to-string"
import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import type { Heading } from "mdast"

export type HeadingItem = { id: string; title: string; depth: 2 | 3 }

// The same parser stack the validator and the renderer use, so the tree
// walked here matches the tree that ends up in the page.
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)

/**
 * Extract the h2/h3 outline of a post body for the table of contents.
 *
 * The `id` values must match the anchors rehype-slug writes at render
 * time, which runs github-slugger over every heading in document order
 * (h1 included, dedupe counters and all). This walks the same headings
 * in the same order with the same slugger before filtering to h2/h3 for
 * display, so the links land on the real anchors. Unparseable bodies
 * simply render without a TOC.
 */
export function extractHeadings(source: string): HeadingItem[] {
  let tree
  try {
    tree = parser.parse(source)
  } catch {
    return []
  }

  const slugger = new GithubSlugger()
  const headings: HeadingItem[] = []

  visit(tree, "heading", (node: Heading) => {
    const title = toString(node).trim()
    const id = slugger.slug(title)
    if (node.depth === 2 || node.depth === 3) {
      headings.push({ id, title, depth: node.depth })
    }
  })

  return headings
}

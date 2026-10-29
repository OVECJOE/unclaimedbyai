import "server-only"

import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)

export function markdownToPlainText(markdown: string): string {
  let tree
  try {
    tree = parser.parse(markdown)
  } catch {
    return markdown
  }

  const chunks: string[] = []
  visit(tree, (node) => {
    if (
      node.type === "text" ||
      node.type === "inlineCode" ||
      node.type === "code"
    ) {
      chunks.push(node.value)
    }
  })

  return chunks.join(" ").replace(/\s+/g, " ").trim()
}

import "server-only"

import { createHash } from "node:crypto"
import { evaluate } from "@mdx-js/mdx"
import type { Root } from "mdast"
import * as runtime from "react/jsx-runtime"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { SKIP, visit } from "unist-util-visit"
import { mdxComponents } from "@/components/blog/widgets"

const BLOCKED = new Set(["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"])

const COMPILE_CACHE_LIMIT = 50

type Compiled = Awaited<ReturnType<typeof evaluate>>

type LooseNode = {
  type: string
  attributes?: { type: string; value?: unknown }[]
}

function remarkRestrict() {
  return (tree: Root) => {
    visit(tree, (raw, index, parent) => {
      const node = raw as unknown as LooseNode

      if (parent && index !== undefined && BLOCKED.has(node.type)) {
        ;(parent.children as unknown[]).splice(index, 1)
        return [SKIP, index]
      }

      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        node.attributes = (node.attributes ?? []).filter(
          (attribute) =>
            attribute.type === "mdxJsxAttribute" &&
            (attribute.value == null || typeof attribute.value === "string")
        )
      }
    })
  }
}

const compiled = new Map<string, Promise<Compiled>>()

function compile(source: string): Promise<Compiled> {
  const key = createHash("sha256").update(source).digest("hex")
  const hit = compiled.get(key)
  if (hit) return hit

  const pending = evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkRestrict],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  })

  if (compiled.size >= COMPILE_CACHE_LIMIT) {
    const oldest = compiled.keys().next().value
    if (oldest !== undefined) compiled.delete(oldest)
  }
  compiled.set(key, pending)
  void pending.catch(() => compiled.delete(key))

  return pending
}

export async function MdxContent({ source }: { source: string }) {
  const { default: Content } = await compile(source)

  return <Content components={mdxComponents} />
}

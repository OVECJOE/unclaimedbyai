import { evaluate } from "@mdx-js/mdx"
import type { Root } from "mdast"
import * as runtime from "react/jsx-runtime"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { SKIP, visit } from "unist-util-visit"
import { mdxComponents } from "@/components/blog/widgets"

const BLOCKED = new Set(["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"])

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

export async function MdxContent({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkRestrict],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  })

  return <Content components={mdxComponents} />
}

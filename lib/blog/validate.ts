import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { widgetByName, WIDGETS } from "./widgets/meta"
import type { ContentIssue } from "./types"

type Attribute = {
  type: string
  name?: string
  value?: unknown
}

type MdxNode = {
  type: string
  name?: string | null
  attributes?: Attribute[]
  children?: unknown[]
  position?: { start: { line: number } }
}

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)

export function validateMdx(source: string): ContentIssue[] {
  const issues: ContentIssue[] = []
  let tree

  try {
    tree = parser.parse(source)
  } catch (error) {
    const e = error as { reason?: string; message?: string; line?: number }
    return [
      {
        line: e.line ?? undefined,
        message: `${
          e.reason ?? e.message ?? "Could not read this content"
        }. A literal < or { must be written as \\< or \\{, or placed inside backticks.`,
      },
    ]
  }

  const available = WIDGETS.map((widget) => widget.name).join(", ")

  visit(tree, (raw) => {
    const node = raw as unknown as MdxNode
    const line = node.position?.start.line

    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    ) {
      issues.push({
        line,
        message:
          "Code and curly-brace expressions are not allowed. Use backticks to show code or braces as text.",
      })
      return
    }

    if (
      node.type !== "mdxJsxFlowElement" &&
      node.type !== "mdxJsxTextElement"
    ) {
      return
    }

    const widget = node.name ? widgetByName.get(node.name) : undefined

    if (!widget) {
      issues.push({
        line,
        message: `Unknown widget <${node.name ?? ""}>. Available widgets: ${available}.`,
      })
      return
    }

    if (!widget.hasChildren && node.children?.length) {
      issues.push({ line, message: `<${widget.name}> cannot contain content.` })
    }

    const attributes = node.attributes ?? []

    for (const attribute of attributes) {
      if (
        attribute.type !== "mdxJsxAttribute" ||
        (typeof attribute.value === "object" && attribute.value !== null)
      ) {
        issues.push({
          line,
          message: `<${widget.name}> only accepts plain text properties.`,
        })
      }
    }

    for (const prop of widget.props) {
      const attribute = attributes.find((a) => a.name === prop.name)
      const value = typeof attribute?.value === "string" ? attribute.value : ""

      if (prop.required && !value.trim()) {
        issues.push({
          line,
          message: `<${widget.name}> needs "${prop.label}" to be filled in.`,
        })
        continue
      }

      if (!value) continue

      if (prop.options && !prop.options.includes(value)) {
        issues.push({
          line,
          message: `<${widget.name}> "${prop.label}" must be one of: ${prop.options.join(", ")}.`,
        })
      }

      if (prop.pattern && !new RegExp(prop.pattern).test(value)) {
        issues.push({
          line,
          message: `<${widget.name}> "${prop.label}" must start with / or https://.`,
        })
      }
    }

    const known = new Set(widget.props.map((prop) => prop.name))
    for (const attribute of attributes) {
      if (attribute.name && !known.has(attribute.name)) {
        issues.push({
          line,
          message: `<${widget.name}> has no property called "${attribute.name}".`,
        })
      }
    }
  })

  return issues
}

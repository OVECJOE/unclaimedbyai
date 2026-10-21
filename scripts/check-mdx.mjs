#!/usr/bin/env node
/**
 * Pre-flight MDX validator for content SQL — the same rules the admin
 * CMS enforces in lib/blog/validate.ts, run before the SQL ever reaches
 * Neon. Pass either a raw .mdx file or a SQL file whose body sits
 * between $mdx$ ... $mdx$ markers (as in db/content/*.sql).
 *
 *   node scripts/check-mdx.mjs db/content/my-new-post.sql
 *
 * Kept as a port rather than an import because validate.ts uses
 * extensionless relative imports that Node's TypeScript stripping does
 * not resolve. If validate.ts changes rules, change them here too.
 */

import { readFileSync } from "node:fs"
import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { WIDGETS, widgetByName } from "../lib/blog/widgets/meta.ts"

const file = process.argv[2]
if (!file) {
  console.error("Usage: node scripts/check-mdx.mjs <file.mdx|file.sql>")
  process.exit(1)
}

let source = readFileSync(file, "utf8")
const open = source.indexOf("$mdx$\n")
const close = source.lastIndexOf("\n$mdx$")
if (open !== -1 && close > open) source = source.slice(open + 5, close)

const BLOCKED = new Set(["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"])

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)
const issues = []

let tree
try {
  tree = parser.parse(source)
} catch (error) {
  const e = error
  console.error(
    `line ${e.line ?? "?"}: ${e.reason ?? e.message}. ` +
      "A literal < or { must be written as \\\\ or placed inside backticks."
  )
  process.exit(1)
}

visit(tree, (raw) => {
  const node = raw
  const line = node.position?.start.line

  if (BLOCKED.has(node.type)) {
    issues.push({
      line,
      message:
        "Code and curly-brace expressions are not allowed. Use backticks to show code or braces as text.",
    })
    return
  }

  if (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement") {
    return
  }

  const widget = node.name ? widgetByName.get(node.name) : undefined
  if (!widget) {
    const available = WIDGETS.map((entry) => entry.name).join(", ")
    issues.push({
      line,
      message: `Unknown widget <${node.name ?? ""}>. Available: ${available}`,
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
        message: `<${widget.name}> "${prop.label}" must be one of: ${prop.options.join(", ")}`,
      })
    }
    if (prop.pattern && !new RegExp(prop.pattern).test(value)) {
      issues.push({
        line,
        message: `<${widget.name}> "${prop.label}" is invalid.`,
      })
    }
  }

  const known = new Set(widget.props.map((prop) => prop.name))
  for (const attribute of attributes) {
    if (attribute.name && !known.has(attribute.name)) {
      issues.push({
        line,
        message: `<${widget.name}> has no property called "${attribute.name}"`,
      })
    }
  }
})

if (issues.length) {
  for (const issue of issues) {
    console.error(`line ${issue.line ?? "?"}: ${issue.message}`)
  }
  process.exit(1)
}

const headings = []
visit(tree, "heading", (node) => {
  if (node.depth === 2 || node.depth === 3) {
    const title = node.children
      .map((child) => child.value ?? "")
      .join("")
      .trim()
    headings.push(`${"  ".repeat(node.depth - 2)}h${node.depth} ${title}`)
  }
})
console.log(`OK: ${file} (${source.split(/\s+/).length} words)`)
if (headings.length) console.log("Outline:\n" + headings.join("\n"))

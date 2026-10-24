/**
 * Selection triage: name, idea, or rough brief.
 *
 * Runs on-device, for free, on purpose. Highlighted text is the user's
 * private working memory, so nothing here leaves the browser until they
 * press a button — and a heuristic that is wrong *shows its reasoning*
 * and lets them overrule it in one tap. Hosted decision models (Jev at
 * $0.042/1M input tokens, OpenAI Decisions at $0.10) only earn their
 * cost when these rules provably miss; until then the budget line is
 * zero and the latency is one frame.
 */

export type TextKind = "name" | "idea" | "rough"

export type Classification = {
  kind: TextKind
  confidence: number
  reason: string
}

/** Reads like something to build rather than something to call it. */
const PRODUCT_MARKERS =
  /\b(app|application|platform|tool|website|service|plugin|extension|dashboard|marketplace|that|with|helps?|lets? you|users?|customers?|instead of)\b/i

/** Admits it is unfinished — the studio's whole job. */
const VAGUE_MARKERS =
  /\b(maybe|idk|no idea|not sure|somehow|something like|thinking about|help me|could be|should be|would be|kind of|looking for)\b/i

const DOMAIN_SHAPE = /^[\w-]+\.(com|ai|io|co|app|dev|xyz|net|org)(\/\S*)?$/i

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function classify(raw: string): Classification {
  const text = raw
    .trim()
    .replace(/^["'“”‘’*\-•\s]+/, "")
    .replace(/["'“”‘’*\-•\s]+$/, "")

  const count = wordCount(text)
  if (count === 0) {
    return { kind: "name", confidence: 0, reason: "Nothing to read yet." }
  }

  if (DOMAIN_SHAPE.test(text)) {
    return {
      kind: "name",
      confidence: 0.97,
      reason: "That is already a domain — screen it like a name.",
    }
  }

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const vague = VAGUE_MARKERS.test(text)
  const product = PRODUCT_MARKERS.test(text)

  // Short, punctuation-free, nothing to argue with: a name is a label,
  // not a sentence.
  if (count <= 4 && !/[.!?]/.test(text)) {
    return {
      kind: "name",
      confidence: product ? 0.82 : 0.93,
      reason: product
        ? "Short and noun-shaped, though it hints at a product — most likely a name."
        : count === 1
          ? "One word, no sentence to it — reads like a name."
          : `${count} words, no sentence to it — reads like a name.`,
    }
  }

  // Long, multi-sentence, or openly exploratory: give it to the studios.
  if (count > 14 || sentences.length >= 2 || (vague && count > 8)) {
    return {
      kind: "rough",
      confidence: count > 20 || sentences.length >= 2 ? 0.9 : 0.78,
      reason: vague && count > 8
        ? "Exploratory and unfinished — the studio can shape it first."
        : sentences.length >= 2
          ? "Several thoughts in a row — that is a brief, not a name."
          : `${count} words in one breath — that is a brief, not a name.`,
    }
  }

  if (product || count >= 5) {
    return {
      kind: "idea",
      confidence: product ? 0.88 : 0.72,
      reason: product
        ? "Describes a thing to build — hand it to the naming studios."
        : "A phrase with too much to say to be a name — likely an idea.",
    }
  }

  return {
    kind: "name",
    confidence: 0.7,
    reason: "Short and label-like — probably a name.",
  }
}

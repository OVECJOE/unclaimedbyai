#!/usr/bin/env node
/**
 * Collision study collector — the raw data behind the data-study blog post.
 *
 * Mirrors the production probe in ../unclaimedbyai-api/app/services/ai.py
 * (COLLISION_SYSTEM_PROMPT, temperature 0, loose JSON parse, hard/minor/
 * clean verdict, 6 concurrent slots, latency measured around the call
 * itself). If that prompt ever changes, change it here too and rerun the
 * study — the post quotes the prompt verbatim as its methodology.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-... node scripts/collision-study.mjs [options]
 *
 * Options:
 *   --n <count>          number of study names (default 300)
 *   --source <src>       public | synthetic | file   (default public)
 *   --file <path>        names, one per line (implies --source file).
 *                        Prefix a line with a set label to group stats,
 *                        e.g. "real:Velora". Without a prefix the set is
 *                        "file".
 *   --models <a,b,c>     OpenRouter model ids (default: the production trio)
 *   --concurrency <n>    parallel probes (default 6, the PROBE_SLOTS cap)
 *   --api <url>          backend origin for public-top (default https://www.unclaimedbyai.com)
 *   --out <dir>          output directory (default public/studies/, the
 *                        web-served home of the published raw log)
 *   --no-control         skip the ~30 famous-brand positive control set
 *   --resume             skip name/model pairs already in the output file
 *   --summary-only       recompute the summary from an existing output file
 *
 * Outputs:
 *   <out>/collision-study-<date>.jsonl   one line per probe (the raw data)
 *   <out>/collision-study-<date>.md      paste-ready stats block for the post
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const PRODUCTION_MODELS = "openai/gpt-5,anthropic/claude-sonnet-5,perplexity/sonar"

// Keep in sync with COLLISION_SYSTEM_PROMPT in app/services/ai.py.
const COLLISION_SYSTEM_PROMPT =
  "You will be given a single word or short name in isolation, with no " +
  "other context. Report what you already know it refers to, if anything " +
  "— an existing company, product, public figure, place, or common " +
  "word/phrase. If you have no strong association, say so plainly; do " +
  "not invent one. Respond ONLY with JSON: " +
  '{"known_as": "...", "confidence": "none"|"weak"|"strong", ' +
  '"category": "company"|"product"|"person"|"place"|"common_word"|"none"}. ' +
  "No prose, no markdown fences."

const CONFIDENCES = new Set(["none", "weak", "strong"])
const CATEGORIES = new Set([
  "company", "product", "person", "place", "common_word", "none",
])

// Positive control: names every model should already associate with a
// company. If this set does not flag near-universally, the probe (or the
// API key's models) is broken and the rest of the run is meaningless.
const CONTROL_NAMES = [
  "Spotify", "Notion", "Figma", "Stripe", "Slack", "Zoom", "Canva",
  "Duolingo", "Airbnb", "Uber", "Netflix", "Shopify", "Dropbox", "Asana",
  "Trello", "Zapier", "Twilio", "Datadog", "Miro", "Loom", "Calendly",
  "Substack", "Gumroad", "Ramp", "Plaid", "Vercel", "Supabase", "Reddit",
  "Wikipedia", "Pinterest",
]

function parseArgs(argv) {
  const args = {
    n: 300,
    source: "public",
    models: PRODUCTION_MODELS,
    concurrency: 6,
    api: process.env.API_URL ?? "https://www.unclaimedbyai.com",
    out: "public/studies",
    file: "",
    control: true,
    resume: false,
    summaryOnly: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const value = argv[i + 1]
    switch (flag) {
      case "--n": args.n = Number(value); i += 1; break
      case "--source": args.source = value; i += 1; break
      case "--models": args.models = value; i += 1; break
      case "--concurrency": args.concurrency = Number(value); i += 1; break
      case "--api": args.api = value; i += 1; break
      case "--out": args.out = value; i += 1; break
      case "--file": args.file = value; args.source = "file"; i += 1; break
      case "--no-control": args.control = false; break
      case "--resume": args.resume = true; break
      case "--summary-only": args.summaryOnly = true; break
      case "--help":
        console.log("See the header comment in scripts/collision-study.mjs")
        process.exit(0)
        break
      default:
        console.error(`Unknown flag: ${flag}`)
        process.exit(1)
    }
  }
  if (args.file) args.source = "file"
  return args
}

const args = parseArgs(process.argv.slice(2))
const dateKey = new Date().toISOString().slice(0, 10)
const jsonlPath = join(args.out, `collision-study-${dateKey}.jsonl`)
const summaryPath = join(args.out, `collision-study-${dateKey}.md`)
const models = args.models.split(",").map((m) => m.trim()).filter(Boolean)
const openrouterBase =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1"

function sanitizeName(raw) {
  return [...raw].filter((ch) => ch.codePointAt(0) >= 32).join("").trim().slice(0, 120)
}

/** Deterministic PRNG so the synthetic set is reproducible across runs. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SYNTHETIC_ROOTS = [
  "vel", "karm", "zeph", "brim", "lumo", "tand", "orvi", "nexa", "quill", "sable",
  "har", "mendi", "pavo", "rill", "sova", "tess", "umbra", "wren", "yara", "zinn",
  "corvi", "dax", "elin", "fjord", "gale", "helio", "iona", "juno", "kelv", "lyra",
]
const SYNTHETIC_TAILS = [
  "ara", "io", "ex", "ify", "ova", "une", "ista", "on", "ely", "um",
  "ique", "an", "ora", "is", "eo", "yx",
]

function syntheticNames(count) {
  const rand = mulberry32(20261021)
  const names = []
  const seen = new Set()
  while (names.length < count) {
    const root = SYNTHETIC_ROOTS[Math.floor(rand() * SYNTHETIC_ROOTS.length)]
    const tail = SYNTHETIC_TAILS[Math.floor(rand() * SYNTHETIC_TAILS.length)]
    const name = root + tail
    if (seen.has(name)) continue
    seen.add(name)
    names.push(name.charAt(0).toUpperCase() + name.slice(1))
  }
  return names
}

async function loadNames() {
  const withControl = (entries) =>
    args.control
      ? [...entries, ...CONTROL_NAMES.map((name) => ({ name, set: "control" }))]
      : entries

  if (args.source === "file") {
    const text = readFileSync(args.file, "utf8")
    const seen = new Set()
    const entries = []
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed) continue
      // Optional "set:name" prefix groups stats; known sets only, so a
      // colon inside an ordinary name never triggers grouping.
      const match = /^(real|file|synthetic|control):(.+)$/.exec(trimmed)
      const set = match ? match[1] : "file"
      const name = sanitizeName(match ? match[2] : trimmed)
      if (!name || seen.has(name)) continue
      seen.add(name)
      entries.push({ name, set })
    }
    return withControl(entries)
  }

  if (args.source === "synthetic") {
    return withControl(syntheticNames(args.n).map((name) => ({ name, set: "synthetic" })))
  }

  try {
    const res = await fetch(
      `${args.api}/api/v1/searches/public-top?limit=${args.n}`,
      { signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const real = [
      ...new Set((data.items ?? []).map((item) => sanitizeName(item.top_name))),
    ]
      .filter(Boolean)
      .map((name) => ({ name, set: "real" }))
    if (real.length < args.n) {
      console.warn(
        `public-top returned ${real.length} real names, padding with synthetic ones.`
      )
      const padded = [
        ...real,
        ...syntheticNames(args.n - real.length).map((name) => ({
          name,
          set: "synthetic",
        })),
      ]
      return withControl(padded)
    }
    console.log(`Source: ${real.length} real searched names from ${args.api}`)
    return withControl(real.slice(0, args.n))
  } catch (error) {
    console.warn(
      `public-top unavailable (${error.message}); falling back to synthetic names.`
    )
    return withControl(
      syntheticNames(args.n).map((name) => ({ name, set: "synthetic" }))
    )
  }
}

function shapeParsed(raw) {
  let parsed = null
  if (raw && typeof raw === "object") parsed = raw
  else if (typeof raw === "string") {
    const first = raw.indexOf("{")
    const last = raw.lastIndexOf("}")
    if (first >= 0 && last > first) {
      try { parsed = JSON.parse(raw.slice(first, last + 1)) } catch { /* unparseable */ }
    }
  }
  const known = parsed?.known_as
  const confidence = parsed?.confidence
  const category = parsed?.category
  return {
    known_as: typeof known === "string" ? known.slice(0, 500) : null,
    confidence: CONFIDENCES.has(confidence) ? confidence : "none",
    category: CATEGORIES.has(category) ? category : "none",
  }
}

function verdictFor(parsedList) {
  const strong = parsedList.filter((p) => p.confidence === "strong" && p.category !== "none")
  const weak = parsedList.filter((p) => p.confidence === "weak" && p.category !== "none")
  if (strong.length) return "hard"
  if (weak.length) return "minor"
  return "clean"
}

async function probeOnce(model, name, { withTemperature }) {
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": process.env.FRONTEND_URL ?? "https://www.unclaimedbyai.com",
    "X-Title": "Unclaimed",
    "Content-Type": "application/json",
  }
  const payload = {
    model,
    messages: [
      { role: "system", content: COLLISION_SYSTEM_PROMPT },
      { role: "user", content: sanitizeName(name) },
    ],
    ...(withTemperature ? { temperature: 0 } : {}),
  }
  const started = performance.now()
  const res = await fetch(`${openrouterBase}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  })
  const latencyMs = Math.round(performance.now() - started)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    const error = new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`)
    error.status = res.status
    throw error
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== "string") throw new Error("unreadable response")
  const usage = data.usage ?? {}
  return {
    model,
    name,
    parsed: shapeParsed(content),
    raw: content,
    latency_ms: latencyMs,
    input_tokens: usage.prompt_tokens ?? null,
    output_tokens: usage.completion_tokens ?? null,
    cost_usd: typeof usage.cost === "number" ? usage.cost : null,
    at: new Date().toISOString(),
  }
}

async function probe(model, name) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      // Mirror ai.py: try with temperature, retry once without it for
      // providers that reject non-default temperatures with 400.
      return await probeOnce(model, name, { withTemperature: attempt === 1 })
    } catch (error) {
      lastError = error
      const retryable =
        !error.status || error.status === 429 || error.status >= 500
      if (!retryable && !(error.status === 400 && attempt === 1)) break
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    }
  }
  return { model, name, error: String(lastError?.message ?? lastError), at: new Date().toISOString() }
}

function percentile(sorted, p) {
  if (!sorted.length) return null
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[Math.max(index, 0)]
}

function summarize(records) {
  const byName = new Map()
  const perModel = {}
  for (const model of models) {
    perModel[model] = { ok: 0, errors: 0, weak: 0, strong: 0, assoc: 0, latencies: [], cost: 0 }
  }
  for (const rec of records) {
    const stats = perModel[rec.model]
    if (!stats) continue
    if (rec.error) { stats.errors += 1; continue }
    stats.ok += 1
    stats.latencies.push(rec.latency_ms)
    if (typeof rec.cost_usd === "number") stats.cost += rec.cost_usd
    const assoc =
      rec.parsed.confidence !== "none" && rec.parsed.category !== "none"
    if (assoc) {
      stats.assoc += 1
      if (rec.parsed.confidence === "strong") stats.strong += 1
      else stats.weak += 1
    }
    if (!byName.has(rec.name)) byName.set(rec.name, { set: rec.set ?? "file", list: [] })
    byName.get(rec.name).list.push(rec.parsed)
  }

  const verdicts = { hard: 0, minor: 0, clean: 0 }
  const flaggedByCount = { 1: 0, 2: 0, 3: 0 }
  const strongCategories = {}
  const bySet = {}
  for (const entry of byName.values()) {
    const verdict = verdictFor(entry.list)
    verdicts[verdict] += 1
    const flagged = entry.list.filter(
      (p) => p.confidence !== "none" && p.category !== "none"
    ).length
    if (flagged >= 1 && flagged <= 3) flaggedByCount[flagged] += 1
    for (const p of entry.list) {
      if (p.confidence === "strong" && p.category !== "none") {
        strongCategories[p.category] = (strongCategories[p.category] ?? 0) + 1
      }
    }
    const set = entry.set ?? "file"
    if (!bySet[set]) bySet[set] = { names: 0, any: 0, hard: 0, minor: 0, clean: 0 }
    const stats = bySet[set]
    stats.names += 1
    if (flagged >= 1) stats.any += 1
    stats[verdict] += 1
  }

  const lines = []
  const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1)}%` : "n/a")
  lines.push(`Names probed: **${byName.size}** × models: **${models.length}**`)
  lines.push("")
  lines.push("| Set | Names | Any model associates | Hard | Minor | Clean |")
  lines.push("|---|---|---|---|---|---|")
  for (const [set, s] of Object.entries(bySet).sort(
    (a, b) => b[1].names - a[1].names
  )) {
    lines.push(
      `| ${set} | ${s.names} | ${pct(s.any, s.names)} | ${pct(s.hard, s.names)} | ${pct(s.minor, s.names)} | ${pct(s.clean, s.names)} |`
    )
  }
  lines.push("")
  lines.push("| Model | Any association | Strong | Errors | p50 | p95 | Cost |")
  lines.push("|---|---|---|---|---|---|---|")
  for (const model of models) {
    const s = perModel[model]
    const sorted = [...s.latencies].sort((a, b) => a - b)
    lines.push(
      `| \`${model}\` | ${pct(s.assoc, s.ok)} | ${pct(s.strong, s.ok)} | ${s.errors} | ${percentile(sorted, 50) ?? "—"} ms | ${percentile(sorted, 95) ?? "—"} ms | $${s.cost.toFixed(4)} |`
    )
  }
  lines.push("")
  const total = byName.size
  lines.push(
    `**Name verdicts:** hard ${verdicts.hard} (${pct(verdicts.hard, total)}) · minor ${verdicts.minor} (${pct(verdicts.minor, total)}) · clean ${verdicts.clean} (${pct(verdicts.clean, total)})`
  )
  lines.push("")
  lines.push(
    `**Flagged by:** 1 model ${flaggedByCount[1]} · 2 models ${flaggedByCount[2]} · 3 models ${flaggedByCount[3]}`
  )
  lines.push("")
  const cats = Object.entries(strongCategories).sort((a, b) => b[1] - a[1])
  lines.push(
    `**Strong associations by category:** ${cats.map(([k, v]) => `${k} ${v}`).join(" · ") || "none"}`
  )
  lines.push("")
  const totalCost = models.reduce((sum, m) => sum + perModel[m].cost, 0)
  lines.push(`Total API cost: **$${totalCost.toFixed(4)}**`)

  const text = [
    `# Collision study summary (${dateKey})`,
    "",
    `Source: ${args.source} · models: ${models.join(", ")} · prompt: production COLLISION_SYSTEM_PROMPT v1`,
    "",
    ...lines,
    "",
    `_Raw data: \`${jsonlPath}\`_`,
    "",
  ].join("\n")
  return { text, verdicts, perModel, byName: byName.size }
}

async function main() {
  mkdirSync(args.out, { recursive: true })

  if (args.summaryOnly) {
    const records = readFileSync(jsonlPath, "utf8")
      .split("\n").filter(Boolean).map((l) => JSON.parse(l))
    const { text } = summarize(records)
    writeFileSync(summaryPath, text)
    console.log(text)
    return
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set.")
    process.exit(1)
  }

  const names = await loadNames()
  const setName = new Map(names.map((entry) => [entry.name, entry.set]))
  const tasks = []
  for (const entry of names) {
    for (const model of models) {
      tasks.push({ name: entry.name, model, set: entry.set })
    }
  }

  const done = new Set()
  if (args.resume && existsSync(jsonlPath)) {
    for (const line of readFileSync(jsonlPath, "utf8").split("\n")) {
      if (!line) continue
      try {
        const rec = JSON.parse(line)
        done.add(`${rec.name} ${rec.model}`)
      } catch { /* skip corrupt line */ }
    }
  }
  const pending = tasks.filter((t) => !done.has(`${t.name} ${t.model}`))
  console.log(
    `${tasks.length} probes total · ${done.size} already done · ${pending.length} to run (${args.concurrency} at a time)`
  )

  let cursor = 0
  let completed = 0
  async function worker() {
    while (cursor < pending.length) {
      const task = pending[cursor]
      cursor += 1
      const result = await probe(task.model, task.name)
      result.set = task.set
      appendFileSync(jsonlPath, `${JSON.stringify(result)}\n`)
      completed += 1
      if (completed % 25 === 0 || completed === pending.length) {
        process.stdout.write(`  ${completed}/${pending.length} probes done\n`)
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.max(1, args.concurrency) }, () => worker())
  )

  const records = readFileSync(jsonlPath, "utf8")
    .split("\n").filter(Boolean).map((l) => JSON.parse(l))
  // Files written before set-tagging existed: recover the label from the
  // current name list where possible.
  for (const rec of records) {
    rec.set = rec.set ?? setName.get(rec.name) ?? "file"
  }
  const { text } = summarize(records)
  writeFileSync(summaryPath, text)
  console.log("\n" + text)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

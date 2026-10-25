/**
 * Screenshot harness: a faithful `chrome.*` + API surface so the REAL
 * panel bundle (public/_shots/panel.js) mounts and behaves without an
 * extension, a backend, or OpenRouter. Everything is canned and
 * overridable from the test driver via `window.__shot`.
 */
(() => {
  const bus = []

  const makeArea = (data, areaName) => ({
    async get(keys) {
      if (keys == null) return { ...data }
      if (typeof keys === "string") {
        return keys in data ? { [keys]: data[keys] } : {}
      }
      if (Array.isArray(keys)) {
        const out = {}
        for (const key of keys) if (key in data) out[key] = data[key]
        return out
      }
      const out = {}
      for (const [key, fallback] of Object.entries(keys)) {
        out[key] = key in data ? data[key] : fallback
      }
      return out
    },
    async set(items) {
      const changes = {}
      for (const [key, value] of Object.entries(items)) {
        changes[key] = { oldValue: data[key], newValue: value }
        data[key] = value
      }
      for (const fn of bus) {
        try {
          fn(changes, areaName)
        } catch {
          /* listeners must not break the capture */
        }
      }
    },
  })

  const query = new URLSearchParams(location.search)

  const local = {
    apiKey: "uba_live_screenshot_key_000000000000000000000000",
    afterId: 0,
  }
  const session = {
    selection: query.get("text") || "Lumenfen",
    sourceUrl: "https://example.com/",
    pickedAt: Date.now(),
  }

  // Canned verdicts phrased exactly as the model rubric produces them.
  const verdicts = {
    name: {
      kind: "name",
      reason: "Title Case noun phrase, nothing to argue with — reads like a name.",
      screen_as: null,
    },
    list: {
      kind: "name",
      reason: "Three short list items — screening the first. Your call if not.",
      screen_as: "Lumenfen",
    },
    idea: {
      kind: "idea",
      reason: "Purpose clause (“for…”) — describes a thing to build, not a name.",
      screen_as: null,
    },
    rough: {
      kind: "rough",
      reason: "Exploratory and unfinished — the studio can shape it first.",
      screen_as: null,
    },
  }

  const tld = (t, available) => ({ tld: t, available })
  const canned = {
    classify: verdicts[query.get("classify") || "name"] || verdicts.name,
    direct: { search_id: 101, name_id: 501 },
    results: {
      items: [
        {
          name: "Lumenfen",
          about: null,
          score: 91,
          tier: "excellent",
          domains: [
            tld("com", true), tld("ai", true), tld("io", true),
            tld("co", null), tld("net", true), tld("org", true),
            tld("dev", true), tld("app", true), tld("xyz", false),
            tld("me", false), tld("so", false), tld("sh", null),
            tld("gg", null), tld("tv", null), tld("fm", null),
            tld("to", null), tld("site", true), tld("online", true),
            tld("store", true), tld("tech", true),
          ],
          socials: [
            { platform: "github", available: true },
            { platform: "x", available: true },
            { platform: "instagram", available: false },
            { platform: "tiktok", available: false },
            { platform: "youtube", available: false },
          ],
          aiAssociation: "Low",
        },
      ],
      pending: [],
    },
  }

  const realFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.url
    const json = (body) =>
      Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    if (url.includes("/api/v1/classify")) return json(canned.classify)
    if (url.includes("/api/v1/checks/direct")) return json(canned.direct)
    if (url.includes("/searches/101/results")) return json(canned.results)
    if (url.includes("/api/v1/notifications")) return json([])
    if (url.includes("/api/v1/me"))
      return json({ id: 1, email: "shot@example.com", full_name: null })
    return realFetch(input, init)
  }

  window.chrome = {
    storage: {
      local: makeArea(local, "local"),
      session: makeArea(session, "session"),
      onChanged: {
        addListener: (fn) => bus.push(fn),
        removeListener: (fn) => {
          const index = bus.indexOf(fn)
          if (index >= 0) bus.splice(index, 1)
        },
      },
    },
    tabs: { create: () => Promise.resolve({}) },
    action: {
      setBadgeText: async () => {},
      setBadgeBackgroundColor: async () => {},
    },
    runtime: {},
  }

  window.__shot = { local, session, canned, verdicts }
})()

# Unclaimed by AI — browser extension (MV3)

Screen any highlighted text against the real check pipeline, or hand a
rough idea to the naming studios — without leaving the tab. Built with
Vite + TypeScript, importing the **site's own** shadcn components,
`TierBadge`, sound engine and types straight from the repo root (`@/*`
aliases one level up), so the panel is the same design system, not a
lookalike.

## Build & load

```bash
npm run extension:build     # → extension/dist/ (site origin: localhost)
npm run extension:dev       # watch mode
npm run extension:package   # store zip: origin baked to www.unclaimedbyai.com
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** →
pick `extension/dist/`.

Development talks to `http://localhost:3000` (the Next rewrite proxy).
The manifest is **generated at build time** from `vite.config.ts`:
`host_permissions` follow `EXT_SITE_ORIGIN` (plus its www twin for real
domains, never localhost in a store package) and Chrome's field limits
are enforced at build, not at upload. The packaged
`extension/unclaimedbyai-extension.zip` is what goes to the store —
submission steps and listing copy live in `store-listing.md`.

## Setup (once)

The panel authenticates with an API key, not cookies: cross-site
`SameSite=Lax` makes extension cookie auth unreliable, and a key is
revocable. Open **Account → API keys** on the site, copy a `uba_live_…`
key, paste it in the panel. A key holder is a signed-in caller, so the
backend skips the Turnstile challenge on direct checks.

## What it does

- **Right-click → "Screen '%s'"** stashes the selection and opens the
  side panel (a context-menu click is the user gesture the sidePanel
  API needs).
- **Classification is a model call, not a rules list.** The panel
  debounces 900 ms after typing stops and `POST /api/v1/classify`s the
  selection (signed-in bearer only, text capped at 400 chars); the
  backend spends the house OpenRouter model on it — `gpt-5-nano` by
  default (`OPENROUTER_CLASSIFIER_MODEL` to swap; Jev at $0.042/M is
  the drop-in if unit costs ever matter). Roughly **5¢ per 1000
  calls**, spent under the same LLM POST rate cap as generation. The
  model's one-sentence reason shows under the chips, a one-tap chip
  overrules it, and a calm 502 falls back to manual chips — never a
  silent guess. Note the privacy consequence: unlike the old on-device
  rules, the selection now travels to our API (first-party) on each
  settled pause, same as any submitted brief.
- **Name** → one direct check through the API, polled until the jobs
  settle (45s leash), verdict rendered with the site's `TierBadge`.
- **Idea / rough** → opens the site with `?mode=idea|studio&brief=…`;
  `PrompterCta` reads the params on mount, prefills the prompter in
  the right mode, then takes the params back out of the address bar.
- **Watch badge** → `chrome.alarms` polls the existing
  `GET /api/v1/notifications?after_id=` cursor once a minute with the
  key; new events raise the toolbar badge (the read-state cursor lives
  in `chrome.storage.local` beside the key).

## Layout

```
extension/
  vite.config.ts            # @ → repo root, site origin, manifest generator
  store-listing.md          # Chrome Web Store copy + submission checklist
  src/background.ts         # context menu handoff + watch-badge poller (no imports)
  src/App.tsx               # panel: setup → intake → verdict
  src/api.ts                # bearer auth; /classify verdict + check/poll paths
```

Gates: `npm run typecheck` covers this folder too (`tsc -p
extension/tsconfig.json`), `npm run lint` lints the sources, and
`extension/dist/` is gitignored.

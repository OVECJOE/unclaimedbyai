# Unclaimed by AI — browser extension (MV3)

Screen any highlighted text against the real check pipeline, or hand a
rough idea to the naming studios — without leaving the tab. Built with
Vite + TypeScript, importing the **site's own** shadcn components,
`TierBadge`, sound engine and types straight from the repo root (`@/*`
aliases one level up), so the panel is the same design system, not a
lookalike.

## Build & load

```bash
npm run extension:build     # → extension/dist/
npm run extension:dev       # watch mode
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** →
pick `extension/dist/`.

Development talks to `http://localhost:3000` (the Next rewrite proxy).
For a store build:

```bash
EXT_SITE_ORIGIN=https://unclaimedbyai.com npm run extension:build
```

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
- **Classification runs on-device** (`src/classify.ts`): name / idea /
  rough, with the reasoning shown and a one-tap overrule. It never
  sends highlighted text anywhere. Hosted decision models (Jev
  $0.042/1M input tokens, OpenAI Decisions $0.10/1M) were evaluated as
  a fallback for low-confidence cases — ~$126 and ~$300 per 10M calls
  respectively, versus the target of a cent; local rules are the only
  thing that reaches free, and they cover this task's shape.
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
  public/manifest.json      # MV3: sidePanel, contextMenus, storage, alarms
  vite.config.ts            # @ → repo root, site origin via EXT_SITE_ORIGIN
  src/background.ts         # context menu handoff + watch-badge poller (no imports)
  src/App.tsx               # panel: setup → intake → verdict
  src/classify.ts           # on-device name/idea/rough heuristic
  src/api.ts                # bearer auth through the site's /api/v1 rewrite
```

Gates: `npm run typecheck` covers this folder too (`tsc -p
extension/tsconfig.json`), `npm run lint` lints the sources, and
`extension/dist/` is gitignored.

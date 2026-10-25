# Chrome Web Store listing — draft

Everything below is paste-ready for the [developer console]
(chromewebstore.google.com/developerboard). Character limits noted;
the manifest's name/description are enforced at build time, but the
store's fields are separate — copy from here.

## Store fields

**Title** (45 max — 16):

> Unclaimed by AI

**Summary** (132 max — 127):

> Right-click any text: screen a name against live .com, real handles
> and AI associations — or send a rough idea to the naming studios.

**Category:** Productivity (Developer Tools is the runner-up; naming
work is pre-launch productivity, not programming).

**Language:** English.

## Full description

> ### Check a name before you fall for it — from anywhere on the web.
>
> Highlight anything: a candidate someone dropped in a chat, a domain
> in a thread, the half of a brief you scribbled in a doc.
> Right-click, and the side panel takes it from there.
>
> **Screen a name properly.** Your selection runs through the same
> check as the site — live `.com` plus 17 other extensions, real
> handle lookups on five platforms, and what the biggest AI models
> already associate with the name. One score, one verdict, and every
> domain chip clicks straight through to a registrar.
>
> **Know what you highlighted.** A classifier reads your selection and
> says what it is — a name, an idea, a rough thought — and tells you
> why in one sentence. Disagree? One tap overrules it.
>
> **Skip the retyping.** A rough brief opens unclaimedbyai.com already
> filled in, ready for the four naming studios.
>
> **Come back for the ones you kept.** A badge on the toolbar tells
> you when a watched domain drops or a handle frees up.
>
> One key, from **Account → API keys** on the site. Your first check on
> any name is free, same as the site.
>
> What we don't do: no browsing history, no page scraping behind your
> back, no third-party trackers. The panel sends only what you
> deliberately choose to screen, to our own servers, over HTTPS.

## Single-purpose statement

> Screen name candidates for availability and collisions (domains,
> social handles, AI associations) and route idea briefs to the
> Unclaimed by AI naming service.

## Permission justifications

- **host_permissions (`https://www.unclaimedbyai.com/*`,
  `https://unclaimedbyai.com/*`)** — Every panel action (classification,
  running checks, reading watch notifications) calls this extension's
  own backend at unclaimedbyai.com through its `/api/v1` endpoints. No
  other hosts are requested or accessed.
- **sidePanel** — Results belong beside the page being screened, not
  over it; the side panel keeps the selection visible while the check
  runs.
- **contextMenus** — The right-click "Screen '%s'" entry is the
  extension's primary interaction.
- **storage** — Local only: the user's API key, the watch-notification
  cursor, and the current selection handoff.
- **alarms** — Polls the user's own watch notifications once a minute
  to raise the toolbar badge; runs only while the browser is open.

## Data safety questionnaire draft

- **Data collected:** *User content* — only the text the user
  explicitly selects for screening/classification — and *authentication
  information* — the API key, sent as a bearer token to authenticate.
- **Purposes:** App functionality, Account management.
- **Data transmitted off-device:** Yes — to unclaimedbyai.com (our
  servers); name checks are additionally processed by a model provider
  acting as our processor, as described in the privacy policy.
- **Data encrypted in transit:** Yes (HTTPS/TLS).
- **Data sold or shared for advertising/any third-party purpose:** No.
- **Browsing history collected:** No.
- **Privacy policy:** https://unclaimedbyai.com/privacy

## Screenshots & promo tile — shipped in `store-assets/`

All PNG, 24-bit (no alpha), within the store's limits:

| File | Size | Shows |
| --- | --- | --- |
| `01-verdict-screen.png` | 1280×800 | Result card beside the real check page: score, tier, all three chip states, handles, AI associations |
| `02-classify-name-list.png` | 1280×800 | Intake with a highlighted name list, the classifier's "screening the first" reason, NAME active |
| `03-idea-to-studios.png` | 1280×800 | A product brief classified as an idea — IDEA active, "Name it with the studios" |
| `04-rough-to-studio.png` | 1280×800 | A rambling thought classified rough — ROUGH active, "Shape it in the studio" |
| `promo-tile-440x280.png` | 440×280 | Small promo tile: wordmark + tagline on brand purple |

Upload in that order (verdict first — it carries the product).

### Regenerating (the harness)

`extension/screenshots/` holds the capture harness: the **real panel
bundle** (`dist/panel.js` + CSS) mounted beside a real site page in an
iframe, under a `chrome.*` stub with canned API responses
(`chrome-stub.js` — real Lumenfen check data mirrored, no backend or
model key needed).

```bash
npm run extension:build && mkdir -p public/_shots \
  && cp extension/dist/panel.js public/_shots/ \
  && cp extension/dist/assets/*.css public/_shots/panel.css \
  && cp extension/screenshots/{chrome-stub.js,harness.html} public/_shots/
```

Then open, focus, and capture full-page:

```
/_shots/harness.html?classify=name&web=/check/Lumenfen&text=Lumenfen
/_shots/harness.html?classify=list&web=/&text=Lumenfen,%20Nocturnib,%20Quiet%20Atlas
/_shots/harness.html?classify=idea&web=/product&text=…
/_shots/harness.html?classify=rough&web=/about&text=…
/_shots/harness.html?mode=tile
```

Per capture: set `uba-consent=declined`, drain the iframe's streamed
boundaries (`$RV($RB)`), remove any `nextjs-portal` dev badge, wait for
the classifier reason, screenshot `fullPage`, crop to size, `convert("RGB")`.
(`public/_shots/` is gitignored.)

## Submission checklist

- [ ] One-time developer account registration ($5) at
      chromewebstore.google.com/developerboard
- [ ] (Recommended) Verify ownership of unclaimedbyai.com (DNS TXT) →
      verified-publisher badge
- [ ] `npm run extension:package` → upload `extension/unclaimedbyai-extension.zip`
- [ ] Store listing fields pasted from above + screenshots attached
- [ ] Privacy practices: questionnaire draft + privacy-policy URL +
      single-purpose statement + permission justifications
- [ ] Distribution: **Unlisted** first (test with an install link),
      flip to Public once it behaves
- [ ] Submit → review (first reviews typically 1–3 business days; they
      may email asking about the selection-text/data flow — the
      questionnaire draft above answers it)

For every update: bump `version` in `extension/vite.config.ts`
(manifest source of truth), re-run `npm run extension:package`, upload
the new zip — each version must be higher than the last.

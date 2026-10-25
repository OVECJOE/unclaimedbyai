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

## Screenshots (manual — at least one, 1280×800 or 640×400)

1. The verdict card after a screen (score, tier, clickable domain
   chips, handles) — the layout you already captured in chat works.
2. Intake: a selection in the textarea, the classifier's one-sentence
   reason, and the Name/Idea/Rough chips.
3. The right-click menu on a real selection, with the side panel open
   beside it.

Optional assets: 440×280 small promo tile, 1280×280 promo graphic —
neither is required.

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

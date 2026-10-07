# UnclaimedByAI (frontend)

Next.js frontend for UnclaimedByAI: landing, product, pricing, blog, auth, user dashboard (search history, billing, account), and the blog admin. shadcn/ui + Tailwind v4.

## Run locally

```bash
npm install
npm run dev
```

## Layout

- `app/(public)/` — landing, product, pricing, blog, auth
- `app/dashboard/` — search home, history, billing, account (live API data)
- `app/admin/blog/` — blog CMS (live, Neon-backed)
- `components/`, `lib/`, `hooks/` — UI + helpers

Backend lives in `../unclaimedbyai-api` (tracked in its README). Prototype reference lives in `../unclaimed-app` (`frontend/lib/api.ts` for the client shape, `app/report/[id]` + `unlock-button.tsx` for the report/paywall flow).

---

## Integration TODO

Conventions: `[YOU]` owner, `[BE]` backend engineer (provides endpoints), `[SEC]` security analyst (reviews). Backend-side work is tracked in the backend README — this file is the frontend side.

### Phase 0 — Client foundations

- [x] `lib/api.ts`: typed fetch client (`NEXT_PUBLIC_API_URL`, `ApiError` with status, per-call timeouts, cookie credentials, no hand-rolled auth headers) + `lib/api-server.ts` cookie-forwarding helpers for server components.
- [x] Add `.env.example` entries: `NEXT_PUBLIC_API_URL` (browser + server, same origin policy via CORS).
- [x] Auth wiring: magic-link via API on `/auth`, Google button to API OAuth start, session-aware dashboard header (account menu vs Sign In), sign-out action, logged-out dashboard/history redirect to `/auth`.
- [ ] `[SEC]` Review: no tokens in `localStorage`, no API keys in client bundle, `redirect`/`returnTo` params validated (no open redirects), checkout return URLs verified server-side.

### Phase 1 — Replace mocks with live data

- [ ] `[YOU]` Dashboard home: brief form → `POST generate` → candidate list → `POST` report per name (parallel with per-row pending/error states, mirroring prototype `app/page.tsx` flow).
- [x] `/dashboard/history` + `[searchId]`: real search list/detail from the API with per-name live check panels.
- [x] Public SEO results page `/searches/[query]`: canonical search + names with latest check details + aggregate stats, ISR-cached, keyword-rich metadata.
- [x] Report view (`results/[name]`): live pillar scores, per-model AI output as text, check timestamps; mock `name-reports.ts` deleted. Unlock CTA still pending Stripe UX.
- [x] Billing: balances + DB-driven packs with Stripe Checkout redirect, success/cancel banners, real order history. Mock `lib/billing.ts` deleted.
- [x] Pricing page: live packs from the API with hardcoded fallback for offline builds.
- [x] Account page: live profile, prefs, delete flow; mock fixtures (`SEARCH_HISTORY`, `SEARCH_RESULTS`, billing mocks) deleted.
- [ ] `[YOU]` Landing ticker: stats endpoint behind the client (prototype polls every 15s and fails silently — keep both behaviors).

### Phase 2 — UX hardening

- [ ] `[YOU]` Every data fetch gets loading, empty, and error states (the blog empty-state SVG pattern is the house style to reuse).
- [ ] `[YOU]` Long pipelines need feedback: checks can take 10s+ across providers — skeleton rows + per-pillar progress if the backend streams it, otherwise honest spinners with timeout messaging.
- [ ] `[YOU]` Mobile pass on dashboard flows (tables → stacked cards below `md:`, sticky save/checkout actions reachable without scrolling).
- [ ] `[SEC]` Abuse-facing copy: rate-limit (429), out-of-credits, and re-check-cost states must be explicit UI, not generic errors — confirm message contracts with `[BE]`.

### Phase 3 — Launch readiness

- [ ] `[ALL]` Staging end-to-end: signup → free checks → buy pack → re-check → refund, on staging URLs with test Stripe keys.
- [ ] `[YOU]` Remove all remaining mock fixtures and dead prototype-copy code; `grep` for `localhost:8000`, placeholder UUIDs, and `$2` hardcoded prices before launch.
- [ ] `[SEC]` Final pass: no secrets in bundle (`NEXT_PUBLIC_` audit), docs/schema unreachable from the client side, cookie flags (`Secure`, `SameSite`) verified in prod.

# UnclaimedByAI (frontend)

Next.js frontend for UnclaimedByAI: landing, product, pricing, blog, auth, user dashboard (search history, billing, account), and the blog admin. shadcn/ui + Tailwind v4.

## Run locally

```bash
npm install
npm run dev
```

## Layout

- `app/(public)/` — landing, product, pricing, blog, auth
- `app/dashboard/` — search home, history, billing, account (currently mock data, see below)
- `app/admin/blog/` — blog CMS (live, Neon-backed)
- `components/`, `lib/`, `hooks/` — UI + helpers

Backend lives in `../unclaimedbyai-api` (tracked in its README). Prototype reference lives in `../unclaimed-app` (`frontend/lib/api.ts` for the client shape, `app/report/[id]` + `unlock-button.tsx` for the report/paywall flow).

---

## Integration TODO

Conventions: `[YOU]` owner, `[BE]` backend engineer (provides endpoints), `[SEC]` security analyst (reviews). Backend-side work is tracked in the backend README — this file is the frontend side.

### Phase 0 — Client foundations

- [ ] `[YOU]` Build `lib/api.ts`: typed fetch client with `NEXT_PUBLIC_API_URL` base URL (server-side `API_URL` fallback like the prototype), `ApiError` with status, timeouts, one retry on network failure only, cookie credentials for session auth. No auth headers hand-rolled — sessions ride httpOnly cookies.
- [ ] `[YOU]` Add `.env.example` entries: `NEXT_PUBLIC_API_URL`, `API_URL` (server container/SSR).
- [ ] `[YOU]` Auth wiring: magic-link + Google buttons on `/auth`, session-aware header (sign in vs account menu), middleware guarding `/dashboard/*` to login with return-to. Agree cookie/session shape with `[BE]` first.
- [ ] `[SEC]` Review: no tokens in `localStorage`, no API keys in client bundle, `redirect`/`returnTo` params validated (no open redirects), checkout return URLs verified server-side.

### Phase 1 — Replace mocks with live data

- [ ] `[YOU]` Dashboard home: brief form → `POST generate` → candidate list → `POST` report per name (parallel with per-row pending/error states, mirroring prototype `app/page.tsx` flow).
- [ ] `[YOU]` `/dashboard/history` + `[searchId]` + `results/[name]`: real search list/detail from `GET searches`; delete `SEARCH_HISTORY` mock in `lib/constants.ts`.
- [ ] `[YOU]` Report view: pillar scores, per-model AI output (render as text, never raw HTML — model output is untrusted), reuse/checked-at stamps, unlock CTA when locked. Delete `lib/name-reports.ts` + `lib/name-results.ts` mocks.
- [ ] `[YOU]` Billing: credit packs + balances from API, checkout button → Stripe redirect, post-payment return revalidates unlock state (agree polling vs revalidate with `[BE]`). Delete `lib/billing.ts` mock URLs.
- [ ] `[YOU]` Pricing page: render packs + prices from the API (single source of truth), wire each tier to checkout. Prototype pricing page is unwired copy — don't repeat that.
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

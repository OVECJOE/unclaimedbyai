export const API_BASE = ""

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"

// In the browser a relative path is correct: it goes through the same-origin
// rewrite proxy so the session cookie lands on the frontend domain. On the
// server there is no origin to resolve a relative URL against, so Node's
// fetch would throw "Failed to parse URL". Server Components and server
// actions must therefore use the absolute API origin.
const DEFAULT_BASE = typeof window === "undefined" ? API_ORIGIN : API_BASE

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  timeoutMs?: number
  headers?: Record<string, string>
  base?: string
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    timeoutMs = 30000,
    headers = {},
    base = DEFAULT_BASE,
  }: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        detail?: unknown
      } | null
      const message =
        typeof data?.detail === "string" ? data.detail : "Request failed"
      throw new ApiError(res.status, message)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Could not reach the API. Try again in a moment.")
  } finally {
    clearTimeout(timer)
  }
}

export type ApiUser = {
  id: number
  email: string
  full_name: string | null
  avatar_url: string | null
  searches_left: number
  credits: number
}

export type NameCandidate = {
  name: string
  rationale: string
}

export type SearchItem = {
  id: number
  query: string
  category: string
  name_count: number
  created_at: string
  top: { name: string; score: number; tier: string } | null
  preview_names: string[]
}

export type SearchList = {
  items: SearchItem[]
  total: number
  page: number
  page_size: number
}

export type NameItem = {
  id: number
  name: string
  about: string | null
  latest_check: {
    public_id: string
    attempt_no: number
    overall_score: number
    overall_risk_level: "excellent" | "good" | "okay" | "poor"
    judgment?: string
    pillars?: {
      pillar_type: string
      score: number
      verdict: string
      items_checked: number
      items_passed: number
    }[]
  } | null
}

export type BriefAttributes = {
  summary?: string
  audience?: string
  tone?: string
  category?: string
}

export type SearchDetail = SearchItem & {
  names: NameItem[]
  brief_summary?: string | null
  brief_attributes?: BriefAttributes | null
}

export type AttemptItem = {
  attempt_no: number
  public_id: string
  overall_score: number
  overall_risk_level: "excellent" | "good" | "okay" | "poor"
  created_at: string
}

export type CheckReport = {
  id: string
  attempt_no: number
  overall_score: number
  overall_risk_level: "excellent" | "good" | "okay" | "poor"
  judgment: string
  scoring_version: string
  created_at: string
  pillars: {
    pillar_type: string
    score: number
    verdict: string
    items_checked: number
    items_passed: number
  }[]
  domains: { domain: string; tld: string; status: string; checked_at: string }[]
  socials: {
    platform: string
    handle: string
    status: string
    checked_at: string
  }[]
  ai: {
    model: string | null
    association_category: string | null
    association: string | null
    collision_confidence: number | null
    error: string | null
    checked_at: string
  }[]
}

export function getMe(timeoutMs?: number): Promise<ApiUser> {
  return apiRequest<ApiUser>("/api/v1/me", { timeoutMs })
}

export function requestMagicLink(
  email: string,
  cfTurnstileToken?: string
): Promise<{ sent: boolean }> {
  return apiRequest("/api/v1/auth/magic-link", {
    method: "POST",
    body: { email, cf_turnstile_token: cfTurnstileToken },
  })
}

export function logout(): Promise<{ signed_out: boolean }> {
  return apiRequest("/api/v1/auth/logout", { method: "POST" })
}

export function directCheck(input: {
  name: string
  anon_session_id?: string
  cf_turnstile_token?: string
}): Promise<{ search_id: number; name_id: number }> {
  return apiRequest("/api/v1/checks/direct", {
    method: "POST",
    body: input,
    timeoutMs: 20000,
  })
}

export function generateNames(
  brief: string,
  count = 12,
  style?: string
): Promise<{ brief: string; candidates: NameCandidate[] }> {
  return apiRequest("/api/v1/generate", {
    method: "POST",
    body: { brief, count, ...(style ? { style } : {}) },
    timeoutMs: 90000,
  })
}

export type FilledSearch = {
  id: number
  query: string
  category: string
  generation: {
    status: "generating" | "ready" | "failed"
    progress: number
    error: string | null
  }
  created_at: string
  searches_left?: number
}

export function generateFilledSearch(input: {
  query: string
  category?: string
  style?: string
  count?: number
  anon_session_id?: string
  cf_turnstile_token?: string
}): Promise<FilledSearch> {
  return apiRequest<FilledSearch>("/api/v1/searches/generate", {
    method: "POST",
    body: input,
    timeoutMs: 120000,
  })
}

export function createSearch(input: {
  query: string
  category?: string
  anon_session_id?: string
  cf_turnstile_token?: string
  // Set when the search was started from an idea, so the search hangs off
  // the idea that produced it.
  idea_id?: string
}): Promise<SearchItem & { searches_left?: number }> {
  return apiRequest("/api/v1/searches", {
    method: "POST",
    body: input,
    timeoutMs: 15000,
  })
}

export function listSearches(page = 1, pageSize = 10): Promise<SearchList> {
  return apiRequest<SearchList>(
    `/api/v1/searches?page=${page}&page_size=${pageSize}`
  )
}

export function getSearch(searchId: number): Promise<SearchDetail> {
  return apiRequest<SearchDetail>(`/api/v1/searches/${searchId}`)
}

export type SearchHeader = {
  id: number
  query: string
  category: string
  name_count: number
  checked_count: number
  generation: {
    status: "generating" | "ready" | "failed"
    progress: number
    error: string | null
  }
  brief_summary?: string | null
  brief_attributes?: BriefAttributes | null
  created_at: string
}

export function getSearchHeader(
  searchId: number,
  anonSessionId?: string
): Promise<SearchHeader> {
  const sid = anonSessionId ? `?anon_session_id=${anonSessionId}` : ""
  return apiRequest<SearchHeader>(`/api/v1/searches/${searchId}/header${sid}`)
}

export type SearchSummaryPayload = {
  total: number
  pass_count: number
  pass_rate: number
  overall: number
  grading: Record<"Excellent" | "Good" | "Okay" | "Poor", number>
  top_pick: { name: string; score: number; tier: string } | null
}

export function getSearchSummary(
  searchId: number,
  anonSessionId?: string
): Promise<SearchSummaryPayload> {
  const sid = anonSessionId ? `?anon_session_id=${anonSessionId}` : ""
  return apiRequest<SearchSummaryPayload>(
    `/api/v1/searches/${searchId}/summary${sid}`
  )
}

export type PendingName = {
  id: number
  name: string
  job: {
    status: "queued" | "running" | "succeeded" | "failed" | "canceled"
    progress: number
    current_step: string | null
    error: string | null
    snapshot?: {
      domains?: { tld: string; available: boolean }[]
      socials?: { platform: string; available: boolean }[]
      ai?: {
        models: { model: string; ok: boolean }[]
        verdict: "clean" | "minor" | "hard" | null
      }
    } | null
  } | null
}

export type SearchResultsPayload = {
  items: {
    name: string
    about: string | null
    score: number
    tier: string
    domains: { tld: string; available: boolean }[]
    socials: { platform: string; available: boolean }[]
    aiAssociation: string
  }[]
  pending: PendingName[]
}

export function getSearchResults(
  searchId: number,
  options?: {
    availableOnly?: boolean
    sort?: string
    q?: string
    anonSessionId?: string
  }
): Promise<SearchResultsPayload> {
  const params = new URLSearchParams()
  if (options?.anonSessionId)
    params.set("anon_session_id", options.anonSessionId)
  if (options?.availableOnly) params.set("available_only", "true")
  if (options?.sort) params.set("sort", options.sort)
  if (options?.q) params.set("q", options.q)
  const query = params.toString()
  return apiRequest<SearchResultsPayload>(
    `/api/v1/searches/${searchId}/results${query ? `?${query}` : ""}`
  )
}

export function claimSearches(
  anonSessionId: string
): Promise<{ claimed: number }> {
  return apiRequest("/api/v1/searches/claim", {
    method: "POST",
    body: { anon_session_id: anonSessionId },
  })
}

export function createName(
  searchId: number,
  input: {
    name: string
    about?: string
    anon_session_id?: string
    cf_turnstile_token?: string
  }
): Promise<NameItem> {
  return apiRequest<NameItem>(`/api/v1/searches/${searchId}/names`, {
    method: "POST",
    body: input,
  })
}

export type CheckEnqueued = {
  attempt_no: number
  status: string
}

export function runCheck(
  nameId: number,
  input: {
    tlds?: string[]
    platforms?: string[]
    anon_session_id?: string
    cf_turnstile_token?: string
  }
): Promise<CheckEnqueued> {
  return apiRequest<CheckEnqueued>(`/api/v1/names/${nameId}/checks`, {
    method: "POST",
    body: input,
    timeoutMs: 15000,
  })
}

export function cancelCheck(
  nameId: number,
  input: { anon_session_id?: string } = {}
): Promise<{ canceled: boolean }> {
  return apiRequest<{ canceled: boolean }>(
    `/api/v1/names/${nameId}/checks/cancel`,
    { method: "POST", body: input, timeoutMs: 15000 }
  )
}

export function checkAllNames(
  searchId: number,
  input: {
    anon_session_id?: string
    name_ids?: number[]
    cf_turnstile_token?: string
  } = {}
): Promise<{ queued: number; skipped: number }> {
  return apiRequest<{ queued: number; skipped: number }>(
    `/api/v1/searches/${searchId}/check-all`,
    { method: "POST", body: input, timeoutMs: 15000 }
  )
}

export function cancelAllChecks(
  searchId: number,
  input: { anon_session_id?: string } = {}
): Promise<{ canceled: number }> {
  return apiRequest<{ canceled: number }>(
    `/api/v1/searches/${searchId}/check-all/cancel`,
    { method: "POST", body: input, timeoutMs: 15000 }
  )
}

export function listChecks(nameId: number): Promise<AttemptItem[]> {
  return apiRequest<AttemptItem[]>(`/api/v1/names/${nameId}/checks`)
}

export function getReport(publicId: string): Promise<CheckReport> {
  return apiRequest<CheckReport>(`/api/v1/reports/${publicId}`)
}

export function searchByQuery(query: string): Promise<SearchDetail> {
  return apiRequest<SearchDetail>(
    `/api/v1/searches/by-query?q=${encodeURIComponent(query)}`
  )
}

export type Pack = {
  slug: string
  title: string
  credits: number
  price_minor: number
  currency: string
}

export type PlanInfo = {
  tier: string
  title: string
  max_sandboxes: number
  max_searches: number
  max_checks_per_name: number
  max_generation_runs: number
  watchlist_enabled: boolean
  used_sandboxes: number
  used_searches: number
  used_generation_runs: number
  credits: number
}

export function getPlan(): Promise<PlanInfo> {
  return apiRequest<PlanInfo>("/api/v1/billing/plan")
}

export function listPacks(): Promise<Pack[]> {
  return apiRequest<Pack[]>("/api/v1/packs")
}

export function createCheckout(
  packSlug: string,
  returnTo?: string
): Promise<{ checkout_url: string }> {
  return apiRequest("/api/v1/checkout", {
    method: "POST",
    body: { pack_slug: packSlug, return_to: returnTo },
  })
}

export function createProCheckout(returnTo?: string): Promise<{
  checkout_url: string
  subscription_id: string
}> {
  return apiRequest("/api/v1/billing/checkout/pro", {
    method: "POST",
    body: { return_to: returnTo },
  })
}

export type SignalProfile = {
  skills: string | null
  time_available: string | null
  budget: string | null
  audience: string | null
  business_model: string | null
  industries: string | null
  target_customer: string | null
  tech_comfort: string | null
}

export type SandboxRunStatus = "idle" | "generating" | "failed"

export type Sandbox = {
  public_id: string
  name: string
  auto_created: boolean
  run_status: SandboxRunStatus
  run_error: string | null
  signals: Partial<SignalProfile>
  idea_count: number
  search_count: number
  created_at: string
  ideas?: Idea[]
}

export type IdeaCanvas = {
  audience: string | null
  wedge: string | null
  model: string | null
}

export type Idea = {
  public_id: string
  title: string
  concept: string
  canvas: IdeaCanvas | null
  category: string
  status: string
  position: number
  pinned: boolean
  created_at: string
}

export type ResearchSection = {
  summary?: string
  competitors?: { name: string; pricing?: string; note?: string }[]
  signals?: string[]
  channels?: { channel: string; note?: string }[]
  paths?: { model: string; price?: string; note?: string }[]
}

export type Research = {
  status: "generating" | "ready" | "failed"
  error: string | null
  competitors: ResearchSection | null
  demand: ResearchSection | null
  audience_channels: ResearchSection | null
  monetization: ResearchSection | null
  summary: string | null
}

export function getSignalProfile(): Promise<SignalProfile> {
  return apiRequest<SignalProfile>("/api/v1/me/signals")
}

export function saveSignalProfile(
  profile: Partial<SignalProfile>
): Promise<SignalProfile> {
  return apiRequest<SignalProfile>("/api/v1/me/signals", {
    method: "PUT",
    body: profile,
  })
}

export function listSandboxes(): Promise<Sandbox[]> {
  return apiRequest<Sandbox[]>("/api/v1/sandboxes")
}

export function createSandbox(input: {
  name: string
  signals?: Partial<SignalProfile>
  anon_session_id?: string
  cf_turnstile_token?: string
}): Promise<Sandbox> {
  return apiRequest<Sandbox>("/api/v1/sandboxes", {
    method: "POST",
    body: input,
  })
}

export function getSandbox(
  publicId: string,
  sid?: string
): Promise<Sandbox> {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  return apiRequest<Sandbox>(`/api/v1/sandboxes/${publicId}${query}`)
}

export function updateSandbox(
  publicId: string,
  input: { name?: string; signals?: Partial<SignalProfile> },
  sid?: string
): Promise<Sandbox> {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  return apiRequest<Sandbox>(`/api/v1/sandboxes/${publicId}${query}`, {
    method: "PATCH",
    body: input,
  })
}

export function deleteSandbox(publicId: string, sid?: string): Promise<void> {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  return apiRequest(`/api/v1/sandboxes/${publicId}${query}`, {
    method: "DELETE",
  })
}

export function addManualIdea(
  publicId: string,
  input: { title: string; concept: string },
  sid?: string
): Promise<Idea> {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  return apiRequest<Idea>(`/api/v1/sandboxes/${publicId}/ideas${query}`, {
    method: "POST",
    body: input,
  })
}

export function generateIdeas(
  publicId: string,
  input: {
    count: number
    seed?: string
    anon_session_id?: string
    cf_turnstile_token?: string
  },
  sid?: string
): Promise<{ run_status: SandboxRunStatus }> {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  return apiRequest(`/api/v1/sandboxes/${publicId}/generate${query}`, {
    method: "POST",
    body: input,
  })
}

export function getResearch(ideaId: string): Promise<Research | null> {
  return apiRequest<Research | null>(`/api/v1/ideas/${ideaId}/research`)
}

export function startResearch(
  ideaId: string
): Promise<{ status: string; version: number }> {
  return apiRequest(`/api/v1/ideas/${ideaId}/research`, { method: "POST" })
}

export type OrderItem = {
  id: number
  status: string
  amount_minor: number
  currency: string
  paid_at: string | null
  created_at: string
  credits: number
  receipt_url: string | null
}

export function listOrders(): Promise<OrderItem[]> {
  return apiRequest<OrderItem[]>("/api/v1/orders")
}

export type Preferences = {
  report_ready: boolean
  payment_receipts: boolean
  product_updates: boolean
  watch_alerts: boolean
}

export function getPreferences(): Promise<Preferences> {
  return apiRequest<Preferences>("/api/v1/preferences")
}

export type ApiKeyItem = {
  id: number
  prefix: string
  name: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export type ApiKeyPage = {
  items: ApiKeyItem[]
  total: number
  page: number
  page_size: number
}

export function listApiKeys(page = 1, pageSize = 20): Promise<ApiKeyPage> {
  return apiRequest<ApiKeyPage>(
    `/api/v1/api-keys?page=${page}&page_size=${pageSize}`
  )
}

export function createApiKey(name: string): Promise<{
  id: number
  key: string
  prefix: string
  name: string
}> {
  return apiRequest("/api/v1/api-keys", {
    method: "POST",
    body: { name },
  })
}

export function revokeApiKey(keyId: number): Promise<void> {
  return apiRequest(`/api/v1/api-keys/${keyId}`, { method: "DELETE" })
}

export type WatchEventItem = {
  id: number
  kind: "domain_taken" | "domain_released" | "handle_taken" | "handle_released"
  label: string
  created_at: string
}

export type WatchItem = {
  id: number
  name_id: number
  search_id: number
  name: string
  status: "clean" | "threatened"
  tlds: string[]
  platforms: string[]
  clean_since: string | null
  days_clean: number | null
  last_swept_at: string | null
  created_at: string
  events: WatchEventItem[]
}

export type WatchList = {
  items: WatchItem[]
  total: number
  page: number | null
  page_size: number
  slots: { used: number; total: number }
}

export type WatchNameItem = {
  id: number
  name: string
  search_id: number
}

export function listWatches(params?: {
  q?: string
  status?: "clean" | "threatened"
  page?: number
  pageSize?: number
}): Promise<WatchList> {
  const search = new URLSearchParams()
  if (params?.q) search.set("q", params.q)
  if (params?.status) search.set("status", params.status)
  if (params?.page) search.set("page", String(params.page))
  if (params?.pageSize) search.set("page_size", String(params.pageSize))
  const query = search.toString()
  return apiRequest<WatchList>(`/api/v1/watches${query ? `?${query}` : ""}`)
}

export function listWatchNames(params?: {
  q?: string
}): Promise<{ items: WatchNameItem[] }> {
  const search = new URLSearchParams()
  if (params?.q) search.set("q", params.q)
  const query = search.toString()
  return apiRequest(
    `/api/v1/watches/names${query ? `?${query}` : ""}`
  )
}

export type CheckedNameItem = {
  name_id: number
  search_id: number
  name: string
  query: string
  score: number | null
  tier: "excellent" | "good" | "okay" | "poor" | null
  checked_at: string | null
  search_date: string
  watch_id: number | null
}

export type CheckedList = {
  items: CheckedNameItem[]
  total: number
  page: number
  page_size: number
}

export function listCheckedNames(params?: {
  q?: string
  watched?: "0" | "1"
  tier?: string
  sort?: "recent" | "score" | "name"
  page?: number
  pageSize?: number
}): Promise<CheckedList> {
  const search = new URLSearchParams()
  if (params?.q) search.set("q", params.q)
  if (params?.watched) search.set("watched", params.watched)
  if (params?.tier) search.set("tier", params.tier)
  if (params?.sort) search.set("sort", params.sort)
  if (params?.page) search.set("page", String(params.page))
  if (params?.pageSize) search.set("page_size", String(params.pageSize))
  const query = search.toString()
  return apiRequest<CheckedList>(
    `/api/v1/names/checked${query ? `?${query}` : ""}`
  )
}

export function addWatch(input: {
  search_id: number
  name: string
  tlds?: string[]
  platforms?: string[]
}): Promise<WatchItem> {
  return apiRequest<WatchItem>("/api/v1/watches", {
    method: "POST",
    body: input,
    timeoutMs: 15000,
  })
}

export function removeWatch(watchId: number): Promise<void> {
  return apiRequest(`/api/v1/watches/${watchId}`, { method: "DELETE" })
}

export function updateWatch(
  watchId: number,
  input: { tlds?: string[]; platforms?: string[] }
): Promise<WatchItem> {
  return apiRequest<WatchItem>(`/api/v1/watches/${watchId}`, {
    method: "PATCH",
    body: input,
  })
}

export function sweepWatch(
  watchId: number
): Promise<{ events: number; status: "clean" | "threatened" }> {
  return apiRequest(`/api/v1/watches/${watchId}/sweep`, {
    method: "POST",
    timeoutMs: 60000,
  })
}

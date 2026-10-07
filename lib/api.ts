export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"

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
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, timeoutMs = 30000, headers = {} }: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
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
  } | null
}

export type SearchDetail = SearchItem & {
  names: NameItem[]
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

export function getMe(): Promise<ApiUser> {
  return apiRequest<ApiUser>("/api/v1/me")
}

export function requestMagicLink(email: string): Promise<{ sent: boolean }> {
  return apiRequest("/api/v1/auth/magic-link", {
    method: "POST",
    body: { email },
  })
}

export function logout(): Promise<{ signed_out: boolean }> {
  return apiRequest("/api/v1/auth/logout", { method: "POST" })
}

export function googleAuthUrl(): string {
  return `${API_BASE}/api/v1/auth/google`
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

export type FilledSearch = SearchItem & {
  names: NameItem[]
  searches_left?: number
}

export function generateFilledSearch(input: {
  query: string
  category?: string
  style?: string
  count?: number
  anon_session_id?: string
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
  input: { name: string; about?: string; anon_session_id?: string }
): Promise<NameItem> {
  return apiRequest<NameItem>(`/api/v1/searches/${searchId}/names`, {
    method: "POST",
    body: input,
  })
}

export function runCheck(
  nameId: number,
  input: { tlds?: string[]; platforms?: string[]; anon_session_id?: string }
): Promise<CheckReport> {
  return apiRequest<CheckReport>(`/api/v1/names/${nameId}/checks`, {
    method: "POST",
    body: input,
    timeoutMs: 150000,
  })
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
  reports: number
  extra_searches: number
  price_minor: number
  currency: string
}

export function listPacks(): Promise<Pack[]> {
  return apiRequest<Pack[]>("/api/v1/packs")
}

export function createCheckout(
  packSlug: string
): Promise<{ checkout_url: string }> {
  return apiRequest("/api/v1/checkout", {
    method: "POST",
    body: { pack_slug: packSlug },
  })
}

export type OrderItem = {
  id: number
  status: string
  amount_minor: number
  currency: string
  paid_at: string | null
  created_at: string
  reports: number
  searches: number
}

export function listOrders(): Promise<OrderItem[]> {
  return apiRequest<OrderItem[]>("/api/v1/orders")
}

export type Preferences = {
  report_ready: boolean
  payment_receipts: boolean
  product_updates: boolean
}

export function getPreferences(): Promise<Preferences> {
  return apiRequest<Preferences>("/api/v1/preferences")
}

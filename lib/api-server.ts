import { cache } from "react"
import { cookies } from "next/headers"
import { ApiError, API_ORIGIN, apiRequest } from "./api"
import type { ApiUser } from "./api"

async function serverHeaders(): Promise<Record<string, string>> {
  const jar = await cookies()
  const cookie = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  return cookie ? { cookie } : {}
}

export const apiServer = cache(async function apiServer<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    headers: await serverHeaders(),
    base: API_ORIGIN,
  })
})

export function isLoggedOut(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

export async function getMeServer(): Promise<ApiUser | null> {
  try {
    return await apiServer<ApiUser>("/api/v1/me")
  } catch (error) {
    if (isLoggedOut(error)) return null
    throw error
  }
}

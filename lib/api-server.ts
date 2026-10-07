import { cookies } from "next/headers"
import { ApiError, apiRequest } from "./api"
import type { ApiUser } from "./api"

async function serverHeaders(): Promise<Record<string, string>> {
  const jar = await cookies()
  const cookie = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  return cookie ? { cookie } : {}
}

export async function apiServer<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  return apiRequest<T>(path, { ...init, headers: await serverHeaders() })
}

export async function getMeServer(): Promise<ApiUser | null> {
  try {
    return await apiServer<ApiUser>("/api/v1/me")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

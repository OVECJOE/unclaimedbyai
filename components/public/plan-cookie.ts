export const PENDING_PLAN_COOKIE = "uba-pending-plan"

export function writePlanCookie(plan: string): void {
  try {
    document.cookie = `${PENDING_PLAN_COOKIE}=${encodeURIComponent(plan)}; path=/; max-age=3600; SameSite=Lax`
  } catch {
    // Storage unavailable; the plan link still carries context.
  }
}

export function clearPlanCookie(): void {
  try {
    document.cookie = `${PENDING_PLAN_COOKIE}=; path=/; max-age=0; SameSite=Lax`
  } catch {
    // Nothing to clear.
  }
}

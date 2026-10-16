"use client"

import { useCallback, useEffect, useRef } from "react"
import { ApiError } from "@/lib/api"

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

type TurnstileApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string
  reset(widgetId?: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
    __ubaTurnstileLoading?: Promise<void>
  }
}

function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (!window.__ubaTurnstileLoading) {
    window.__ubaTurnstileLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Turnstile failed to load"))
      document.head.appendChild(script)
    }).catch((error) => {
      window.__ubaTurnstileLoading = undefined
      throw error
    })
  }
  return window.__ubaTurnstileLoading
}

/**
 * Renders a Cloudflare Turnstile widget and keeps a response token ready
 * for anonymous API calls. The backend accepts a verified browser through
 * a short-lived cookie, so the token is only needed for the first request
 * (or once the cookie expires). Call `reset()` after a token has been
 * consumed to pre-solve a fresh one, and `waitForToken()` before a submit
 * so fast typists never fire a request ahead of the first solve.
 */
export function useTurnstile(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const waitersRef = useRef<Array<(token: string) => void>>([])
  // While a verify() is mid-flight a background reset (the five-minute
  // expiry callback) must not clear a token the resend is about to use.
  const verifyingRef = useRef(false)

  const settleWaiters = useCallback((token: string) => {
    const waiters = waitersRef.current
    waitersRef.current = []
    for (const waiter of waiters) waiter(token)
  }, [])

  const reset = useCallback(() => {
    if (verifyingRef.current) return
    tokenRef.current = null
    const turnstile = window.turnstile
    if (turnstile && widgetIdRef.current) {
      turnstile.reset(widgetIdRef.current)
    }
  }, [])

  /**
   * Resolves with the current token, or waits for an in-flight solve to
   * deliver one. Omit `timeoutMs` to wait indefinitely, which is the
   * right shape when the interactive widget has just been surfaced and
   * the caller refuses to send a request without a real token.
   */
  const waitForToken = useCallback(
    (timeoutMs?: number): Promise<string | null> => {
      if (tokenRef.current) return Promise.resolve(tokenRef.current)
      if (!siteKey || !widgetIdRef.current) return Promise.resolve(null)
      return new Promise((resolve) => {
        const box: { timer?: ReturnType<typeof setTimeout> } = {}
        const settle = (token: string) => {
          if (box.timer) clearTimeout(box.timer)
          resolve(token)
        }
        if (timeoutMs !== undefined) {
          box.timer = setTimeout(() => {
            waitersRef.current = waitersRef.current.filter(
              (waiter) => waiter !== settle
            )
            resolve(tokenRef.current)
          }, timeoutMs)
        }
        waitersRef.current.push(settle)
      })
    },
    [siteKey]
  )

  /**
   * Send `attempt` once with whatever token exists. If the backend turns
   * it away with a 403, that rejection is what surfaces the interactive
   * widget, so we reset, wait for a real human solve, and resend. When no
   * widget is on the page (a signed-in caller) there is nothing to solve,
   * so the wait returns immediately and the 403 surfaces to the caller.
   * Pass `waitMs` to bound the human wait for unattended loops, where 0
   * means do not wait at all.
   */
  const verify = useCallback(
    async <T,>(
      attempt: (token?: string) => Promise<T>,
      options: { waitMs?: number } = {}
    ): Promise<T | null> => {
      if (!siteKey) return attempt()
      verifyingRef.current = true
      try {
        return await attempt((await waitForToken(2500)) ?? undefined)
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 403) {
          throw error
        }
        tokenRef.current = null
        const turnstile = window.turnstile
        if (turnstile && widgetIdRef.current) {
          turnstile.reset(widgetIdRef.current)
        }
        // A bounded wait (0 meaning do not wait at all) keeps an
        // unattended loop from hanging on a challenge nobody solves.
        const fresh = await waitForToken(options.waitMs)
        if (!fresh) return null
        return attempt(fresh)
      } finally {
        verifyingRef.current = false
      }
    },
    [siteKey, waitForToken]
  )

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false
    void loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || widgetIdRef.current) return
        widgetIdRef.current =
          window.turnstile?.render(containerRef.current, {
            sitekey: siteKey,
            action,
            appearance: "interaction-only",
            callback: (token: string) => {
              tokenRef.current = token
              settleWaiters(token)
            },
            "expired-callback": () => {
              // Tokens die after about five minutes. Re-solve immediately
              // in the background so an idle user's next action finds a
              // fresh token instead of a doomed request.
              reset()
            },
            "error-callback": () => {
              tokenRef.current = null
              return true
            },
          }) ?? null
      })
      .catch(() => {
        // If the widget can't load, requests go out without a token and the
        // backend's 403 message surfaces the reason to the user.
      })
    return () => {
      cancelled = true
      // Settle anyone still waiting so an unbounded wait cannot outlive
      // the component; they fall through as a failed solve.
      const stuck = waitersRef.current
      waitersRef.current = []
      for (const waiter of stuck) waiter("")
    }
  }, [siteKey, action, reset, settleWaiters])

  const widget = siteKey ? (
    <div ref={containerRef} className="flex justify-center" />
  ) : null

  return { widget, waitForToken, verify, reset, enabled: Boolean(siteKey) }
}

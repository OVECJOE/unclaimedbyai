"use client"

import { useCallback, useEffect, useRef } from "react"

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
 * consumed to pre-solve a fresh one.
 */
export function useTurnstile(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)

  const getToken = useCallback(() => tokenRef.current, [])

  const reset = useCallback(() => {
    tokenRef.current = null
    const turnstile = window.turnstile
    if (turnstile && widgetIdRef.current) {
      turnstile.reset(widgetIdRef.current)
    }
  }, [])

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
            },
            "expired-callback": () => {
              tokenRef.current = null
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
    }
  }, [siteKey, action])

  const widget = siteKey ? (
    <div ref={containerRef} className="flex justify-center" />
  ) : null

  return { widget, getToken, reset, enabled: Boolean(siteKey) }
}

"use client"

import { useCallback, useEffect, useReducer } from "react"
import {
  ApiError,
  claimSearches,
  createName,
  createSearch,
  generateNames,
  runCheck,
  type CheckReport as Report,
  type NameCandidate,
} from "@/lib/api"

const ANON_KEY = "uba-anon-id"

type Phase = "idle" | "generating" | "candidates" | "checking" | "done"

type State = {
  phase: Phase
  candidates: NameCandidate[]
  searchId: number | null
  checkingName: string | null
  searchesLeft: number | null
  report: Report | null
  error: string | null
}

type Action =
  | { type: "generate-start" }
  | {
      type: "generate-ok"
      candidates: NameCandidate[]
      searchId: number
      searchesLeft?: number
    }
  | { type: "generate-fail"; error: string }
  | { type: "check-start"; name: string }
  | { type: "check-ok"; report: Report }
  | { type: "check-fail"; error: string; searchId: number }

const initialState: State = {
  phase: "idle",
  candidates: [],
  searchId: null,
  checkingName: null,
  searchesLeft: null,
  report: null,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "generate-start":
      return {
        ...state,
        phase: "generating",
        candidates: [],
        searchId: null,
        report: null,
        error: null,
      }
    case "generate-ok":
      return {
        ...state,
        phase: "candidates",
        candidates: action.candidates,
        searchId: action.searchId,
        searchesLeft: action.searchesLeft ?? state.searchesLeft,
      }
    case "generate-fail":
      return { ...state, phase: "idle", error: action.error }
    case "check-start":
      return {
        ...state,
        phase: "checking",
        checkingName: action.name,
        report: null,
        error: null,
      }
    case "check-ok":
      return {
        ...state,
        phase: "done",
        checkingName: null,
        report: action.report,
      }
    case "check-fail":
      return {
        ...state,
        phase: "candidates",
        searchId: action.searchId,
        checkingName: null,
        error: action.error,
      }
  }
}

function toMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useSearchConsole(searchesLeft: number) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    searchesLeft,
  })

  useEffect(() => {
    let cancelled = false
    const id = localStorage.getItem(ANON_KEY)
    if (!id) return
    claimSearches(id)
      .then(() => {
        if (!cancelled) localStorage.removeItem(ANON_KEY)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const generate = useCallback(async (brief: string) => {
    dispatch({ type: "generate-start" })
    try {
      const [generated, search] = await Promise.all([
        generateNames(brief),
        createSearch({ query: brief }),
      ])
      dispatch({
        type: "generate-ok",
        candidates: generated.candidates,
        searchId: search.id,
        searchesLeft: search.searches_left,
      })
    } catch (error) {
      dispatch({
        type: "generate-fail",
        error: toMessage(error, "Something went wrong. Try again."),
      })
    }
  }, [])

  async function check(name: string) {
    const searchId = state.searchId
    if (searchId === null) return
    dispatch({ type: "check-start", name })
    try {
      const created = await createName(searchId, { name })
      const report = await runCheck(created.id, {})
      dispatch({ type: "check-ok", report })
    } catch (error) {
      dispatch({
        type: "check-fail",
        error: toMessage(error, "The check failed. Try again in a moment."),
        searchId,
      })
    }
  }

  return { state, generate, check }
}

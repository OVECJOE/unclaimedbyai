"use client"

import { create } from "zustand"
import {
  addManualIdea,
  createSandbox,
  deleteSandbox,
  generateIdeas,
  getPlan,
  getSandbox,
  listSandboxes,
  updateIdea,
  updateSandbox,
  type Idea,
  type PlanInfo,
  type Sandbox,
  type SandboxDetail,
  type SignalProfile,
} from "@/lib/api"

export type { SandboxDetail }

// How long each resource is served without revalidating. The plan
// barely moves, the list moves with every visit, and the open sandbox
// is what someone is actively working on, so each gets its own window.
const PLAN_TTL_MS = 60_000
const LIST_TTL_MS = 15_000
const DETAIL_TTL_MS = 5_000

// One promise per key, so two components asking for the same resource
// at the same moment share a single request instead of racing.
const inflight = new Map<string, Promise<unknown>>()

function share<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing
  const promise = run().finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

function isFresh(at: number, ttl: number): boolean {
  return at > 0 && Date.now() - at < ttl
}

type DashboardStore = {
  plan: PlanInfo | null
  planAt: number
  sandboxes: Sandbox[]
  sandboxesAt: number
  detail: SandboxDetail | null
  detailAt: number

  ensurePlan(options?: { force?: boolean }): Promise<PlanInfo | null>
  ensureSandboxes(options?: { force?: boolean }): Promise<Sandbox[]>
  openSandbox(
    publicId: string,
    options?: { force?: boolean }
  ): Promise<SandboxDetail | null>
  startGeneration(
    publicId: string,
    input: { count: number; seed?: string }
  ): Promise<void>
  addIdea(
    publicId: string,
    input: { title: string; concept: string }
  ): Promise<Idea | null>
  reorderIdeas(orderedIds: string[]): Promise<void>
  setPinned(ideaId: string, pinned: boolean): Promise<void>
  renameSandbox(publicId: string, name: string): Promise<void>
  removeSandbox(publicId: string): Promise<void>
  createAndOpen(input: {
    name: string
    signals?: Partial<SignalProfile>
  }): Promise<Sandbox | null>
}

/**
 * The dashboard's shared state: plan, sandbox list, and the sandbox
 * open on the canvas with its ideas.
 *
 * Components read through selectors and mutate through these actions,
 * so the API is called from one place per resource. Every fetch is
 * deduped against an in-flight request and stamped, which lets a
 * component re-render freely without refetching what it already has.
 */
export const useDashboardStore = create<DashboardStore>((set, get) => ({
  plan: null,
  planAt: 0,
  sandboxes: [],
  sandboxesAt: 0,
  detail: null,
  detailAt: 0,

  async ensurePlan(options) {
    const { plan, planAt } = get()
    if (!options?.force && plan && isFresh(planAt, PLAN_TTL_MS)) return plan
    try {
      const fresh = await share("plan", getPlan)
      set({ plan: fresh, planAt: Date.now() })
      return fresh
    } catch {
      // A failed plan fetch keeps whatever is on screen; every action
      // that needs the plan asks the API again on its own.
      return plan
    }
  },

  async ensureSandboxes(options) {
    const { sandboxes, sandboxesAt } = get()
    if (
      !options?.force &&
      sandboxesAt > 0 &&
      isFresh(sandboxesAt, LIST_TTL_MS)
    ) {
      return sandboxes
    }
    try {
      const page = await share("sandboxes", () =>
        listSandboxes({ page_size: 50 })
      )
      set({ sandboxes: page.items, sandboxesAt: Date.now() })
      return page.items
    } catch {
      return sandboxes
    }
  },

  async openSandbox(publicId, options) {
    const { detail, detailAt } = get()
    const same = detail?.public_id === publicId
    if (!options?.force && same && isFresh(detailAt, DETAIL_TTL_MS))
      return detail
    try {
      const full = await share(`sandbox:${publicId}`, () =>
        getSandbox(publicId)
      )
      set({ detail: full, detailAt: Date.now() })
      set((state) => ({
        sandboxes: state.sandboxes.map((item) =>
          item.public_id === publicId
            ? {
                ...item,
                run_status: full.run_status,
                run_error: full.run_error,
              }
            : item
        ),
      }))
      return full
    } catch {
      return same ? detail : null
    }
  },

  async startGeneration(publicId, input) {
    await generateIdeas(publicId, input)
    // The run just started, so the old detail is known stale: force the
    // refresh that begins the polling loop's first read.
    set((state) => ({
      detail:
        state.detail?.public_id === publicId
          ? { ...state.detail, run_status: "generating" }
          : state.detail,
    }))
    await get().openSandbox(publicId, { force: true })
  },

  async addIdea(publicId, input) {
    try {
      const idea = await addManualIdea(publicId, input)
      set((state) => {
        if (state.detail?.public_id !== publicId) return state
        return {
          detail: { ...state.detail, ideas: [...state.detail.ideas, idea] },
          detailAt: Date.now(),
        }
      })
      return idea
    } catch {
      return null
    }
  },

  async reorderIdeas(orderedIds) {
    const { detail } = get()
    if (!detail) return
    const previous = detail.ideas
    const byId = new Map(previous.map((idea) => [idea.public_id, idea]))
    const moved = orderedIds
      .map((id, index) => {
        const idea = byId.get(id)
        return idea ? { ...idea, position: index } : null
      })
      .filter((idea): idea is Idea => idea !== null)
    set({ detail: { ...detail, ideas: moved }, detailAt: Date.now() })
    const before = new Map(
      previous.map((idea) => [idea.public_id, idea.position])
    )
    try {
      // Only ideas whose position actually changed are written, so a
      // drag within one page of a long board does not touch every row.
      await Promise.all(
        moved.flatMap((idea, index) =>
          before.get(idea.public_id) === index
            ? []
            : [updateIdea(idea.public_id, { position: index })]
        )
      )
    } catch {
      // Rollback: the board returns to the order the server still holds.
      set({ detail: { ...detail, ideas: previous }, detailAt: Date.now() })
      throw new Error("The new order could not be saved.")
    }
  },

  async setPinned(ideaId, pinned) {
    const { detail } = get()
    if (!detail) return
    const previous = detail.ideas
    set({
      detail: {
        ...detail,
        ideas: previous.map((idea) =>
          idea.public_id === ideaId ? { ...idea, pinned } : idea
        ),
      },
      detailAt: Date.now(),
    })
    try {
      await updateIdea(ideaId, { pinned })
    } catch {
      set({ detail: { ...detail, ideas: previous }, detailAt: Date.now() })
      throw new Error("The pin could not be saved.")
    }
  },

  async renameSandbox(publicId, name) {
    try {
      const updated = await updateSandbox(publicId, { name })
      set((state) => ({
        sandboxes: state.sandboxes.map((item) =>
          item.public_id === publicId ? { ...item, ...updated } : item
        ),
        detail:
          state.detail?.public_id === publicId
            ? { ...state.detail, name: updated.name }
            : state.detail,
      }))
    } catch {
      throw new Error("The rename could not be saved.")
    }
  },

  async removeSandbox(publicId) {
    const { sandboxes, detail } = get()
    set({
      sandboxes: sandboxes.filter((item) => item.public_id !== publicId),
      sandboxesAt: Date.now(),
      detail: detail?.public_id === publicId ? null : detail,
      detailAt: detail?.public_id === publicId ? 0 : get().detailAt,
    })
    try {
      await deleteSandbox(publicId)
    } catch {
      // Put the row back where it was; the list is a cache of the
      // server's truth and must not quietly drop a sandbox that survived.
      set({ sandboxes, sandboxesAt: Date.now() })
      throw new Error("The sandbox could not be deleted.")
    }
  },

  async createAndOpen(input) {
    try {
      const sandbox = await createSandbox(input)
      set((state) => ({
        sandboxes: [sandbox, ...state.sandboxes],
        sandboxesAt: Date.now(),
      }))
      await get().openSandbox(sandbox.public_id, { force: true })
      return sandbox
    } catch {
      return null
    }
  },
}))

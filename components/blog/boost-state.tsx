"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type BoostSnapshot = {
  postBoosted: boolean
  commentBoosted: Set<number>
}

type BoostContextValue = BoostSnapshot & { refresh: () => void }

const BoostStateContext = createContext<BoostContextValue>({
  postBoosted: false,
  commentBoosted: new Set<number>(),
  refresh: () => {},
})

export function useBoostState() {
  return useContext(BoostStateContext)
}

export default function BoostStateProvider({
  postId,
  children,
}: {
  postId: number
  children: ReactNode
}) {
  const [snapshot, setSnapshot] = useState<BoostSnapshot>({
    postBoosted: false,
    commentBoosted: new Set<number>(),
  })
  const [epoch, setEpoch] = useState(0)
  const refresh = useCallback(() => setEpoch((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/blog/boost-state?postId=${postId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || cancelled) return
        setSnapshot({
          postBoosted: data.boosted?.post === true,
          commentBoosted: new Set<number>(data.boosted?.comments ?? []),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [postId, epoch])

  const value = useMemo(() => ({ ...snapshot, refresh }), [snapshot, refresh])

  return (
    <BoostStateContext.Provider value={value}>
      {children}
    </BoostStateContext.Provider>
  )
}

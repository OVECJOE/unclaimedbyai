"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type BoostSnapshot = {
  postBoosted: boolean
  commentBoosted: Set<number>
}

const BoostStateContext = createContext<BoostSnapshot>({
  postBoosted: false,
  commentBoosted: new Set<number>(),
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
  }, [postId])

  return (
    <BoostStateContext.Provider value={snapshot}>
      {children}
    </BoostStateContext.Provider>
  )
}

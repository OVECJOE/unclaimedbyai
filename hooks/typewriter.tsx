import { useEffect, useRef, useState } from "react"

export default function useTypewriter(phrases: string[], active: boolean) {
  const [text, setText] = useState("")
  const state = useRef({ phrase: 0, char: 0, deleting: false })

  useEffect(() => {
    if (!active) return
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const s = state.current
      const current = phrases[s.phrase]

      if (!s.deleting) {
        s.char++
        setText(current.slice(0, s.char))
        if (s.char === current.length) {
          s.deleting = true
          return 1600
        }
        return 45
      } else {
        s.char--
        setText(current.slice(0, s.char))
        if (s.char === 0) {
          s.deleting = false
          s.phrase = (s.phrase + 1) % phrases.length
          return 300
        }
        return 25
      }
    }

    const loop = () => {
      timeoutId = setTimeout(loop, tick())
    }
    loop()
    return () => clearTimeout(timeoutId)
  }, [active, phrases])

  return text
}

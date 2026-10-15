"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Highlight, themes } from "prism-react-renderer"
import "@/lib/prism-setup"
import "prismjs/components/prism-bash"
import { Button } from "@/components/ui/button"

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Server and hydration render with the light theme; the dark swap
  // happens after mount so the DOM the client hydrates matches exactly.
  const codeTheme = mounted && theme === "dark" ? themes.nightOwl : themes.github

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Copied to clipboard.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy. Select the code and copy manually.")
    }
  }

  return (
    <div className="group relative border bg-muted/40">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10 h-7 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={() => void copy()}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <Highlight
        theme={codeTheme}
        code={code}
        language="bash"
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto p-4 font-mono text-xs leading-relaxed"
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, lineIndex) => (
              <div key={lineIndex} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
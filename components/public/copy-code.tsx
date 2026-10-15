"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Highlight, themes, Prism } from "prism-react-renderer"
import { Button } from "@/components/ui/button"

// prism-react-renderer ships only a handful of grammars and bash is not
// one of them, so snippets rendered unhighlighted. Attach the official
// bash grammar to the shared Prism instance; the dynamic import keeps it
// from hoisting above this assignment, which it would evaluate first.
const globalScope = globalThis as { Prism?: typeof Prism }
if (!globalScope.Prism) globalScope.Prism = Prism
void import("prismjs/components/prism-bash")

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

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
        theme={theme === "dark" ? themes.nightOwl : themes.github}
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

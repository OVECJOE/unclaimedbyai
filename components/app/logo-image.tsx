import { cn } from "@/lib/utils"

type LogoImageProps = {
  href: string
  className?: string
}

/**
 * The wordmark SVG alone, with no link or navigation around it.
 * Split out of logo.tsx so non-Next surfaces — the browser extension
 * panel — can render the identical mark without importing next/link.
 */
export function LogoImage({ href, className }: LogoImageProps) {
  return (
    <svg
      className={cn("h-8 w-auto", className)}
      viewBox="0 0 1465 310"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Unclaimed"
      preserveAspectRatio="xMinYMid meet"
    >
      <image
        href={href}
        x="0"
        y="0"
        width="1465"
        height="310"
        preserveAspectRatio="none"
      />
    </svg>
  )
}

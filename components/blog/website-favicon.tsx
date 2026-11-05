"use client"

import { useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon } from "@hugeicons/core-free-icons"

function faviconSrc(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return null
  }
}

export default function WebsiteFavicon({ url }: { url: string }) {
  const src = faviconSrc(url)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (!src || failedUrl === url) {
    return <HugeiconsIcon icon={Globe02Icon} size="1.25rem" />
  }

  return (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      unoptimized
      onError={() => setFailedUrl(url)}
      className="size-5 object-contain"
    />
  )
}

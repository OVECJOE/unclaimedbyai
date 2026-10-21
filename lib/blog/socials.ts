import {
  GithubIcon,
  Globe02Icon,
  InstagramIcon,
  LinkedinIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import type { SocialPlatform } from "./types"

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform
  label: string
  icon: typeof NewTwitterIcon
  prefix?: string
}[] = [
  { value: "x", label: "X", icon: NewTwitterIcon, prefix: "https://x.com/" },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: LinkedinIcon,
    prefix: "https://linkedin.com/in/",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    prefix: "https://instagram.com/",
  },
  {
    value: "github",
    label: "GitHub",
    icon: GithubIcon,
    prefix: "https://github.com/",
  },
  { value: "website", label: "Website", icon: Globe02Icon },
]

const HANDLE_RE = /^[A-Za-z0-9._-]{1,50}$/

export function socialHandle(url: string, prefix: string | undefined): string {
  if (!prefix) return url
  return url.startsWith(prefix) ? url.slice(prefix.length) : url
}

export function composeSocialUrl(
  value: string,
  prefix: string | undefined
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!prefix) {
    return trimmed.startsWith("https://") ? trimmed : null
  }
  let handle = trimmed.startsWith(prefix)
    ? trimmed.slice(prefix.length)
    : trimmed
  if (handle.startsWith("@")) handle = handle.slice(1)
  return HANDLE_RE.test(handle) ? `${prefix}${handle}` : null
}

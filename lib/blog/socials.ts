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
}[] = [
  { value: "x", label: "X", icon: NewTwitterIcon },
  { value: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
  { value: "instagram", label: "Instagram", icon: InstagramIcon },
  { value: "github", label: "GitHub", icon: GithubIcon },
  { value: "website", label: "Website", icon: Globe02Icon },
]

export function platformLabel(platform: SocialPlatform): string | null {
  return (
    SOCIAL_PLATFORMS.find((entry) => entry.value === platform)?.label ?? null
  )
}

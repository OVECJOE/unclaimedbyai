import { HugeiconsIcon } from "@hugeicons/react"
import {
  GithubIcon,
  InstagramIcon,
  NewTwitterIcon,
  NpmIcon,
} from "@hugeicons/core-free-icons"
import type { NameResult } from "@/lib/constants"

const SOCIAL_ICONS = {
  github: GithubIcon,
  npm: NpmIcon,
  x: NewTwitterIcon,
  instagram: InstagramIcon,
} as const

export function SocialIcon({
  platform,
  className,
}: {
  platform: keyof typeof SOCIAL_ICONS
  className?: string
}) {
  return (
    <HugeiconsIcon
      icon={SOCIAL_ICONS[platform]}
      strokeWidth={2}
      aria-hidden="true"
      className={className}
    />
  )
}

export function SocialAvailabilityList({
  socials,
}: {
  socials: NameResult["socials"]
}) {
  return (
    <span className="flex items-center gap-2">
      {socials.map(({ platform, available }) => (
        <HugeiconsIcon
          key={platform}
          icon={SOCIAL_ICONS[platform]}
          strokeWidth={2}
          aria-hidden="true"
          className={
            available
              ? "size-4 text-foreground"
              : "size-4 text-muted-foreground opacity-60"
          }
        />
      ))}
    </span>
  )
}
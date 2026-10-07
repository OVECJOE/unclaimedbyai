import { HugeiconsIcon } from "@hugeicons/react"
import {
  GithubIcon,
  InstagramIcon,
  NewTwitterIcon,
  NpmIcon,
} from "@hugeicons/core-free-icons"

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
  socials: { platform: string; available: boolean }[]
}) {
  return (
    <span className="flex items-center gap-2">
      {socials.map(({ platform, available }) => {
        const icon =
          SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS] ?? null
        if (!icon) {
          return (
            <span
              key={platform}
              title={platform}
              aria-label={platform}
              className={
                available
                  ? "size-2 rounded-full bg-foreground"
                  : "size-2 rounded-full bg-muted-foreground opacity-60"
              }
            />
          )
        }
        return (
          <HugeiconsIcon
            key={platform}
            icon={icon}
            strokeWidth={2}
            aria-hidden="true"
            className={
              available
                ? "size-4 text-foreground"
                : "size-4 text-muted-foreground opacity-60"
            }
          />
        )
      })}
    </span>
  )
}
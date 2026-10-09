import { HugeiconsIcon } from "@hugeicons/react"
import {
  Behance01Icon,
  DiscordIcon,
  DribbbleIcon,
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  MediumIcon,
  NewTwitterIcon,
  NpmIcon,
  PinterestIcon,
  RedditIcon,
  SnapchatIcon,
  TelegramIcon,
  ThreadsIcon,
  TiktokIcon,
  TwitchIcon,
  VimeoIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"

const SOCIAL_ICONS = {
  github: GithubIcon,
  npm: NpmIcon,
  x: NewTwitterIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  linkedin: Linkedin01Icon,
  discord: DiscordIcon,
  reddit: RedditIcon,
  pinterest: PinterestIcon,
  snapchat: SnapchatIcon,
  threads: ThreadsIcon,
  telegram: TelegramIcon,
  twitch: TwitchIcon,
  medium: MediumIcon,
  behance: Behance01Icon,
  dribbble: DribbbleIcon,
  vimeo: VimeoIcon,
} as const

const TEXT_MARKS: Record<string, string> = {
  producthunt: "PH",
}

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

function AvailabilityMark({
  platform,
  available,
}: {
  platform: string
  available: boolean
}) {
  const icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS] ?? null
  const dimmed = available
    ? "text-foreground"
    : "text-muted-foreground opacity-60"
  if (icon) {
    return (
      <span title={platform} className="inline-flex">
        <HugeiconsIcon
          icon={icon}
          strokeWidth={2}
          aria-hidden="true"
          className={`size-4 ${dimmed}`}
        />
      </span>
    )
  }
  return (
    <span
      title={platform}
      aria-label={`${platform} ${available ? "available" : "taken"}`}
      className={`flex size-4 items-center justify-center text-[10px] font-bold ${dimmed}`}
    >
      {TEXT_MARKS[platform] ?? platform.slice(0, 2).toUpperCase()}
    </span>
  )
}

export function SocialAvailabilityList({
  socials,
}: {
  socials: { platform: string; available: boolean }[]
}) {
  return (
    <span className="flex items-center gap-2">
      {socials.map(({ platform, available }) => (
        <AvailabilityMark
          key={platform}
          platform={platform}
          available={available}
        />
      ))}
    </span>
  )
}

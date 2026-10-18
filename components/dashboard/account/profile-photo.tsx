import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { accountAvatarUrl } from "@/lib/avatar"

/**
 * The account's picture beside its name: the real profile photo when
 * Google stored one, otherwise the same square DiceBear face the
 * sidebar draws, so one account looks the same everywhere it appears.
 */
export function ProfilePhoto({
  avatarUrl,
  name,
  email,
}: {
  avatarUrl?: string | null
  name?: string | null
  email?: string | null
}) {
  const displayName = name || email || "?"
  const src = accountAvatarUrl({ avatar_url: avatarUrl, email })
  const initial = displayName.trim().charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-5">
      {/* Square overrides: the house style is flat and bordered, never
          rounded. Avatar handles the image-failed fallback itself. */}
      <Avatar className="size-16 shrink-0 rounded-none border after:rounded-none">
        {src ? <AvatarImage src={src} alt="" /> : null}
        <AvatarFallback className="rounded-none bg-primary/10 font-heading text-2xl font-semibold text-primary">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{displayName}</p>
        {email ? (
          <p className="text-sm text-muted-foreground lowercase">{email}</p>
        ) : null}
      </div>
    </div>
  )
}

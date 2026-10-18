/**
 * The DiceBear face every surface draws from, seeded with the email so
 * one account always draws the same face and a rename never changes it.
 */
export function dicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * The account's picture: the real profile photo when Google sign-in
 * stored one, otherwise the DiceBear face. One account, one avatar,
 * everywhere it appears.
 */
export function accountAvatarUrl(user: {
  avatar_url?: string | null
  email?: string | null
}): string | null {
  if (user.avatar_url) return user.avatar_url
  if (user.email) return dicebearAvatar(user.email)
  return null
}

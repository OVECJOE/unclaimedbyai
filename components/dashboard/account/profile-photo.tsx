"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function ProfilePhoto({
  seed,
  name,
}: {
  seed?: string | null
  name?: string | null
}) {
  const displayName = name || seed || "?"
  const seedValue = seed || displayName
  return (
    <div className="flex items-center gap-5">
      <Avatar className="h-16 w-16">
        <AvatarImage
          src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${encodeURIComponent(seedValue)}`}
          alt={displayName}
        />
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-muted-foreground">{seedValue}</p>
      </div>
    </div>
  )
}

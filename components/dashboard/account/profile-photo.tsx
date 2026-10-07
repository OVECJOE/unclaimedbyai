"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function ProfilePhoto({ seed, name }: { seed: string; name: string }) {
  return (
    <div className="flex items-center gap-5">
      <Avatar className="h-16 w-16">
        <AvatarImage
          src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${encodeURIComponent(seed)}`}
          alt={name}
        />
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{seed}</p>
      </div>
    </div>
  )
}

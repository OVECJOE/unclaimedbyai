import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon } from "@hugeicons/core-free-icons"
import { formatDateTime } from "@/lib/utils"
import {
  Avatar,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import Link from "next/link"

export type SearchResultCardProps = {
  id: string
  query: string
  nameCount: number
  topPick: { name: string; logo: string }
  namesPreview: { name: string; logo: string }[]
  createdAt: string
}

export function SearchResultCard({
  id,
  query,
  nameCount,
  namesPreview,
  topPick,
  createdAt,
}: SearchResultCardProps) {
  return (
    <Link href={`/dashboard/history/${id}`} as={`/dashboard/history/${id}`}>
      <div className="border-t px-2 py-4">
        <div className="flex items-start justify-between gap-6 px-1">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="space-y-1">
              <h5 className="line-clamp-3 truncate font-heading text-lg font-semibold md:text-xl">
                {query}
              </h5>
              <p className="text-xs leading-4 text-muted-foreground">
                {formatDateTime(createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={topPick.logo} alt={topPick.name} />
                <AvatarFallback>
                  <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium italic">
                <span className="text-primary">{topPick.name}</span> is
                the top pick
              </p>
            </div>
          </div>

          <AvatarGroup>
            {namesPreview.map((name, index) => (
              <Avatar key={index}>
                <AvatarImage src={name.logo} alt={name.name} />
                <AvatarFallback>
                  <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
                </AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount>
              +{nameCount - namesPreview.length}
            </AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>
    </Link>
  )
}

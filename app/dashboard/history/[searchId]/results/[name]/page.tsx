import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SEARCH_HISTORY, SEARCH_RESULTS } from "@/lib/constants"
import {
  aiAssociationColor,
  overallScoreColor,
  tierColor,
} from "@/lib/name-results"
import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon, SlashIcon } from "@hugeicons/core-free-icons"
import { notFound } from "next/navigation"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"

export default async function SearchResultNamePage({
  params,
}: {
  params: Promise<{ searchId: string; name: string }>
}) {
  const { searchId, name } = await params
  const searchDetails = SEARCH_HISTORY.find((search) => search.id === searchId)
  if (!searchDetails) {
    notFound()
  }

  const decodedName = decodeURIComponent(name)
  const result = SEARCH_RESULTS[searchId]?.find(
    (item) => item.name.toLowerCase() === decodedName.toLowerCase()
  )
  if (!result) {
    notFound()
  }

  return (
    <>
      <section className="px-4 pt-10 pb-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/history"
                  className="text-primary"
                >
                  History
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink
                  href={`/dashboard/history/${searchId}`}
                  className="text-primary"
                >
                  <span className="block max-w-lg truncate">
                    {searchDetails.query}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="block max-w-lg truncate">
                  {result.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={result.logo} alt={result.name} />
              <AvatarFallback>
                <HugeiconsIcon icon={BrandfetchIcon} className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <h1 className="truncate font-heading text-3xl font-semibold md:text-4xl">
                {result.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Badge className={overallScoreColor(result.score)}>
                  {result.score} / 100
                </Badge>
                <Badge className={aiAssociationColor(result.aiAssociation)}>
                  {result.aiAssociation}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="max-w-3xl border border-border bg-muted/50">
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Overall score
                </dt>
                <dd className="text-sm font-medium tabular-nums">
                  {result.score} / 100
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Grade tier
                </dt>
                <dd className={`text-sm font-medium ${tierColor(result.tier)}`}>
                  {result.tier}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  AI association
                </dt>
                <dd
                  className={`text-sm font-medium ${aiAssociationColor(result.aiAssociation)}`}
                >
                  {result.aiAssociation}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Domains
                </dt>
                <dd className="flex flex-wrap items-center gap-x-3">
                  {result.domains.map(({ tld, available }) => (
                    <span
                      key={tld}
                      className={
                        available
                          ? "text-sm font-semibold uppercase"
                          : "text-sm text-muted-foreground uppercase line-through decoration-border"
                      }
                    >
                      .{tld}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Socials
                </dt>
                <dd>
                  <SocialAvailabilityList socials={result.socials} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
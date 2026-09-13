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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain02Icon,
  ArrowRight01Icon,
  AtSignIcon,
  BrandfetchIcon,
  GlobeIcon,
  SlashIcon,
} from "@hugeicons/core-free-icons"
import { notFound } from "next/navigation"
import { SEARCH_HISTORY, SEARCH_RESULTS } from "@/lib/constants"
import { nameReports } from "@/lib/name-reports"
import type {
  CollisionDetail,
  ModelAssociation,
} from "@/lib/name-reports"
import { formatDateTime } from "@/lib/utils"
import { ScoreGauge } from "@/components/app/score-gauge"
import { TierBadge } from "@/components/tier-badge"
import { SocialIcon } from "@/components/dashboard/social-icons"

const VERDICT_COLORS: Record<CollisionDetail["verdict"], string> = {
  Clean: "bg-green-600 text-white px-1.5 py-0.5",
  Minor: "bg-yellow-500 text-black px-1.5 py-0.5",
  Hard: "bg-red-600 text-white px-1.5 py-0.5",
}

const RISK_COPY: Record<CollisionDetail["verdict"], string> = {
  Clean: "Low risk. Safe to build on.",
  Minor: "A few minor collisions. Proceed with care.",
  Hard: "High collision risk. You may want to reconsider.",
}

const ASSOCIATION_LABELS = ["Low", "Medium", "High", "Very High"] as const

type CheckStatus = { status: string; chipClass: string }

function checkStatus(available: number, total: number): CheckStatus {
  if (available === total) {
    return {
      status: "All clear",
      chipClass: "bg-green-600 text-white px-1.5 py-0.5",
    }
  }
  if (available >= total / 2) {
    return {
      status: "Mostly available",
      chipClass: "bg-yellow-500 text-black px-1.5 py-0.5",
    }
  }
  return {
    status: "Mostly taken",
    chipClass: "bg-red-600 text-white px-1.5 py-0.5",
  }
}

function CheckTile({
  icon,
  label,
  available,
  total,
  caption,
  chip,
  chipClass,
}: {
  icon: typeof GlobeIcon
  label: string
  available: number
  total: number
  caption: string
  chip: string
  chipClass: string
}) {
  return (
    <div className="space-y-5 bg-card p-5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="flex size-7 items-center justify-center border border-border">
          <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
        </span>
        {label}
      </span>
      <span className="flex items-end justify-between gap-2">
        <span>
          <span className="font-heading text-3xl font-semibold leading-none">
            {available}
            <span className="text-base font-normal text-muted-foreground">
              /{total}
            </span>
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {caption}
          </span>
        </span>
        <Badge className={chipClass}>{chip}</Badge>
      </span>
    </div>
  )
}

const CONFIDENCE: Record<
  ModelAssociation["confidence"],
  { label: string; className: string }
> = {
  none: { label: "None", className: "text-muted-foreground" },
  weak: { label: "Weak", className: "text-amber-600" },
  strong: { label: "Strong", className: "text-red-600" },
}

const CATEGORY_LABELS: Record<ModelAssociation["category"], string> = {
  none: "None",
  company: "Company",
  product: "Product",
  person: "Person",
  place: "Place",
  common_word: "Common word",
}

const PLATFORM_LABELS = {
  github: "GitHub",
  npm: "npm",
  x: "X",
  instagram: "Instagram",
} as const

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

  const grouped = nameReports[searchId]
  const report =
    grouped &&
    Object.entries(grouped).find(
      ([reportName]) => reportName.toLowerCase() === decodedName.toLowerCase()
    )?.[1]
  if (!report) {
    notFound()
  }

  const totalDomains = report.domains.length
  const totalSocials = report.socials.length
  const availableDomains = report.domains.filter((d) => d.available).length
  const availableSocials = report.socials.filter((s) => s.available).length
  const verdict = report.collision.verdict

  const domainStatus = checkStatus(availableDomains, totalDomains)
  const socialStatus = checkStatus(availableSocials, totalSocials)

  const associatingModels = report.collision.perModel.filter(
    (m) => m.confidence !== "none"
  ).length
  const totalModels = report.collision.perModel.length
  const associationLabel =
    ASSOCIATION_LABELS[Math.min(associatingModels, ASSOCIATION_LABELS.length - 1)]
  const associationChipClass =
    associationLabel === "Low"
      ? "bg-green-600 text-white px-1.5 py-0.5"
      : associationLabel === "Medium"
        ? "bg-yellow-500 text-black px-1.5 py-0.5"
        : "bg-red-600 text-white px-1.5 py-0.5"

  const availabilityCopy =
    availableDomains === totalDomains
      ? "full availability"
      : availableDomains >= totalDomains / 2
        ? "strong availability"
        : "weak availability"
  const associationCopy =
    associationLabel === "Low"
      ? "low AI association"
      : associationLabel === "Medium"
        ? "moderate AI association"
        : "high AI association"

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
                  className="truncate text-primary"
                >
                  {searchDetails.query}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {report.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card>
            <CardHeader className="text-center">
              <Avatar size="lg" className="mx-auto">
                <AvatarImage src={report.logo} alt={report.name} />
                <AvatarFallback>
                  <HugeiconsIcon icon={BrandfetchIcon} className="size-5" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl md:text-4xl">
                {report.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated for &apos;{report.query}&apos;
              </p>
              <p className="text-sm text-muted-foreground">
                Searched {formatDateTime(searchDetails.createdAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 text-center">
              <div className="flex flex-col items-center gap-2">
                <ScoreGauge score={report.score} tier={report.tier} />
                <TierBadge tier={report.tier} />
                <p className="text-xs text-muted-foreground">
                  {RISK_COPY[verdict]}
                </p>
              </div>
              <Button size="lg">Buy for $1.99</Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <div className="max-w-full overflow-x-auto pb-1">
              <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="social-handles">
                  Social Handles
                </TabsTrigger>
                <TabsTrigger value="ai-association">
                  AI Association
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview">
              <Card size="sm">
                <CardContent className="space-y-5">
                  <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
                    <CheckTile
                      icon={GlobeIcon}
                      label="Domains"
                      available={availableDomains}
                      total={totalDomains}
                      caption="available"
                      chip={domainStatus.status}
                      chipClass={domainStatus.chipClass}
                    />
                    <CheckTile
                      icon={AtSignIcon}
                      label="Social handles"
                      available={availableSocials}
                      total={totalSocials}
                      caption="open"
                      chip={socialStatus.status}
                      chipClass={socialStatus.chipClass}
                    />
                    <CheckTile
                      icon={AiBrain02Icon}
                      label="AI association"
                      available={associatingModels}
                      total={totalModels}
                      caption="models associate"
                      chip={associationLabel}
                      chipClass={associationChipClass}
                    />
                  </div>

                  <div className="flex flex-col gap-4 border border-border bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[0.625rem] font-medium tracking-widest uppercase text-muted-foreground">
                        Recommended next step
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.name} has {availabilityCopy} and{" "}
                        {associationCopy}. Buy the full report to see raw results
                        and register the assets with confidence.
                      </p>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link href="/pricing">
                        Buy report · $1.99
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains">
              <Card size="sm">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-end">
                          Checked via
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.domains.map((domain) => (
                        <TableRow key={domain.tld}>
                          <TableCell className="font-medium">
                            .{domain.tld}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                domain.available
                                  ? "font-medium text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {domain.available ? "Available" : "Taken"}
                            </span>
                          </TableCell>
                          <TableCell className="text-end">
                            <span className="break-all text-xs text-muted-foreground">
                              {domain.checkedVia}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social-handles">
              <Card size="sm">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-end">
                          Checked via
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.socials.map((social) => (
                        <TableRow key={social.platform}>
                          <TableCell>
                            <span className="flex items-center gap-2 font-medium">
                              <SocialIcon
                                platform={social.platform}
                                className="size-4"
                              />
                              {PLATFORM_LABELS[social.platform]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                social.available
                                  ? "font-medium text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {social.available ? "Available" : "Taken"}
                            </span>
                          </TableCell>
                          <TableCell className="text-end">
                            <span className="break-all text-xs text-muted-foreground">
                              {social.checkedVia}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-association">
              <Card size="sm">
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={VERDICT_COLORS[verdict]}>
                      {verdict}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {report.collision.summary}
                    </p>
                  </div>

                  <Separator />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Sees it as</TableHead>
                        <TableHead className="text-end">
                          Confidence
                        </TableHead>
                        <TableHead className="text-end">Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.collision.perModel.map((assoc) => (
                        <TableRow key={assoc.model}>
                          <TableCell className="font-mono text-xs">
                            {assoc.model}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {assoc.knownAs}
                          </TableCell>
                          <TableCell className="text-end">
                            <span className={CONFIDENCE[assoc.confidence].className}>
                              {CONFIDENCE[assoc.confidence].label}
                            </span>
                          </TableCell>
                          <TableCell className="text-end text-muted-foreground">
                            {CATEGORY_LABELS[assoc.category]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {report.similarKnownBrands.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-[0.625rem] font-medium tracking-widest uppercase text-muted-foreground">
                          Similar known brands
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {report.similarKnownBrands.map((brand) => (
                            <span
                              key={brand.name}
                              className="border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
                            >
                              {brand.name}
                              <span className="text-muted-foreground">
                                {" "}
                                · {Math.round(brand.similarity * 100)}% similar
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  )
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  GlobeIcon,
  ArrowAllDirectionIcon,
} from "@hugeicons/core-free-icons"
import { notFound, redirect } from "next/navigation"
import { ScoreGauge } from "@/components/app/score-gauge"
import { TierBadge, type Tier } from "@/components/tier-badge"
import { formatDateTime } from "@/lib/utils"
import { getMeServer, apiServer } from "@/lib/api-server"
import {
  ApiError,
  getReport,
  type CheckReport,
  type SearchDetail,
} from "@/lib/api"

export const dynamic = "force-dynamic"

const VERDICTS = ["Clean", "Minor", "Hard"] as const
type Verdict = (typeof VERDICTS)[number]

const VERDICT_COLORS: Record<Verdict, string> = {
  Clean: "bg-green-600 text-white px-1.5 py-0.5",
  Minor: "bg-yellow-500 text-black px-1.5 py-0.5",
  Hard: "bg-red-600 text-white px-1.5 py-0.5",
}

const RISK_COPY: Record<Verdict, string> = {
  Clean: "Low risk. Safe to build on.",
  Minor: "A few minor collisions. Proceed with care.",
  Hard: "High collision risk. You may want to reconsider.",
}

function toVerdict(value: string): Verdict {
  const mapped = value.charAt(0).toUpperCase() + value.slice(1)
  return (VERDICTS as readonly string[]).includes(mapped)
    ? (mapped as Verdict)
    : "Minor"
}

function toTier(level: CheckReport["overall_risk_level"]): Tier {
  return (level.charAt(0).toUpperCase() + level.slice(1)) as Tier
}

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

export default async function SearchResultNamePage({
  params,
}: {
  params: Promise<{ searchId: string; name: string }>
}) {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  const { searchId, name } = await params
  const id = Number.parseInt(searchId, 10)
  if (!Number.isInteger(id)) notFound()

  let search: SearchDetail
  try {
    search = await apiServer<SearchDetail>(`/api/v1/searches/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  const decodedName = decodeURIComponent(name)
  const nameItem = search.names.find(
    (item) => item.name.toLowerCase() === decodedName.toLowerCase()
  )
  if (!nameItem?.latest_check) {
    notFound()
  }

  let report: CheckReport
  try {
    report = await getReport(nameItem.latest_check.public_id)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  const availableDomains = report.domains.filter(
    (d) => d.status === "available"
  ).length
  const availableSocials = report.socials.filter(
    (s) => s.status === "available"
  ).length
  const totalDomains = report.domains.length
  const totalSocials = report.socials.length
  const verdict = toVerdict(
    report.ai.some((row) => (row.collision_confidence ?? 0) >= 70)
      ? "hard"
      : report.ai.some((row) => (row.collision_confidence ?? 0) >= 30)
        ? "minor"
        : "clean"
  )

  const domainStatus = checkStatus(availableDomains, totalDomains)
  const socialStatus = checkStatus(availableSocials, totalSocials)

  const associating = report.ai.filter((row) => row.association).length
  const associationLabel =
    associating === 0 ? "Low" : associating === 1 ? "Medium" : "High"
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
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
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
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink
                  href={`/dashboard/history/${search.id}`}
                  className="truncate text-primary"
                >
                  {search.query}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {nameItem.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card>
            <CardHeader className="text-center">
              <Avatar size="lg" className="mx-auto">
                <AvatarFallback className="font-heading text-2xl">
                  {nameItem.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl md:text-4xl">
                {nameItem.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated for &apos;{search.query}&apos;
              </p>
              <p className="text-sm text-muted-foreground">
                Searched {formatDateTime(search.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 text-center">
              <div className="flex flex-col items-center gap-2">
                <ScoreGauge
                  score={report.overall_score}
                  tier={toTier(report.overall_risk_level)}
                />
                <TierBadge tier={toTier(report.overall_risk_level)} />
                <p className="text-xs text-muted-foreground">
                  {RISK_COPY[verdict]}
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/pricing">Buy the full report</Link>
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <div className="max-w-full overflow-x-auto pb-1 scrollbar-none">
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
                      available={associating}
                      total={report.ai.length}
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
                        {nameItem.name} has {availabilityCopy}. Buy the full
                        report to see raw results and register the assets
                        with confidence.
                      </p>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link href="/pricing">
                        Buy report
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
                        <TableHead className="text-end">Checked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.domains.map((domain) => (
                        <TableRow key={domain.domain}>
                          <TableCell className="font-mono">
                            {domain.domain}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                domain.status === "available"
                                  ? "font-medium text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {domain.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-end">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(domain.checked_at)}
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
                        <TableHead className="text-end">Checked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.socials.map((social) => (
                        <TableRow key={social.platform}>
                          <TableCell>
                            <span className="font-medium capitalize">
                              {social.platform}{" "}
                              <span className="text-muted-foreground">
                                @{social.handle}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                social.status === "available"
                                  ? "font-medium text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {social.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-end">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(social.checked_at)}
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
                      {report.judgment}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.ai.map((row, index) => (
                        <TableRow key={`${row.model ?? "unknown"}-${index}`}>
                          <TableCell className="font-mono text-xs">
                            {row.model ?? "unknown model"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.error ?? row.association ?? "None reported"}
                          </TableCell>
                          <TableCell className="text-end text-muted-foreground">
                            {typeof row.collision_confidence === "number"
                              ? `${row.collision_confidence}/100`
                              : "Not reported"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  )
}

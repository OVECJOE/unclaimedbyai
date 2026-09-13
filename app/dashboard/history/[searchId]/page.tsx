import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SEARCH_HISTORY, SEARCH_RESULTS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { DotIcon, SlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { notFound } from "next/navigation";
import GradingDistribution from "@/components/dashboard/grading-distribution";
import ScoreSummary from "@/components/dashboard/score-summary";

export default async function HistorySearchPage({ params }: { params: Promise<{ searchId: string }>
}) {
  const { searchId } = await params;
  const searchDetails = SEARCH_HISTORY.find((search) => search.id === searchId);
  if (!searchDetails) {
    notFound()
  }

  const searchResults = SEARCH_RESULTS[searchId]

  return (
    <>
    <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/history" className="text-primary">History</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={SlashIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate min-w-0 max-w-lg">
                  {searchDetails.query}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-1">
            <h1 className="truncate font-heading text-4xl font-semibold md:text-5xl">
              Results for &apos;<span className="text-primary">{searchDetails.query}</span>&apos;
            </h1>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground">{searchDetails.nameCount} names generated</span>
              <HugeiconsIcon icon={DotIcon} />
              <span className="text-xs text-muted-foreground">{formatDateTime(searchDetails.createdAt)}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-6 md:flex-row">
            <div className="min-w-0 flex-1 space-y-4">
              <GradingDistribution results={searchResults ?? []} />
            </div>
            <ScoreSummary results={searchResults ?? []} topPick={searchDetails.topPick} />
          </div>
        </div>
    </section>
    </>
  )
}

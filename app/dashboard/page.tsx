import Prompter from "@/components/app/prompter";
import { Button } from "@/components/ui/button";
import { SearchResultCard, SearchResultCardProps } from "@/components/dashboard/search-result-card";
import Link from "next/link";
import { RECENT_SEARCHES } from "@/lib/constants";

const recentSearches: SearchResultCardProps[] = RECENT_SEARCHES.slice(0, 5)

export default function DashboardPage() {
  return (
    <>
      {/* Hero (What are you building?) */}
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            What are you building?
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Describe it and we&apos;ll generate names, then check them for you.
          </p>
        </div>
        <Prompter hideFooter />
      </section>

      {/* Recent searches */}
      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-7xl">
          <div className="flex items-center justify-between gap-5">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold">Recent searches</h3>
            <Link href="/dashboard/history">
              <Button variant="link" className="p-0">View all</Button>
            </Link>
          </div>
          <div className="my-4 divide-y divide-border">
            {recentSearches.map((search) => (
              <SearchResultCard key={search.id} {...search} />
            ))}
          </div>
        </div>

      </section>
    </>
  )
}

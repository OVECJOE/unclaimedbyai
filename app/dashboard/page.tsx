import Prompter from "@/components/app/prompter";
import { Button } from "@/components/ui/button";
import { SearchResultCard, SearchResultCardProps } from "@/components/dashboard/search-result-card";
import Link from "next/link";

const recentSearches: SearchResultCardProps[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    query: "A naming and domain checker",
    nameCount: 10,
    topPick: {
      name: "Namebase",
      logo: "https://www.google.com/s2/favicons?domain=namebase.io&sz=64",
    },
    namesPreview: [
      {
        name: "Namebase",
        logo: "https://www.google.com/s2/favicons?domain=namebase.io&sz=64",
      },
      {
        name: "Namely",
        logo: "https://www.google.com/s2/favicons?domain=namely.com&sz=64",
      },
      {
        name: "Brandmark",
        logo: "https://www.google.com/s2/favicons?domain=brandmark.io&sz=64",
      },
    ],
    createdAt: "2026-09-04T10:42:00Z",
  },
  {
    id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    query: "Project management tool for small teams",
    nameCount: 8,
    topPick: {
      name: "Linear",
      logo: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
    },
    namesPreview: [
      {
        name: "Linear",
        logo: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
      },
      {
        name: "Basecamp",
        logo: "https://www.google.com/s2/favicons?domain=basecamp.com&sz=64",
      },
      {
        name: "Height",
        logo: "https://www.google.com/s2/favicons?domain=height.app&sz=64",
      },
    ],
    createdAt: "2026-09-03T16:11:00Z",
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    query: "AI video summarizer",
    nameCount: 12,
    topPick: {
      name: "Descript",
      logo: "https://www.google.com/s2/favicons?domain=descript.com&sz=64",
    },
    namesPreview: [
      {
        name: "Descript",
        logo: "https://www.google.com/s2/favicons?domain=descript.com&sz=64",
      },
      {
        name: "Otter",
        logo: "https://www.google.com/s2/favicons?domain=otter.ai&sz=64",
      },
      {
        name: "Riverside",
        logo: "https://www.google.com/s2/favicons?domain=riverside.fm&sz=64",
      },
    ],
    createdAt: "2026-09-03T11:03:00Z",
  },
  {
    id: "8f14e45f-ea8f-4c9a-bc8d-2e8f3f5a7b21",
    query: "A marketplace for independent designers",
    nameCount: 10,
    topPick: {
      name: "Contra",
      logo: "https://www.google.com/s2/favicons?domain=contra.com&sz=64",
    },
    namesPreview: [
      {
        name: "Contra",
        logo: "https://www.google.com/s2/favicons?domain=contra.com&sz=64",
      },
      {
        name: "Dribbble",
        logo: "https://www.google.com/s2/favicons?domain=dribbble.com&sz=64",
      },
      {
        name: "Behance",
        logo: "https://www.google.com/s2/favicons?domain=behance.net&sz=64",
      },
    ],
    createdAt: "2026-09-02T14:27:00Z",
  },
  {
    id: "9a7b3c2d-5e6f-4a8b-91c2-d4e5f6a7b8c9",
    query: "Personal finance app for freelancers",
    nameCount: 15,
    topPick: {
      name: "Wise",
      logo: "https://www.google.com/s2/favicons?domain=wise.com&sz=64",
    },
    namesPreview: [
      {
        name: "Wise",
        logo: "https://www.google.com/s2/favicons?domain=wise.com&sz=64",
      },
      {
        name: "Monzo",
        logo: "https://www.google.com/s2/favicons?domain=monzo.com&sz=64",
      },
      {
        name: "Ramp",
        logo: "https://www.google.com/s2/favicons?domain=ramp.com&sz=64",
      },
    ],
    createdAt: "2026-09-01T09:18:00Z",
  },
]

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
          <div className="my-4">
            {recentSearches.map((search) => (
              <SearchResultCard key={search.id} {...search} />
            ))}
          </div>
        </div>

      </section>
    </>
  )
}

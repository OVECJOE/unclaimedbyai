import Link from "next/link"
import { redirect } from "next/navigation"
import UpgradeButton from "@/components/dashboard/upgrade-button"
import DashboardPrompter from "@/components/dashboard/dashboard-prompter"
import StatsRow from "@/components/dashboard/stats-row"
import ActivityChart from "@/components/dashboard/activity-chart"
import RecentSandboxes from "@/components/dashboard/recent-sandboxes"
import DailyNameCard from "@/components/dashboard/daily-name-card"
import OnboardingChecklist from "@/components/dashboard/onboarding-checklist"
import RecentChecks from "@/components/dashboard/recent-checks"
import DashboardPageHeader from "@/components/dashboard/page-header"
import { getMeServer, apiServer } from "@/lib/api-server"
import {
  ApiError,
  type CheckedList,
  type MeStats,
  type PlanInfo,
  type Sandbox,
  type SignalProfile,
} from "@/lib/api"

export const dynamic = "force-dynamic"

const PRODUCT_NOTES = [
  {
    title: "The playground moved",
    body: "Sandboxes and your watchlist now live together under Playground in the sidebar, and the canvas is one click away.",
  },
  {
    title: "Idea generation is open",
    body: "Free accounts get three runs a day. Each run has four studios argue from different angles and a judge keeps the strongest.",
  },
  {
    title: "Credits buy the deep work",
    body: "Market research costs 3 credits, a search 2, and a re-check 1. Your first check on any name is always free.",
  },
]

function greeting(name: string | null, email: string): string {
  if (name) return name
  const handle = email.split("@")[0]
  return handle.charAt(0).toUpperCase() + handle.slice(1)
}

/**
 * The dashboard home: the box to check a name or an idea, the names
 * you checked most recently, your activity, and where you left off.
 * Every fetch fires together so the page paints in one pass.
 */
export default async function DashboardHomePage() {
  const [user, stats, plan, sandboxes, signals, checked] = await Promise.all([
    getMeServer().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }),
    apiServer<MeStats>("/api/v1/me/stats").catch((): MeStats | null => null),
    apiServer<PlanInfo>("/api/v1/plan").catch((): PlanInfo | null => null),
    apiServer<{ items: Sandbox[] }>("/api/v1/sandboxes?page_size=3").catch(
      (): { items: Sandbox[] } | null => null
    ),
    apiServer<SignalProfile>("/api/v1/me/signals").catch(
      (): SignalProfile | null => null
    ),
    apiServer<CheckedList>("/api/v1/names/checked?page_size=6").catch(
      (): CheckedList | null => null
    ),
  ])
  if (!user) redirect("/auth")

  const isPro = plan?.tier === "pro"
  const hasSignals = Boolean(
    signals && Object.values(signals).some((value) => value)
  )

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardPageHeader
          title={
            <span className="inline-flex flex-wrap items-center gap-3">
              Hello, {greeting(user.full_name, user.email)}
              <span className="border px-2 py-0.5 font-sans text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                {isPro ? "Pro" : "Free"}
              </span>
            </span>
          }
          description="Check a name or describe an idea. Everything you've done so far is below."
          actions={
            !isPro ? (
              <>
                <p className="max-w-56 text-sm text-muted-foreground">
                  Pro removes the sandbox cap and adds the watchlist.
                </p>
                <UpgradeButton />
              </>
            ) : null
          }
        />

        {stats ? <StatsRow stats={stats} /> : null}

        <OnboardingChecklist
          searchesUsed={stats?.searches_used ?? 0}
          sandboxesCount={sandboxes?.items?.length ?? 0}
        />

        {/* The prompter wears no card: its own bordered box and aura are
            the surface. min-w-0 lets the columns shrink below their
            content's first-paint width on narrow screens. */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
          <DashboardPrompter hasSignals={hasSignals} />
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-2xl font-semibold">
                Names you checked
              </h2>
              <Link
                href="/dashboard/playground/watchlist?tab=browse"
                className="text-sm text-primary underline"
              >
                See all
              </Link>
            </div>
            <RecentChecks items={checked?.items ?? []} />
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
          <div data-tour="activity" className="border p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-xl font-semibold">Last 30 days</h2>
              <p className="text-xs text-muted-foreground">
                <span className="inline-block size-2 bg-primary align-middle" />{" "}
                Searches{"  "}
                <span className="inline-block size-2 bg-[var(--chart-2)] align-middle" />{" "}
                Checks
              </p>
            </div>
            <div className="mt-4">
              {stats ? (
                <ActivityChart days={stats.activity} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Activity could not be loaded.
                </p>
              )}
            </div>
          </div>
          <DailyNameCard userKey={user.id ? String(user.id) : user.email} />
        </div>

        <div data-tour="recent-sandboxes" className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-2xl font-semibold">
              Recent sandboxes
            </h2>
            <Link
              href="/dashboard/playground/sandboxes"
              className="text-sm text-primary underline"
            >
              All sandboxes
            </Link>
          </div>
          <RecentSandboxes sandboxes={sandboxes?.items ?? []} />
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold">
            What&apos;s new
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_NOTES.map((note) => (
              <li key={note.title} className="border p-5">
                <p className="font-heading text-lg font-semibold">
                  {note.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {note.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

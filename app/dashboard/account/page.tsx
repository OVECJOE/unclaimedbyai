import {
  ProfilePhoto,
  PreferencesForm,
  ProfileForm,
  DeleteAccount,
} from "@/components/dashboard/account"
import ApiKeysSection from "@/components/dashboard/account/api-keys-section"
import SignalsForm from "@/components/dashboard/account/signals-form"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type Preferences, type SignalProfile } from "@/lib/api"

export const dynamic = "force-dynamic"

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "signals", label: "Steer" },
  { value: "notifications", label: "Notifications" },
  { value: "api", label: "API" },
] as const

type TabValue = (typeof TABS)[number]["value"]

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const active: TabValue = TABS.some((entry) => entry.value === tab)
    ? (tab as TabValue)
    : "profile"
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  const [prefs, signals] = await Promise.all([
    apiServer<Preferences>("/api/v1/preferences").catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) redirect("/auth")
      throw error
    }),
    apiServer<SignalProfile>("/api/v1/me/signals").catch(
      (): SignalProfile | null => null
    ),
  ])

  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Tabs defaultValue={active} className="w-full min-w-0">
            {/* The tab row scrolls sideways on narrow screens instead of
                clipping. justify-start matters: the list defaults to
                justify-center, which overflows a centered row off both
                edges and makes the left cut-off unreachable by scroll.
                The triggers are flex-1, so they still spread evenly
                whenever there is room. pb-2 gives the active underline
                vertical room inside the scroll box; -mb-2 pays the
                space back. */}
            <TabsList
              variant="line"
              className="-mb-2 w-full shrink-0 [scrollbar-width:none] justify-start overflow-x-auto border-b pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((entry) => (
                <TabsTrigger key={entry.value} value={entry.value} asChild>
                  <Link href={`/dashboard/account?tab=${entry.value}`}>
                    {entry.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-10">
              <TabsContent value="profile" className="space-y-8">
                <ProfilePhoto
                  avatarUrl={user.avatar_url}
                  name={user.full_name}
                  email={user.email}
                />
                <ProfileForm fullName={user.full_name} email={user.email} />
                <Separator orientation="horizontal" />
                <DeleteAccount />
              </TabsContent>
              <TabsContent value="signals">
                <SignalsForm initial={signals} />
              </TabsContent>
              <TabsContent value="notifications">
                <PreferencesForm initial={prefs} />
              </TabsContent>
              <TabsContent value="api">
                <ApiKeysSection />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  )
}

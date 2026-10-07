import {
  ProfilePhoto,
  PreferencesForm,
  DeleteAccount,
} from "@/components/dashboard/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type Preferences } from "@/lib/api"
import { updateProfile } from "./actions"

export const dynamic = "force-dynamic"

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab: "profile" | "notifications" }>
}) {
  const { tab } = await searchParams
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  let prefs: Preferences | null = null
  try {
    prefs = await apiServer<Preferences>("/api/v1/preferences")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

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
          <Tabs defaultValue={tab ?? "profile"}>
            <TabsList variant="line" className="w-full border-b">
              <TabsTrigger value="profile" asChild>
                <Link href="/dashboard/account?tab=profile">Profile</Link>
              </TabsTrigger>
              <TabsTrigger value="notifications" asChild>
                <Link href="/dashboard/account?tab=notifications">
                  Notifications
                </Link>
              </TabsTrigger>
            </TabsList>
            <div className="mt-10">
              <TabsContent value="profile" className="space-y-8">
                <ProfilePhoto
                  seed={user.email}
                  name={user.full_name || user.email}
                />
                <form action={updateProfile} className="max-w-prose space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="full_name"
                      defaultValue={user.full_name ?? ""}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      aria-describedby="email-note"
                    />
                    <p
                      id="email-note"
                      className="text-xs text-muted-foreground"
                    >
                      Email is tied to your sign-in and can&apos;t be changed
                      here.
                    </p>
                  </div>
                  <Button type="submit">Save changes</Button>
                </form>
                <Separator orientation="horizontal" />
                <DeleteAccount />
              </TabsContent>
              <TabsContent value="notifications">
                <PreferencesForm initial={prefs} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  )
}

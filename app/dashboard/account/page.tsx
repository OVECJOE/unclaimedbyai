import { ProfilePhoto } from "@/components/dashboard/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ tab: 'profile' | 'notifications' }>
  }) {
  const { tab } = await searchParams

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
            <TabsList variant="line" className="border-b w-full">
              <TabsTrigger value="profile" asChild>
                <Link href="/dashboard/account?tab=profile">
                  Profile
                </Link>
              </TabsTrigger>
              <TabsTrigger value="notifications" asChild>
                <Link href="/dashboard/account?tab=notifications">
                  Notifications
                </Link>
              </TabsTrigger>
            </TabsList>
            <div className="mt-10">
              <TabsContent value="profile" className="space-y-8">
                <ProfilePhoto />
                <form className="space-y-3 max-w-prose">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Enter your email" />
                  </div>
                  <Button type="submit">Save changes</Button>
                </form>
                <Separator orientation="horizontal" />
                <form className="space-y-3">
                  <div className="space-y-0.5">
                    <h5 className="text-lg md:text-xl font-heading text-destructive font-medium">
                      Delete account
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Permanently deletes your account and search history. This can&apos;t be undone.
                    </p>
                  </div>
                  <Button type="submit" variant="destructive">Delete account</Button>
                </form>
              </TabsContent>
              <TabsContent value="notifications">
                <form className="space-y-5">
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-0.5 w-full">
                      <Label className="text-lg font-heading font-semibold" htmlFor="report-ready">
                        Report ready
                      </Label>
                      <p className="text-sm text-muted-foreground">When a check you started finishes running.</p>
                    </div>
                    <Switch id="report-ready" defaultChecked />
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-0.5 w-full">
                      <Label className="text-lg font-heading font-semibold" htmlFor="payment-receipts">
                        Payment receipts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Email a receipt after every purchase.
                      </p>
                    </div>
                    <Switch id="payment-receipts" defaultChecked />
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-0.5 w-full">
                      <Label className="text-lg font-heading font-semibold" htmlFor="product-updates">
                        Product updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Occasional emails about new features.
                      </p>
                    </div>
                    <Switch id="product-updates" defaultChecked={false} />
                  </div>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  )
}

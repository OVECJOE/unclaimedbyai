import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { totalSpent } from "@/lib/billing"

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
              Billing
            </h1>
            <p className="text-sm text-muted-foreground">
              Total spent:{" "}
              <span className="font-mono font-semibold text-primary">
                ${totalSpent}
              </span>
            </p>
          </div>
          <Tabs defaultValue={tab}>
            <div>
              <TabsList variant="line">
                <TabsTrigger value="profile">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from "next"
import IdeaCardLink from "@/components/ideas/idea-card"
import { JsonLd } from "@/components/app/json-ld"
import PrompterCta from "@/components/public/prompter-cta"
import { SectionHeader } from "@/components/public/section-header"
import { listIdeas } from "@/lib/ideas"
import { pageMetadata, SITE_URL } from "@/lib/site"

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: "Idea reports: real names, checked live",
  description:
    "Founders published what happened when they checked their business names: which survived, which lost their .com, and which ones chatbots already link to another brand.",
  path: "/ideas",
})

export default async function IdeasIndexPage() {
  const { items, total } = await listIdeas(48)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Idea reports",
          url: `${SITE_URL}/ideas`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: total,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/ideas/${item.slug}`,
              name: item.title,
            })),
          },
        }}
      />
      <section className="border-b px-4 pt-16 pb-12 md:pt-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            as="h1"
            eyebrow="Idea reports"
            title="What happens when real names get checked"
            lede="Founders share how their naming went: which names survived, which lost their .com, and which ones chatbots already link to someone else."
          />
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {items.length > 0 ? (
            <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.slug}>
                  <IdeaCardLink item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="border border-dashed p-10 text-center text-muted-foreground">
              No idea reports yet. Run a search and publish yours from its
              results page.
            </p>
          )}
        </div>
      </section>

      <section className="border-t px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="font-heading text-3xl text-balance sm:text-4xl">
            Check your own name
          </h2>
          <PrompterCta />
        </div>
      </section>
    </>
  )
}

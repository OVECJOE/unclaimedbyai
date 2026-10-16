import type { Metadata } from "next"

export const SITE_NAME = "Unclaimed by AI"
export const SITE_URL = "https://www.unclaimedbyai.com"
export const SITE_DESCRIPTION =
  "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one."
export const OG_PATH = "/og-image.png"

export const FREE_SEARCHES = 3
export const PRO_PRICE = 14.99
export const CURRENCY = "USD"
export const CURRENCY_SYMBOL = "$"

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}

/** What a credit pack buys, in the vocabulary the pivot introduced. */
export function creditPackBenefits(credits: number): string[] {
  return [
    `${credits} credits, yours until spent`,
    "Research a market for 3 credits",
    "Run a search for 2 credits",
    "Re-check a name for 1 credit",
  ]
}

export function proBenefits(limits: {
  max_sandboxes: number
  max_searches: number
  max_checks_per_name: number
  max_generation_runs: number
}): string[] {
  return [
    `${limits.max_sandboxes} sandboxes to build ideas in`,
    `${limits.max_searches} searches a month`,
    `${limits.max_checks_per_name} checks per name, so availability stays fresh`,
    `${limits.max_generation_runs} idea runs a day`,
    "Watchlist, so a name you love gets re-checked for you",
  ]
}

const BASE_PLANS = [
  { slug: "credits-20", title: "20 credits", amount: 7.99, credits: 20 },
  { slug: "credits-60", title: "60 credits", amount: 19.99, credits: 60 },
  { slug: "credits-150", title: "150 credits", amount: 39.99, credits: 150 },
]

const BASE_RATE = BASE_PLANS[0].amount / BASE_PLANS[0].credits

export const PLANS = BASE_PLANS.map((plan) => ({
  ...plan,
  label: `${formatPrice(plan.amount / plan.credits)} per credit.`,
  benefits: creditPackBenefits(plan.credits),
  discountage: Math.round(
    (1 - plan.amount / plan.credits / BASE_RATE) * 100
  ),
}))

const planSummary = PLANS.map(
  (plan) => `${plan.credits} for ${formatPrice(plan.amount)}`
)

export const PRICING_DESCRIPTION = `Start free with ${FREE_SEARCHES} searches a month and a free first check on every name. Buy credits to research markets, run extra searches, and re-check names: ${planSummary
  .slice(0, -1)
  .join(", ")}, or ${planSummary[planSummary.length - 1]}.`

export type PageMetadataArgs = {
  title: string
  description: string
  path: string
}

export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataArgs): Metadata {
  const url = new URL(path, SITE_URL).toString()

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      images: [OG_PATH],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_PATH],
    },
  }
}

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}${OG_PATH}`,
      description: SITE_DESCRIPTION,
    },
  ],
}

export const offersJsonLd = PLANS.map((plan) => ({
  "@type": "Offer",
  name: plan.title,
  description: `${plan.credits} credits, yours until spent. Research a market for 3, run a search for 2, re-check a name for 1.`,
  price: plan.amount,
  priceCurrency: CURRENCY,
  url: `${SITE_URL}/pricing`,
  seller: { "@id": `${SITE_URL}/#organization` },
}))

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: SITE_NAME,
  url: SITE_URL,
  description: `Name checker for founders and creators. Generate name ideas and check domains, social handles, and AI associations across GPT, Claude, and Perplexity before you build around one. ${FREE_SEARCHES} free searches, and the first check on every name is free.`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Name checker",
  operatingSystem: "Web",
  inLanguage: "en",
  image: `${SITE_URL}${OG_PATH}`,
  offers: offersJsonLd,
  provider: { "@id": `${SITE_URL}/#organization` },
}

export const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": `${SITE_URL}/pricing#catalog`,
  name: `${SITE_NAME} pricing`,
  url: `${SITE_URL}/pricing`,
  description: PRICING_DESCRIPTION,
  inLanguage: "en",
  itemListElement: offersJsonLd,
}

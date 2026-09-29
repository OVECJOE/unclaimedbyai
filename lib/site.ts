import type { Metadata } from "next"

export const SITE_NAME = "Unclaimed by AI"
export const SITE_URL = "https://unclaimedbyai.com"
export const SITE_DESCRIPTION =
  "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one."
export const OG_PATH = "/og-image.png"

export const FREE_SEARCHES = 3
export const SEARCHES_PER_REPORT = 3
export const CURRENCY = "USD"
export const CURRENCY_SYMBOL = "$"

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}

export function planBenefits(reports: number): string[] {
  const searches = reports * SEARCHES_PER_REPORT
  return [
    `${reports} ${reports === 1 ? "report" : "reports"} for re-checking names`,
    `+${searches} extra searches`,
    "First check on every name stays free",
    "No subscription",
  ]
}

const BASE_PLANS = [
  { slug: "single", title: "Single report", amount: 1.99, reports: 1 },
  { slug: "five", title: "5 reports", amount: 6.99, reports: 5 },
  { slug: "twenty", title: "20 reports", amount: 21.99, reports: 20 },
]

const SINGLE_PLAN_AMOUNT = BASE_PLANS[0].amount

export const PLANS = BASE_PLANS.map((plan) => ({
  ...plan,
  label:
    plan.reports === 1
      ? "One name, one re-check."
      : `${formatPrice(plan.amount / plan.reports)} per report.`,
  benefits: planBenefits(plan.reports),
  discountage:
    plan.reports === 1
      ? undefined
      : Math.round(
          (1 - plan.amount / (SINGLE_PLAN_AMOUNT * plan.reports)) * 100
        ),
}))

const planSummary = PLANS.map(
  (plan) => `${plan.reports} for ${formatPrice(plan.amount)}`
)

export const PRICING_DESCRIPTION = `Start with ${FREE_SEARCHES} free searches and a free first check on every name. Buy reports to re-check names and run more searches: ${planSummary
  .slice(0, -1)
  .join(", ")}, or ${planSummary[planSummary.length - 1]}. No subscriptions.`

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
  description: `${plan.reports} ${
    plan.reports === 1 ? "report" : "reports"
  } for re-checking names, plus ${
    plan.reports * SEARCHES_PER_REPORT
  } extra searches.`,
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
  description: `Name checker for founders and creators. Generate name ideas and check domains, social handles, and AI associations across GPT, Claude, and Gemini before you build around one. ${FREE_SEARCHES} free searches, and the first check on every name is free.`,
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

import type { Metadata } from "next"

export const SITE_NAME = "Unclaimed by AI"
export const SITE_URL = "https://unclaimedbyai.com"
export const SITE_DESCRIPTION =
  "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one."
export const OG_PATH = "/og-image.png"

export const PLANS = [
  {
    title: "Single report",
    amount: 1.99,
    label: "One name, full report.",
    benefits: ["Domains", "Social handles", "AI association"],
  },
  {
    title: "5 reports",
    amount: 6.99,
    label: "$1.40 per report.",
    benefits: ["Domains", "Social handles", "AI association"],
    discountage: 30,
  },
  {
    title: "20 reports",
    amount: 21.99,
    label: "$1.10 per report.",
    benefits: ["Domains", "Social handles", "AI association"],
    discountage: 45,
  },
]

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
  price: plan.amount,
  priceCurrency: "USD",
  url: `${SITE_URL}/pricing`,
  seller: { "@id": `${SITE_URL}/#organization` },
}))

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Free name checker for founders and creators. Generate name ideas and check domains, social handles, and AI associations across GPT, Claude, and Gemini before you build around one.",
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
  description: "Simple, transparent pricing. Pay per report, no subscriptions.",
  inLanguage: "en",
  itemListElement: offersJsonLd,
}
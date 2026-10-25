export interface NameResult {
  name: string
  logo: string
  rationale?: string | null
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  // null = the check could not tell; never render it as taken.
  domains: { tld: "com" | "ai" | "io" | "co"; available: boolean | null }[]
  socials: {
    platform: "github" | "npm" | "x" | "instagram"
    available: boolean | null
  }[]
  aiAssociation: "Low" | "Medium" | "High" | "Very High"
}

export const ITEMS_PER_PAGE = 10

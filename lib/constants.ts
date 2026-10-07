export interface NameResult {
  name: string
  logo: string
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  domains: { tld: "com" | "ai" | "io" | "co"; available: boolean }[]
  socials: {
    platform: "github" | "npm" | "x" | "instagram"
    available: boolean
  }[]
  aiAssociation: "Low" | "Medium" | "High" | "Very High"
}

export const ITEMS_PER_PAGE = 10

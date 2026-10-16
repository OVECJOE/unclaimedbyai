/**
 * Registrar affiliate links, in one place.
 *
 * Every program runs on a different network with a different deep-link and
 * tracking-parameter convention, so the formats live here rather than being
 * scattered across components. Adding a registrar, retiring a dead program,
 * or moving networks is a change to this file alone.
 *
 * Networks:
 *   Impact  (Namecheap)  ?u=<encoded landing URL>  ?subId1=<placement>
 *   CJ      (GoDaddy,    ?sid=<placement>
 *             Dynadot)
 *
 * Each program is enabled by setting its base tracking link in the
 * environment. With no link set the program is absent: no link renders, so
 * nothing ships broken before an account is approved. The vars, all
 * NEXT_PUBLIC_ so they inline at build time:
 *
 *   NEXT_PUBLIC_NAMECHEAP_AFFILIATE_URL  Impact link, base only
 *   NEXT_PUBLIC_GODADDY_AFFILIATE_URL    CJ click URL
 *   NEXT_PUBLIC_DYNADOT_AFFILIATE_URL    CJ click URL
 *
 * Set them in Vercel, then redeploy, since they are baked in at build time
 * and an existing deployment will not pick them up at runtime.
 */

/** Surface an affiliate link appears on. Tagged per placement so earning can
 *  be compared across surfaces in each network's reporting. */
export type AffiliatePlacement =
  | "check-chips"
  | "keeper-card"
  | "watch-email"
  | "post-checkout"

export type Registrar = "namecheap" | "godaddy" | "dynadot"

/** Namecheap runs its program on Impact, which deep-links with a `u`
 *  parameter carrying the percent-encoded landing URL. */
const namecheapBase = process.env.NEXT_PUBLIC_NAMECHEAP_AFFILIATE_URL
/** GoDaddy runs on CJ. */
const godaddyBase = process.env.NEXT_PUBLIC_GODADDY_AFFILIATE_URL
/** Dynadot's ambassador program is also managed through CJ. */
const dynadotBase = process.env.NEXT_PUBLIC_DYNADOT_AFFILIATE_URL

/** The Namecheap landing page a checked domain should resolve to, so the
 *  visitor lands on the search result for the exact name they just saw
 *  marked free rather than on a generic homepage. */
function namecheapLanding(domain: string): string {
  return `https://www.namecheap.com/domains/registration/results.aspx?domain=${domain}`
}

/** The GoDaddy equivalent. GoDaddy's affiliate endpoint honours this as a
 *  landing page and keeps its query string, which is what lets a chip
 *  pre-scope the search to the one extension this check verified free. */
function godaddyLanding(domain: string): string {
  return `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`
}

/**
 * The affiliate link for a registrar, or null when that program has no link
 * configured. Callers must handle null by rendering no link, which keeps an
 * unapproved program invisible instead of shipping a dead href.
 *
 * `domain` is only honoured where the network supports deep linking, which
 * today means Namecheap and GoDaddy. Passing it elsewhere is harmless.
 */
export function affiliateLink(
  registrar: Registrar,
  placement: AffiliatePlacement,
  domain?: string
): string | null {
  if (registrar === "namecheap") {
    if (!namecheapBase) return null
    const url = new URL(namecheapBase)
    if (domain) {
      url.searchParams.set("u", namecheapLanding(domain))
    }
    url.searchParams.set("subId1", placement)
    return url.toString()
  }

  if (registrar === "godaddy") {
    if (!godaddyBase) return null
    const url = new URL(godaddyBase)
    if (domain) {
      // GoDaddy's affiliate endpoint treats url= as the landing page and
      // preserves its query string, so the visitor lands on a search for
      // the exact domain this check just verified free.
      url.searchParams.set("url", godaddyLanding(domain))
    }
    url.searchParams.set("sid", placement)
    return url.toString()
  }

  if (registrar === "dynadot") {
    if (!dynadotBase) return null
    const url = new URL(dynadotBase)
    url.searchParams.set("sid", placement)
    return url.toString()
  }

  return null
}

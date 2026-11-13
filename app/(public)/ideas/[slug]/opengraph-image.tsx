import { ImageResponse } from "next/og"
import { analyze, getIdeaPage } from "@/lib/ideas"

export const alt = "Idea report"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 300

/**
 * The share card: the title, the one-line result and the winner, big
 * enough to read as a thumbnail. Built from the same analysis as the
 * page, so a shared link promises exactly what the page delivers.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getIdeaPage(slug)
  const story = page ? analyze(page.names) : null
  const winner = story?.survivors[0] ?? story?.best ?? null

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#faf9fb",
        color: "#14111a",
        padding: 64,
        borderLeft: "16px solid #6d28d9",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#6d28d9",
        }}
      >
        Unclaimed by AI · Idea report
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: 1000,
          }}
        >
          {page ? page.title.slice(0, 90) : "Idea report"}
        </div>
        {story ? (
          <div style={{ display: "flex", fontSize: 40, color: "#4b4458" }}>
            {story.headline}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 30,
        }}
      >
        <div style={{ display: "flex", color: "#4b4458" }}>
          {winner
            ? `${story?.survivors.length ? "Survivor" : "Top name"}: ${winner.name.name} (${winner.name.score}/100)`
            : "Checked live: domains, handles, chatbots"}
        </div>
        <div style={{ display: "flex", color: "#6d28d9" }}>
          unclaimedbyai.com
        </div>
      </div>
    </div>,
    size
  )
}

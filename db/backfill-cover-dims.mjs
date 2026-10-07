import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const { imageSize } = await import(
  join(root, "node_modules/image-size/dist/esm/index.js")
)
const { neon } = await import(
  join(root, "node_modules/@neondatabase/serverless/index.mjs")
)

const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const SITE = "https://unclaimedbyai.com"
const sql = neon(env.BLOG_DATABASE_URL)

const posts = await sql`
  select id::int as id, slug, cover_image_url
  from blog_posts
  where cover_image_url is not null
    and (cover_image_width is null or cover_image_height is null)
`

let updated = 0
for (const post of posts) {
  try {
    const url = post.cover_image_url.startsWith("http")
      ? post.cover_image_url
      : `${SITE}${post.cover_image_url}`
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`skip ${post.slug}: http ${res.status}`)
      continue
    }
    const dims = imageSize(Buffer.from(await res.arrayBuffer()))
    if (!dims.width || !dims.height) {
      console.log(`skip ${post.slug}: unreadable`)
      continue
    }
    await sql`
      update blog_posts
      set cover_image_width = ${dims.width}, cover_image_height = ${dims.height}
      where id = ${post.id}
    `
    updated++
    console.log(`ok ${post.slug}: ${dims.width}x${dims.height}`)
  } catch (error) {
    console.log(
      `skip ${post.slug}: ${error instanceof Error ? error.message : error}`
    )
  }
}
console.log(`done: ${updated}/${posts.length} backfilled`)

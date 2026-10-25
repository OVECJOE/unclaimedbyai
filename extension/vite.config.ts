import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"

const here = import.meta.dirname

/**
 * The store's copy lives here, not in public/: host permissions are
 * derived from the build's site origin so a production package never
 * ships localhost, and the Chrome limits (name 45, description 132)
 * are enforced at build time — a too-long description should fail the
 * build, not the store upload.
 */
const MANIFEST = {
  manifest_version: 3,
  name: "Unclaimed by AI",
  version: "0.1.0",
  description:
    "Right-click any text: screen a name against live .com, real handles and AI associations — or send an idea to the studios.",
  minimum_chrome_version: "116",
  side_panel: { default_path: "index.html" },
  background: { service_worker: "background.js", type: "module" },
  permissions: ["sidePanel", "contextMenus", "storage", "alarms"],
  action: { default_title: "Unclaimed by AI — screen a name" },
  icons: { "48": "icon-48.png", "128": "icon-128.png" },
} as const

function validateManifest(): void {
  if (MANIFEST.name.length > 45) {
    throw new Error(`manifest name is ${MANIFEST.name.length} chars (max 45)`)
  }
  if (MANIFEST.description.length > 132) {
    throw new Error(
      `manifest description is ${MANIFEST.description.length} chars (max 132)`
    )
  }
}

/** host_permissions for the site origin, plus its www twin for real
 *  domains (the canonical host and its apex both serve the rewrite);
 *  localhost and raw IPs get no twin. */
function hostPermissions(site: string): string[] {
  const target = new URL(site)
  const hosts = new Set([`${target.protocol}//${target.host}`])
  const host = target.hostname
  const isLocal =
    host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  if (!isLocal) {
    const twin = host.startsWith("www.") ? host.slice(4) : `www.${host}`
    hosts.add(`${target.protocol}//${twin}`)
  }
  return [...hosts].map((origin) => `${origin}/*`)
}

export default defineConfig(({ mode }) => {
  // The site origin the panel talks to. All API traffic goes through the
  // site's own /api/v1 rewrite, so the production API URL stays deploy
  // config and the extension never bakes it into a store listing. The
  // bearer API key rides along instead of cookies (cross-site SameSite
  // rules make extension cookie auth unreliable anyway).
  //
  //   EXT_SITE_ORIGIN=https://www.unclaimedbyai.com npm run extension:build
  const site = process.env.EXT_SITE_ORIGIN ?? "http://localhost:3000"

  // NEXT_PUBLIC_* inlines at the site's build; Vite does not read
  // .env.local for process.env, so load the repo's env files here and
  // inline the same values — otherwise lib/affiliate throws on bare
  // `process` the moment DomainChip loads in the panel.
  const env = loadEnv(mode, resolve(here, ".."), "")
  const inline = (key: string): string => JSON.stringify(env[key] ?? "")

  return {
    root: here,
    // Relative asset URLs, because extension pages live at
    // chrome-extension://<id>/ — absolute paths would escape the package.
    base: "./",
    define: {
      "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(site),
      "process.env.NEXT_PUBLIC_NAMECHEAP_AFFILIATE_URL":
        inline("NEXT_PUBLIC_NAMECHEAP_AFFILIATE_URL"),
      "process.env.NEXT_PUBLIC_GODADDY_AFFILIATE_URL": inline(
        "NEXT_PUBLIC_GODADDY_AFFILIATE_URL"
      ),
      "process.env.NEXT_PUBLIC_DYNADOT_AFFILIATE_URL": inline(
        "NEXT_PUBLIC_DYNADOT_AFFILIATE_URL"
      ),
    },
    plugins: [
      react(),
      {
        name: "uba:write-manifest",
        closeBundle() {
          validateManifest()
          writeFileSync(
            resolve(here, "dist/manifest.json"),
            JSON.stringify(
              { ...MANIFEST, host_permissions: hostPermissions(site) },
              null,
              2
            ) + "\n"
          )
        },
      },
    ],
    resolve: {
      // The whole point of this build: reuse the site's components,
      // sounds and types straight from the repo root. next/link is
      // shimmed to a plain anchor — the panel has no router.
      alias: {
        "next/link": resolve(here, "src/shims/next-link.tsx"),
        "@": resolve(here, ".."),
      },
    },
    css: {
      // Same postcss config as the site (Tailwind v4), located explicitly
      // because the vite root here is extension/, not the repo root.
      postcss: resolve(here, "../postcss.config.mjs"),
    },
    server: { fs: { allow: [resolve(here, "..")] } },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          panel: resolve(here, "index.html"),
          background: resolve(here, "src/background.ts"),
        },
        output: {
          // Stable names: manifest.json references background.js and
          // index.html, and store reviews hate hashed surprises.
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  }
})

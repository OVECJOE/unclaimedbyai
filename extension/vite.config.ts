import { resolve } from "node:path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"

const here = import.meta.dirname

export default defineConfig(({ mode }) => {
  // The site origin the panel talks to. All API traffic goes through the
  // site's own /api/v1 rewrite, so the production API URL stays deploy
  // config and the extension never bakes it into a store listing. The
  // bearer API key rides along instead of cookies (cross-site SameSite
  // rules make extension cookie auth unreliable anyway).
  //
  //   EXT_SITE_ORIGIN=https://unclaimedbyai.com npm run extension:build
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
    plugins: [react()],
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

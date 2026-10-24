import { resolve } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// The site origin the panel talks to. All API traffic goes through the
// site's own /api/v1 rewrite, so the production API URL stays deploy
// config and the extension never bakes it into a store listing. The
// bearer API key rides along instead of cookies (cross-site SameSite
// rules make extension cookie auth unreliable anyway).
//
//   EXT_SITE_ORIGIN=https://unclaimedbyai.com npm run extension:build
const SITE = process.env.EXT_SITE_ORIGIN ?? "http://localhost:3000"

const here = import.meta.dirname

export default defineConfig({
  root: here,
  // Relative asset URLs, because extension pages live at
  // chrome-extension://<id>/ — absolute paths would escape the package.
  base: "./",
  define: {
    "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(SITE),
  },
  plugins: [react()],
  resolve: {
    // The whole point of this build: reuse the site's components,
    // sounds and types straight from the repo root.
    alias: { "@": resolve(here, "..") },
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
})

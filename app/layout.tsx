import localFont from "next/font/local"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/app/theme-provider"
import { cn } from "@/lib/utils"
import { JsonLd } from "@/components/app/json-ld"
import { Toaster } from "@/components/ui/sonner"
import Analytics from "@/components/app/analytics"
import CookieBanner from "@/components/app/cookie-banner"
import {
  OG_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteJsonLd,
} from "@/lib/site"
import "./globals.css"

const instrumentSerifHeading = localFont({
  src: "./fonts/instrument-serif.woff2",
  weight: "400",
  variable: "--font-heading",
})

const ibmPlexSans = localFont({
  src: "./fonts/ibm-plex-sans.woff2",
  weight: "100 900",
  variable: "--font-sans",
})

const fontMono = localFont({
  src: "./fonts/geist-mono.woff2",
  weight: "100 900",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [OG_PATH],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_PATH],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "antialiased motion-safe:scroll-smooth",
        fontMono.variable,
        "font-sans",
        ibmPlexSans.variable,
        instrumentSerifHeading.variable
      )}
    >
      <body>
        <Analytics />
        <JsonLd data={siteJsonLd} />
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="bottom-center" />
        <CookieBanner />
      </body>
    </html>
  )
}

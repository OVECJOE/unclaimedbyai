import { Geist_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { JsonLd } from "@/components/json-ld"
import {
  OG_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteJsonLd,
} from "@/lib/site"
import "./globals.css"

const instrumentSerifHeading = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        ibmPlexSans.variable,
        instrumentSerifHeading.variable
      )}
    >
      <body>
        <JsonLd data={siteJsonLd} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

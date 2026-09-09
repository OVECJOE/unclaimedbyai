import { Geist_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google"
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
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
  metadataBase: new URL("https://unclaimedbyai.lol"),
  title: {
    default: "Unclaimed by AI",
    template: "%s · Unclaimed by AI"
  },
  description: "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one.",
  openGraph: {
    title: "Unclaimed by AI",
    description: "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one.",
    url: "https://unclaimedbyai.lol",
    siteName: "Unclaimed by AI",
    type: "website",
    images: ["/og-image.png"]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://unclaimedbyai.lol",
    "name": "Unclaimed by AI",
    "description": "Generate names for your idea. Then check domains, social handles, and AI associations before you build around one.",
  }

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
      <head>
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

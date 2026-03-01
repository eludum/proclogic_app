import { nlBE } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { siteConfig } from "./siteConfig"
import { GoogleAnalyticsWrapper } from "./components/GoogleAnalytics"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Prevent blocking on font load
  preload: true,
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap", // Prevent blocking on font load
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://app.proclogic.be"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["ProcLogic AI", "Public Procurement", "Public Tender", "Publieke Aanbestedingen", "Publieke Aanbestedingen AI"],
  authors: [
    {
      name: "Mehmet Köse",
      url: "www.koselogic.be",
    },
  ],
  creator: "Mehmet Köse",
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/icon.ico",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={nlBE}>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-white-50 h-full antialiased dark:bg-gray-950`}
        >
          <GoogleAnalyticsWrapper />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
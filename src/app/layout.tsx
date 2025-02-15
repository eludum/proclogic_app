import { UserProvider } from '@auth0/nextjs-auth0/client'
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import React from "react"
import "./globals.css"
import { siteConfig } from "./siteConfig"


export const metadata: Metadata = {
  metadataBase: new URL("https://proc.koselogic.be"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [],
  authors: [
    {
      name: "Mehmet Köse",
      url: "koselogic.be",
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
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <UserProvider>
        <body
          className={`${GeistSans.className} overflow-x-hidden overflow-y-scroll scroll-auto bg-gray-50 antialiased selection:bg-blue-100 selection:text-blue-700 dark:bg-gray-950`}
        >
          <ThemeProvider
            defaultTheme="light"
            disableTransitionOnChange
            attribute="class"
          >
            <NuqsAdapter>
              <div>{children}</div>
            </NuqsAdapter>
          </ThemeProvider>
        </body>
      </UserProvider>

    </html>
  )
}

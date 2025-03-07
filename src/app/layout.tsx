import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar"
import { AppSidebar } from "@/components/ui/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs"
import { extractSafeUser } from "@/lib/clerkUserUtils"
import { nlBE } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import { cookies } from "next/headers"
import "./globals.css"
import { siteConfig } from "./siteConfig"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value

  // Fetch user data with a Promise to handle potential delay
  const user = await currentUser();

  // Extract only the safe properties to pass to the client component
  const safeUser = extractSafeUser(user)

  return (
    <ClerkProvider localization={nlBE}>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-white-50 h-full antialiased dark:bg-gray-950`}
        >
          <ThemeProvider
            defaultTheme="light"
            disableTransitionOnChange
            attribute="class"
          >
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar user={safeUser} />
              <div className="w-full">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
                  <SidebarTrigger className="-ml-1" />
                  <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
                  <Breadcrumbs />
                </header>
                <main>{children}</main>
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
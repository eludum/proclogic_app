import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar"
import { AppSidebar } from "@/components/ui/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs"
import { extractSafeUser } from "@/lib/clerkUserUtils"
import { currentUser } from '@clerk/nextjs/server'
import { ThemeProvider } from "next-themes"
import { cookies } from "next/headers"


export default async function FullLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar:state")

  // If cookie doesn't exist, default to true (open)
  // If it exists, check if its value is the string "true"
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  // Fetch user data with a Promise to handle potential delay
  const user = await currentUser();

  // Extract only the safe properties to pass to the client component
  const safeUser = extractSafeUser(user)

  return (
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
  )
}
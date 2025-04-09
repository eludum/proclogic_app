"use client"
// import { useSession } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"
// import { useRouter } from "next/navigation"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // comment if you dont want people to redo onboarding
  // const { session, isLoaded } = useSession()
  // const router = useRouter()

  // If onboarding is already complete, redirect to dashboard
  // useEffect(() => {
  //   if (isLoaded && session?.user?.publicMetadata?.onboardingComplete === true) {
  //     router.refresh();
  //     router.push("/dashboard");
  //   }
  // }, [isLoaded, session, router])

  return (
    <ThemeProvider
      defaultTheme="light"
      disableTransitionOnChange
      attribute="class"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {children}
      </div>
    </ThemeProvider>
  )
}
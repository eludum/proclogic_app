"use client"
import { ThemeProvider } from "next-themes"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // uncomment if you dont want people to redo onboarding
  // const { session, isLoaded } = useSession()
  // const router = useRouter()

  // // If onboarding is already complete, redirect to dashboard
  // useEffect(() => {
  //   if (isLoaded && session?.user?.publicMetadata?.onboardingComplete === true) {
  //     router.push("/dashboard")
  //     router.refresh()
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
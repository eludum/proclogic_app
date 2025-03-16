"use client"
import { siteConfig } from "@/app/siteConfig"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define the onboarding steps
const ONBOARDING_STEPS = [
  { id: "welcome", path: "/onboarding/welcome", title: "Welkom" },
  { id: "company-info", path: "/onboarding/company-info", title: "Bedrijfsinformatie" },
  { id: "sectors", path: "/onboarding/sectors", title: "Sectoren" },
  { id: "regions", path: "/onboarding/regions", title: "Regio's" },
  { id: "complete", path: "/onboarding/complete", title: "Voltooid" },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { getToken } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [onboardingNeeded, setOnboardingNeeded] = useState(true)

  useEffect(() => {
    // Check if onboarding is completed on initial load
    async function checkOnboardingStatus() {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 404) {
          // Company not found, onboarding is needed
          setOnboardingNeeded(true)
          // If not on the welcome page, redirect
          if (pathname !== "/onboarding/welcome") {
            router.push("/onboarding/welcome")
          }
        } else if (response.ok) {
          // Company exists, check if full onboarding is completed
          const data = await response.json()
          const isComplete = Boolean(
            data.name &&
            data.summary_activities &&
            data.interested_sectors?.length > 0 &&
            data.operating_regions?.length > 0
          )

          if (isComplete) {
            // Onboarding is complete, redirect to dashboard
            setOnboardingNeeded(false)
            router.push("/dashboard")
          } else {
            // Partial onboarding, keep in onboarding flow
            setOnboardingNeeded(true)
            // Determine the next incomplete step and redirect if needed
            if (!data.name || !data.summary_activities) {
              if (pathname !== "/onboarding/company-info") {
                router.push("/onboarding/company-info")
              }
            } else if (!data.interested_sectors?.length) {
              if (pathname !== "/onboarding/sectors") {
                router.push("/onboarding/sectors")
              }
            } else if (!data.operating_regions?.length) {
              if (pathname !== "/onboarding/regions") {
                router.push("/onboarding/regions")
              }
            }
          }
        } else {
          // Some other error
          toast({
            title: "Fout",
            description: "Er is een fout opgetreden bij het controleren van uw bedrijfsgegevens.",
            variant: "error",
          })
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het controleren van uw onboarding status.",
          variant: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [pathname, getToken, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader loadingtext="Even geduld..." size={32} />
      </div>
    )
  }

  if (!onboardingNeeded) {
    // This would generally not show as we'd redirect, but good fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader loadingtext="Redirecting to dashboard..." size={32} />
      </div>
    )
  }

  // Get current step index
  const currentStepIndex = ONBOARDING_STEPS.findIndex((step) =>
    pathname.startsWith(step.path)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-4">
              <h2 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {currentStepIndex >= 0 && currentStepIndex < ONBOARDING_STEPS.length
                  ? ONBOARDING_STEPS[currentStepIndex].title
                  : "Onboarding"}
              </h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Stap {currentStepIndex + 1} van {ONBOARDING_STEPS.length}
              </p>
            </div>
            <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-2">
              <div
                className="bg-astral-500 dark:bg-astral-400 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(5, ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100)}%`,
                }}
              ></div>
            </div>

            <div className="w-full max-w-md grid grid-cols-5 gap-2 mt-2">
              {ONBOARDING_STEPS.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${idx < currentStepIndex
                    ? "bg-astral-100 text-astral-600 dark:bg-astral-900/30 dark:text-astral-400 border border-astral-200 dark:border-astral-800"
                    : idx === currentStepIndex
                      ? "bg-astral-500 text-white dark:bg-astral-400 dark:text-slate-900"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    } text-sm font-medium`}>
                    {idx < currentStepIndex ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-gray-400 hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
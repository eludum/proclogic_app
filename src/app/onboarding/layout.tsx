"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth, useSession } from "@clerk/nextjs"
import { ChevronLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define the onboarding steps
const ONBOARDING_STEPS = [
  { id: "welcome", path: "/onboarding/welcome", title: "Welkom" },
  { id: "company-info", path: "/onboarding/company-info", title: "Bedrijfsinformatie" },
  { id: "sectors", path: "/onboarding/sectors", title: "Sectoren" },
  { id: "regions", path: "/onboarding/regions", title: "Regio's" },
  { id: "accreditations", path: "/onboarding/accreditations", title: "Accreditaties" },
  { id: "complete", path: "/onboarding/complete", title: "Voltooid" },
]

// Add the website-parser step specifically for tracking progress
const ALL_STEPS = [
  { id: "welcome", path: "/onboarding/welcome", title: "Welkom" },
  { id: "website-parser", path: "/onboarding/website-parser", title: "Website Analyse" },
  { id: "company-info", path: "/onboarding/company-info", title: "Bedrijfsinformatie" },
  { id: "sectors", path: "/onboarding/sectors", title: "Sectoren" },
  { id: "regions", path: "/onboarding/regions", title: "Regio's" },
  { id: "accreditations", path: "/onboarding/accreditations", title: "Accreditaties" },
  { id: "complete", path: "/onboarding/complete", title: "Voltooid" },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { getToken } = useAuth()
  const { session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  // Get current step and previous step for back button
  const currentStepIndex = ALL_STEPS.findIndex((step) => pathname.startsWith(step.path))
  const previousStep = currentStepIndex > 0 ? ALL_STEPS[currentStepIndex - 1].path : null

  // If we're on website-parser, map to company-info for the progress bar
  // This keeps the steps display consistent while allowing the parser as a special step
  const displayStepIndex = currentStepIndex === 1 ? 1 : currentStepIndex

  useEffect(() => {
    // If onboarding is already complete, redirect to dashboard
    if (session?.user?.publicMetadata?.onboardingComplete === true) {
      router.push("/dashboard")
      return
    }

    // Only run the checks if we're not on the welcome page
    // This allows users to freely access the initial page
    if (pathname === "/onboarding/welcome") {
      setLoading(false)
      return
    }

    // Check current onboarding status on initial load
    async function checkOnboardingStatus() {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(`${siteConfig.api_base_url}/company/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // We'll no longer force redirects here - allow the user to move freely between steps
        setLoading(false)
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het controleren van uw onboarding status.",
          variant: "error",
        })
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [pathname, getToken, router, toast, session])

  // Handle back button navigation
  const handleBack = () => {
    if (previousStep) {
      router.push(previousStep)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader loadingtext="Even geduld..." size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-4 flex items-center justify-between">
              {/* Back button */}
              {previousStep && displayStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-auto flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm">Terug</span>
                </Button>
              )}
              <div className="text-center flex-grow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {currentStepIndex >= 0 ? ALL_STEPS[currentStepIndex].title : "Onboarding"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stap {displayStepIndex + 1} van {ONBOARDING_STEPS.length}
                </p>
              </div>
              <div className="ml-auto w-20">
                {/* This is a spacer to keep the title centered */}
              </div>
            </div>
            <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-2">
              <div
                className="bg-astral-500 dark:bg-astral-400 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(5, ((displayStepIndex + 1) / ONBOARDING_STEPS.length) * 100)}%`,
                }}
              ></div>
            </div>

            {/* Step indicators */}
            <div className="w-full max-w-md grid grid-cols-6 gap-2 mt-2">
              {ONBOARDING_STEPS.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${idx < displayStepIndex
                      ? "bg-astral-100 text-astral-600 dark:bg-astral-900/30 dark:text-astral-400 border border-astral-200 dark:border-astral-800"
                      : idx === displayStepIndex
                        ? "bg-astral-500 text-white dark:bg-astral-400 dark:text-slate-900"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    } text-sm font-medium`}>
                    {idx < displayStepIndex ? (
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
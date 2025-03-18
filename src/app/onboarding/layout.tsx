"use client"
import { useSession } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoaded } = useSession()
  const router = useRouter()

  // If onboarding is already complete, redirect to dashboard
  useEffect(() => {
    if (isLoaded && session?.user?.publicMetadata?.onboardingComplete === true) {
      router.push("/dashboard")
    }
  }, [isLoaded, session, router])

  return <>{children}</>
}

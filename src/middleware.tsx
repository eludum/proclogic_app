import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/search(.*)',
    '/publications/free/detail(.*)'
])

// Define the onboarding flow steps in order
const onboardingSteps = [
    '/onboarding/welcome',
    '/onboarding/website-parser', // AI path
    '/onboarding/company-info',   // Manual path or after AI
    '/onboarding/sectors',
    '/onboarding/regions',
    '/onboarding/complete'
]

// Check if a path is part of the onboarding flow
const isOnboardingRoute = createRouteMatcher(
    onboardingSteps.map(step => step + '(.*)') // Match all paths that start with these steps
)

// Function to determine the available step based on user metadata
function getAvailableStep(metadata) {
    if (!metadata) return 0; // Default to welcome step if no metadata

    if (metadata.hasCompanyInfo && metadata.hasSectors && metadata.hasRegions) {
        return 5; // Complete step
    } else if (metadata.hasCompanyInfo && metadata.hasSectors) {
        return 4; // Regions step
    } else if (metadata.hasCompanyInfo) {
        return 3; // Sectors step
    } else {
        return 1; // First step after welcome (either company-info or website-parser)
    }
}

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth()
    const path = req.nextUrl.pathname

    // Always allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // If no user is logged in and the route is protected, redirect to sign in
    if (!userId && !isPublicRoute(req)) {
        return redirectToSignIn()
    }

    // If user is logged in but onboarding is not complete
    if (userId && !sessionClaims?.metadata?.onboardingComplete) {
        // Check if they are on an onboarding route
        if (isOnboardingRoute(req)) {
            // Find the current step index they're trying to access
            const currentStepIndex = onboardingSteps.findIndex(step => path.startsWith(step))

            // Always allow the welcome step
            if (currentStepIndex === 0) {
                return NextResponse.next()
            }

            // Allow special first step branching - from welcome to either website-parser or company-info
            if ((currentStepIndex === 1 || currentStepIndex === 2) &&
                !sessionClaims?.metadata?.hasCompanyInfo) {
                return NextResponse.next()
            }

            // For later steps, check if they have completed the prerequisites
            const availableStepIndex = getAvailableStep(sessionClaims?.metadata)

            // If they're trying to access a step that's available to them or earlier (except welcome)
            if (currentStepIndex <= availableStepIndex && currentStepIndex > 0) {
                return NextResponse.next()
            }

            // Otherwise, redirect them to the highest step they're allowed to access
            let redirectStep
            if (availableStepIndex <= 0) {
                redirectStep = onboardingSteps[0] // Welcome
            } else {
                redirectStep = onboardingSteps[availableStepIndex]
            }

            const redirectUrl = new URL(redirectStep, req.url)
            return NextResponse.redirect(redirectUrl)
        }

        // If not on an onboarding route, redirect to the appropriate step
        const availableStepIndex = getAvailableStep(sessionClaims?.metadata)
        let redirectStep = onboardingSteps[availableStepIndex > 0 ? availableStepIndex : 0]

        const onboardingUrl = new URL(redirectStep, req.url)
        return NextResponse.redirect(onboardingUrl)
    }

    // If the user has completed onboarding and tries to access onboarding pages
    if (userId && sessionClaims?.metadata?.onboardingComplete && isOnboardingRoute(req)) {
        // Redirect them to dashboard instead
        const dashboardUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(dashboardUrl)
    }

    // For all other cases
    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
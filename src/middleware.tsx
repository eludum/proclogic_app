import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/search(.*)',
    '/publications/free/detail(.*)'
])

// Routes that are part of the onboarding flow
const isOnboardingRoute = createRouteMatcher([
    '/onboarding(.*)'  // This will match all onboarding routes
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth()

    // Always allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && !isPublicRoute(req)) return redirectToSignIn({ returnBackUrl: req.url })

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    if (userId && !sessionClaims?.metadata?.onboardingComplete) {
        // Determine which onboarding step they need
        let redirectPath = '/onboarding/welcome'

        // If they have a company name but no sectors
        if (sessionClaims?.metadata?.hasCompanyInfo && !sessionClaims?.metadata?.hasSectors) {
            redirectPath = '/onboarding/sectors'
        }
        // If they have sectors but no regions
        else if (sessionClaims?.metadata?.hasSectors && !sessionClaims?.metadata?.hasRegions) {
            redirectPath = '/onboarding/regions'
        }

        const onboardingUrl = new URL(redirectPath, req.url)
        return NextResponse.redirect(onboardingUrl)
    }

    // If the user is logged in and the route is protected, let them view.
    if (userId && !isPublicRoute(req)) return NextResponse.next()

})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
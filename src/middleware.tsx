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
    '/onboarding/accreditations', // New step
    '/onboarding/complete'
]

// Check if a path is part of the onboarding flow
const isOnboardingRoute = createRouteMatcher(
    onboardingSteps.map(step => step + '(.*)') // Match all paths that start with these steps
)

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
        // IMPORTANT: Always allow back navigation between onboarding steps
        if (isOnboardingRoute(req)) {
            // This allows users to navigate freely between onboarding steps
            // Actual validation of prerequisites will happen in the page components
            return NextResponse.next()
        }

        // If on any other route, redirect to welcome or the last completed step
        if (!isOnboardingRoute(req)) {
            // Check the metadata to determine the furthest step completed
            if (sessionClaims?.metadata?.hasAccreditations) {
                return NextResponse.redirect(new URL('/onboarding/complete', req.url))
            } else if (sessionClaims?.metadata?.hasRegions) {
                return NextResponse.redirect(new URL('/onboarding/accreditations', req.url))
            } else if (sessionClaims?.metadata?.hasSectors) {
                return NextResponse.redirect(new URL('/onboarding/regions', req.url))
            } else if (sessionClaims?.metadata?.hasCompanyInfo) {
                return NextResponse.redirect(new URL('/onboarding/sectors', req.url))
            } else {
                return NextResponse.redirect(new URL('/onboarding/welcome', req.url))
            }
        }
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
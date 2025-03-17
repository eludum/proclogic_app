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
        // IMPORTANT: Always allow access to the welcome page and the two first steps
        if (path.startsWith('/onboarding/welcome') ||
            path.startsWith('/onboarding/website-parser') ||
            path.startsWith('/onboarding/company-info')) {
            return NextResponse.next()
        }

        // For sectors, require hasCompanyInfo
        if (path.startsWith('/onboarding/sectors')) {
            if (sessionClaims?.metadata?.hasCompanyInfo) {
                return NextResponse.next()
            } else {
                return NextResponse.redirect(new URL('/onboarding/company-info', req.url))
            }
        }

        // For regions, require hasCompanyInfo and hasSectors
        if (path.startsWith('/onboarding/regions')) {
            if (sessionClaims?.metadata?.hasCompanyInfo && sessionClaims?.metadata?.hasSectors) {
                return NextResponse.next()
            } else if (sessionClaims?.metadata?.hasCompanyInfo) {
                return NextResponse.redirect(new URL('/onboarding/sectors', req.url))
            } else {
                return NextResponse.redirect(new URL('/onboarding/company-info', req.url))
            }
        }

        // For complete, require all previous steps
        if (path.startsWith('/onboarding/complete')) {
            if (sessionClaims?.metadata?.hasCompanyInfo &&
                sessionClaims?.metadata?.hasSectors &&
                sessionClaims?.metadata?.hasRegions) {
                return NextResponse.next()
            } else if (sessionClaims?.metadata?.hasCompanyInfo && sessionClaims?.metadata?.hasSectors) {
                return NextResponse.redirect(new URL('/onboarding/regions', req.url))
            } else if (sessionClaims?.metadata?.hasCompanyInfo) {
                return NextResponse.redirect(new URL('/onboarding/sectors', req.url))
            } else {
                return NextResponse.redirect(new URL('/onboarding/company-info', req.url))
            }
        }

        // If on any other route, redirect to welcome
        if (!isOnboardingRoute(req)) {
            return NextResponse.redirect(new URL('/onboarding/welcome', req.url))
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
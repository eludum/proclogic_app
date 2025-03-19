import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isOnboardingRoute = createRouteMatcher(['/onboarding'])
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/search(.*)',
    '/publications/free/detail(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth()

    const clerk = await clerkClient()
    // Update Clerk metadata to mark onboarding as complete
    await clerk.users.updateUser(userId, {
        publicMetadata: {
            onboardingComplete: true
        }
    })

    // Store current path in a cookie for layout detection
    const response = NextResponse.next()
    response.cookies.set('current-path', req.nextUrl.pathname, {
        maxAge: 60 * 5, // 5 minutes
        path: '/'
    });

    // For users visiting /onboarding, don't try to redirect
    if (userId && isOnboardingRoute(req)) {
        return response
    }

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && !isPublicRoute(req)) {
        return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Catch users who do not have `onboardingComplete: true` in their publicMetadata
    // Redirect them to the /onboarding route to complete onboarding
    if (userId && !sessionClaims?.metadata?.onboardingComplete) {
        const onboardingUrl = new URL('/onboarding', req.url)
        return NextResponse.redirect(onboardingUrl)
    }

    // If the user is logged in and the route is protected, let them view
    if (userId && !isPublicRoute(req)) {
        return response
    }

    // Default case - proceed
    return response
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
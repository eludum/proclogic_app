// src/middleware.tsx
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isOnboardingRoute = createRouteMatcher(['/onboarding'])
const isTrialExpiredRoute = createRouteMatcher(['/trial-expired'])
const isSubscriptionRoute = createRouteMatcher(['/subscription', '/pricing'])
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/search(.*)',
    '/publications/free/detail(.*)',
    '/trial-signup',
    '/pricing'
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && !isPublicRoute(req)) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (userId) {
        const metadata = sessionClaims?.metadata || {};

        // Check if onboarding is complete
        if (!metadata.onboardingComplete && !isOnboardingRoute(req)) {
            const onboardingUrl = new URL("/onboarding", req.url);
            return NextResponse.redirect(onboardingUrl);
        }

        // Check trial status for protected routes
        if (metadata.onboardingComplete && !isPublicRoute(req) && !isSubscriptionRoute(req) && !isTrialExpiredRoute(req)) {
            const isTrialAccount = metadata.trialAccount === true;
            const trialEndDate = metadata.trialEndDate;
            const hasPaidSubscription = metadata.paidSubscription === true;

            // If it's a trial account, check if expired
            if (isTrialAccount && !hasPaidSubscription && trialEndDate) {
                const now = new Date();
                const expiry = new Date(trialEndDate);

                if (now > expiry) {
                    // Trial expired - redirect to subscription page
                    const subscriptionUrl = new URL("/trial-expired", req.url);
                    return NextResponse.redirect(subscriptionUrl);
                }
            }

            // If no trial and no paid subscription, require subscription for paid features
            if (!isTrialAccount && !hasPaidSubscription) {
                // Allow access to basic features but redirect paid features to subscription
                const isPaidFeatureRoute = createRouteMatcher([
                    '/publications/(?!free).*', // All publications except free ones
                    '/conversations',
                    '/company/advanced',
                    '/analytics',
                    '/reports'
                ]);

                if (isPaidFeatureRoute(req)) {
                    const subscriptionUrl = new URL("/pricing", req.url);
                    return NextResponse.redirect(subscriptionUrl);
                }
            }
        }
    }

    // Allow access to the route
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
export { }

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            onboardingComplete?: boolean,
            trialAccount?: boolean,
            trialEndDate?: string,
            paidSubscription?: boolean
        }
    }
}
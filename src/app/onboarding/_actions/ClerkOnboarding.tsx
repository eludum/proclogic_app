'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboardingClerk = async () => {
    const { userId } = await auth()

    if (!userId) {
        return { message: 'No Logged In User' }
    }

    const client = await clerkClient()

    try {
        // Get current user to check existing metadata
        const user = await client.users.getUser(userId)
        const currentMetadata = user.publicMetadata || {}

        // Preserve trial information while marking onboarding complete
        const updatedMetadata = {
            ...currentMetadata,
            onboardingComplete: true,
        }

        const res = await client.users.updateUser(userId, {
            publicMetadata: updatedMetadata,
        })

        return {
            message: 'Onboarding completed successfully',
            metadata: res.publicMetadata
        }
    } catch (err) {
        console.error('Error updating user metadata:', err)
        throw new Error("Failed updating the user metadata")
    }
}

export const updateTrialMetadata = async (trialData: {
    trialAccount?: boolean
    trialEndDate?: string
    companyVatNumber?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    paidSubscription?: boolean
}) => {
    const { userId } = await auth()

    if (!userId) {
        return { message: 'No Logged In User' }
    }

    const client = await clerkClient()

    try {
        // Get current user metadata
        const user = await client.users.getUser(userId)
        const currentMetadata = user.publicMetadata || {}

        // Merge trial data with existing metadata
        const updatedMetadata = {
            ...currentMetadata,
            ...trialData,
        }

        const res = await client.users.updateUser(userId, {
            publicMetadata: updatedMetadata,
        })

        return {
            message: 'Trial metadata updated successfully',
            metadata: res.publicMetadata
        }
    } catch (err) {
        console.error('Error updating trial metadata:', err)
        throw new Error("Failed updating trial metadata")
    }
}

export const getTrialMetadata = async () => {
    const { userId } = await auth()

    if (!userId) {
        return { message: 'No Logged In User' }
    }

    const client = await clerkClient()

    try {
        const user = await client.users.getUser(userId)
        const metadata = user.publicMetadata || {}

        return {
            trialAccount: metadata.trialAccount || false,
            trialEndDate: metadata.trialEndDate || null,
            companyVatNumber: metadata.companyVatNumber || null,
            paidSubscription: metadata.paidSubscription || false,
            stripeCustomerId: metadata.stripeCustomerId || null,
            stripeSubscriptionId: metadata.stripeSubscriptionId || null,
        }
    } catch (err) {
        console.error('Error getting trial metadata:', err)
        throw new Error("Failed getting trial metadata")
    }
}
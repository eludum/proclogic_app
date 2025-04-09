'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboardingClerk = async () => {
    const { userId } = await auth()

    if (!userId) {
        return { message: 'No Logged In User' }
    }

    const client = await clerkClient()

    try {
        const res = await client.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true,
            },
        })
        return { message: res.publicMetadata }
    } catch (err) {
        throw new Error("Failed updating the user metadata");
    }
}

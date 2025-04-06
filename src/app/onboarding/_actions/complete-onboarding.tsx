'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { cookies } from "next/headers"

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
        return { error: 'There was an error updating the user metadata.' }
    }
}

export const setCookiePath = async () => {
    const cookieStore = await cookies()
    cookieStore.set('current-path', '/dashboard')
}

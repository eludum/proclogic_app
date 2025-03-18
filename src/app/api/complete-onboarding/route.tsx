import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST() {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const clerk = await clerkClient()
        // Update Clerk metadata to mark onboarding as complete
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error completing onboarding:", error)
        return NextResponse.json(
            { error: "Failed to complete onboarding" },
            { status: 500 }
        )
    }
}
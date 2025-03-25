import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";

export async function POST() {
  // Get authentication information
  const { userId } = await auth();
  const client = await clerkClient()

  // If no user is authenticated, return unauthorized
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // Update the user's metadata on the server side
    await client.users.updateUser(userId, {
        publicMetadata: {
          onboardingComplete: true,
        },
      })

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
    
    return new NextResponse(
      JSON.stringify({
        error: "Failed to update metadata",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
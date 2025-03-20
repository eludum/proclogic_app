"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import ConversationsList from "./_components/ConversationsList";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Conversations() {
    const { getToken } = await auth();
    const token = await getToken();

    // Fetch publications using authenticated endpoint
    let publications = [];
    let fetchError = null;

    try {
        const response = await fetch(`${API_BASE_URL}/publications/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        publications = await response.json();
    } catch (error) {
        if (error instanceof Error) {
            fetchError = error.message;
        } else {
            fetchError = "An unknown error occurred";
        }
        console.error("Error fetching publications:", error);
    }

    return (
        <section aria-label="AI Conversations Overview" className="max-w-6xl mx-auto">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gesprekken met Procy</h1>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                        Bekijk uw eerdere gesprekken met Procy en ga verder waar u gebleven was
                    </p>
                </div>
            </div>

            <div className="px-4 sm:px-6">
                <ConversationsList />
            </div>
        </section>
    );
}
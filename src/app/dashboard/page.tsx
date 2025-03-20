"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import InboxList from "./_components/Dashboard";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Inbox() {
    const { getToken } = await auth();

    // Fetch notifications using authenticated endpoint
    let notificationsData = {
        items: [],
        total: 0,
        unread: 0
    };
    let fetchError = null;

    try {
        const token = await getToken();

        // Use notifications endpoint instead of messages
        const response = await fetch(`${API_BASE_URL}/notifications/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure we get fresh data
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        notificationsData = await response.json();
    } catch (error) {
        if (error instanceof Error) {
            fetchError = error.message;
        } else {
            fetchError = "An unknown error occurred";
        }
        console.error("Error fetching notifications:", error);
    }

    return (
        <section aria-label="Inbox Notifications">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                        {notificationsData.unread > 0 && (
                            <span className="bg-astral-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {notificationsData.unread} nieuwe berichten
                            </span>
                        )}
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                        Bekijk uw berichten, waarschuwingen en aanbevelingen
                    </p>
                </div>
            </div>

            <div className="px-4 sm:px-6">
                <InboxList
                    initialNotifications={notificationsData.items}
                    fetchError={fetchError}
                />
            </div>
        </section>
    );
}
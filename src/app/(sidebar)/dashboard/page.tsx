"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import InboxList from "./_components/Dashboard";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Inbox() {
    // Extract query parameters with defaults
    const page = 1;
    const pageSize = 10; // Default items per page
    
    // Calculate offset based on page number
    const offset = (page - 1) * pageSize;
    
    // Limit should never exceed 100 (backend maximum)
    const limit = Math.min(pageSize, 100);
    const params = new URLSearchParams();

    // Add pagination parameters
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    

    const { getToken } = await auth();

    // Fetch notifications using authenticated endpoint with limit and offset
    let notificationsData = {
        items: [],
        total: 0,
        unread: 0
    };
    
    // Fetch notification counts
    let notificationCounts = {
        total: 0,
        unread: 0,
        categories: {
            recommendation: 0,
            deadline: 0,
            system: 0,
            forum: 0,
            account: 0
        },
        unread_categories: {
            recommendation: 0,
            deadline: 0,
            system: 0,
            forum: 0,
            account: 0
        }
    };
    
    let fetchError = null;

    try {
        const token = await getToken();

        // Create a combined endpoint to fetch both notifications and counts in one request
        const combinedEndpoint = `${API_BASE_URL}/notifications/combined?${params.toString()}`;
        
        const combinedResponse = await fetch(combinedEndpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure we get fresh data
        });

        if (!combinedResponse.ok) {
            throw new Error(`API error: ${combinedResponse.status}`);
        }

        const combinedData = await combinedResponse.json();
        notificationsData = combinedData.notifications;
        notificationCounts = combinedData.counts;
        
    } catch (error) {
        if (error instanceof Error) {
            fetchError = error.message;
        } else {
            fetchError = "An unknown error occurred";
        }
        console.error("Error fetching notifications:", error);
    }

    // Calculate total pages based on total items and page size
    const totalPages = Math.ceil(notificationsData.total / pageSize) || 1;

    return (
        <section aria-label="Inbox Notifications">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                        {notificationCounts.unread > 0 && (
                            <span className="bg-astral-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {notificationCounts.unread} nieuwe berichten
                            </span>
                        )}
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                        Bekijk en beheer je berichten, meldingen en gepersonaliseerde aanbevelingen om altijd op de hoogte te blijven.
                    </p>
                </div>
            </div>

            <div className="px-4 sm:px-6">
                <InboxList
                    initialNotifications={notificationsData.items}
                    fetchError={fetchError}
                    totalNotifications={notificationCounts.total}
                    unreadNotifications={notificationCounts.unread}
                    currentPage={page}
                    totalPages={totalPages}
                />
            </div>
        </section>
    );
}
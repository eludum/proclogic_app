"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import InboxList from "./_components/Dashboard";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Inbox() {
    const { getToken } = await auth();

    // Fetch messages using authenticated endpoint
    let messagesData = {
        items: [],
        total: 0,
        unread: 0
    };
    let fetchError = null;

    try {
        const token = await getToken();

        // This endpoint would need to be implemented in the backend
        const response = await fetch(`${API_BASE_URL}/messages/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure we get fresh data
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        messagesData = await response.json();
    } catch (error) {
        fetchError = error.message;
        console.error("Error fetching messages:", error);

        // For testing/demo purposes, create sample data
        messagesData = {
            items: [
                {
                    id: "msg1",
                    title: "Nieuwe aanbevolen aanbesteding",
                    content: "Er is een nieuwe aanbesteding die mogelijk interessant is voor uw bedrijf.",
                    created_at: new Date().toISOString(),
                    is_read: false,
                    type: "recommendation",
                    link: "/publications/detail/pub123",
                    related_entity_id: "pub123"
                },
                {
                    id: "msg2",
                    title: "Deadline nadert voor aanbesteding #45789",
                    content: "De deadline voor het indienen van uw offerte nadert. U heeft nog 3 dagen om te reageren.",
                    created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
                    is_read: true,
                    type: "deadline",
                    link: "/publications/detail/pub456",
                    related_entity_id: "pub456"
                },
                {
                    id: "msg3",
                    title: "Systeemupdate - Nieuwe functies beschikbaar",
                    content: "We hebben nieuwe functies toegevoegd aan het ProcLogic platform. Bekijk het laatste nieuws over onze verbeteringen.",
                    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    is_read: false,
                    type: "system",
                    link: "/news",
                    related_entity_id: null
                },
                {
                    id: "msg4",
                    title: "Nieuwe reactie in forum over aanbesteding #67890",
                    content: "Er is een nieuwe reactie geplaatst in het forum over een aanbesteding die u volgt.",
                    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                    is_read: true,
                    type: "forum",
                    link: "/forum/thread789",
                    related_entity_id: "thread789"
                },
                {
                    id: "msg5",
                    title: "Abonnement verloopt binnenkort",
                    content: "Uw ProcLogic-abonnement verloopt over 14 dagen. Verleng nu om ononderbroken toegang te behouden.",
                    created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                    is_read: false,
                    type: "account",
                    link: "/account/subscription",
                    related_entity_id: null
                },
            ],
            total: 5,
            unread: 3
        };
    }

    return (
        <section aria-label="Inbox Messages">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
                        {messagesData.unread > 0 && (
                            <span className="bg-astral-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {messagesData.unread} nieuwe berichten
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
                    initialMessages={messagesData.items}
                    fetchError={fetchError}
                />
            </div>
        </section>
    );
}
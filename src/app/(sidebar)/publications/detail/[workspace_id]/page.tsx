"use server"

import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import PublicationDetail, { Publication } from "../../_components/PublicationDetail";

const API_BASE_URL = siteConfig.api_base_url;

interface PageProps {
    params: Promise<{
        workspace_id: string;
    }>
}

// Match the exact type expected by the client component
type TimelineEventStatus = 'completed' | 'in-progress' | 'pending';
type TimelineEventIcon = 'calendar' | 'file' | 'clock' | 'check-circle';

interface TimelineEvent {
    date: Date | string;
    title: string;
    description: string;
    status: TimelineEventStatus;
    icon: TimelineEventIcon;
}

export default async function PublicationDetailPage({ params }: PageProps) {
    const { workspace_id: workspaceId } = await params;

    const { getToken } = await auth()

    // Fetch publication details
    let publication: Publication | null = null;
    let fetchError: string | null = null;

    try {
        const token = await getToken();
        // TODO: mark publication as viewed
        const response = await fetch(`${API_BASE_URL}/publications/publication/${workspaceId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        publication = await response.json();
    } catch (error) {
        if (error instanceof Error) {
            fetchError = error.message;
        } else {
            fetchError = String(error);
        }
        console.error("Error fetching publication:", error);
    }

    if (fetchError) {
        return (
            <section aria-label="Publication Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbesteding Details</h1>
                        <p className="text-sm text-red-500">Error: {fetchError}</p>
                    </div>
                </div>
            </section>
        );
    }

    // Generate timeline events based on publication data
    const generateTimelineEvents = (pub: Publication): TimelineEvent[] => {
        if (!pub) return [];

        const events: TimelineEvent[] = [];

        if (pub.dispatch_date) {
            events.push({
                date: new Date(pub.dispatch_date),
                title: "Publicatie verzonden",
                description: "Aanbesteding officieel verzonden",
                status: "completed",
                icon: "calendar"
            });
        }

        if (pub.publication_date) {
            events.push({
                date: new Date(pub.publication_date),
                title: "Gepubliceerd",
                description: "Aanbesteding officieel gepubliceerd",
                status: "completed",
                icon: "file"
            });
        }

        // Add current date as a milestone
        const now = new Date();
        events.push({
            date: now,
            title: "Vandaag",
            description: "Huidige datum",
            status: "in-progress",
            icon: "clock"
        });

        if (pub.submission_deadline) {
            const deadlineDate = new Date(pub.submission_deadline);
            // Define status based on date comparison, ensuring it's a valid TimelineEventStatus
            const status: TimelineEventStatus = now > deadlineDate ? "completed" : "pending";

            events.push({
                date: deadlineDate,
                title: "Deadline voor indiening",
                description: "Uiterste datum voor het indienen van de aanbieding",
                status: status,
                icon: "check-circle"
            });
        }

        // Sort events by date
        return events.sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
            const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
            return dateA - dateB;
        });
    };

    // Pass pre-fetched data to the client component
    return <PublicationDetail
        publication={publication}
        timelineEvents={publication ? generateTimelineEvents(publication) : []}
    />;
}
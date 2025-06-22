// app/publications/free/detail/[workspace_id]/page.tsx
import { siteConfig } from "@/app/siteConfig";
import { ErrorState } from "@/components/ErrorState";
import FreePublicationDetail, { Publication } from "../../../_components/FreePublicationDetail";

const API_BASE_URL = siteConfig.api_base_url;

interface PageProps {
    params: Promise<{
        workspace_id: string;
    }>
}

// Define the timeline event types to match what the component expects
type TimelineEventStatus = 'completed' | 'in-progress' | 'pending';
type TimelineEventIcon = 'calendar' | 'file' | 'clock' | 'check-circle';

interface TimelineEvent {
    date: string | Date;
    title: string;
    description: string;
    status: TimelineEventStatus;
    icon: TimelineEventIcon;
}

export default async function FreePublicationDetailPage({ params }: PageProps) {
    const { workspace_id: workspaceId } = await params;

    // Fetch publication details without auth token
    let publication: Publication | null = null;
    let fetchError: string | null = null;

    try {
        const response = await fetch(`${API_BASE_URL}/publications/free/publication/${workspaceId}/`);
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
        console.error("Error fetching free publication:", error);
    }

    if (fetchError) {
        return (
            <section aria-label="Publication Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbesteding Details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Details van de geselecteerde aanbesteding.</p>
                    </div>
                </div>
                <div className="px-4 sm:px-6 pb-6">
                    <ErrorState onRetry={() => window.location.reload()} />
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
                date: new Date(pub.dispatch_date).toISOString(),
                title: "Publicatie verzonden",
                description: "Aanbesteding officieel verzonden",
                status: "completed",
                icon: "calendar"
            });
        }

        if (pub.publication_date) {
            events.push({
                date: new Date(pub.publication_date).toISOString(),
                title: "Gepubliceerd",
                description: "Aanbesteding officieel gepubliceerd",
                status: "completed",
                icon: "file"
            });
        }

        // Add current date as a milestone
        const now = new Date().toISOString();
        events.push({
            date: now,
            title: "Vandaag",
            description: "Huidige datum",
            status: "in-progress",
            icon: "clock"
        });

        if (pub.submission_deadline) {
            const deadlineDate = new Date(pub.submission_deadline).toISOString();
            // Use a valid status from the TimelineEventStatus type
            const status: TimelineEventStatus = new Date(now) > new Date(deadlineDate) ? "completed" : "pending";

            events.push({
                date: deadlineDate,
                title: "Deadline voor indiening",
                description: "Uiterste datum voor het indienen van de aanbieding",
                status: status,
                icon: "check-circle"
            });
        }

        // Sort events by date
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Pass pre-fetched data to the client component
    return <FreePublicationDetail
        publication={publication}
        timelineEvents={publication ? generateTimelineEvents(publication) : []}
    />;
}
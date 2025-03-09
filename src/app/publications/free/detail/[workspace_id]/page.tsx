// app/publications/free/detail/[workspace_id]/page.tsx
import { siteConfig } from "@/app/siteConfig";
import FreePublicationDetail from "../../../_components/FreePublicationDetail";

const API_BASE_URL = siteConfig.api_base_url;

interface Params {
    workspace_id: string;
}

export default async function FreePublicationDetailPage({ params }: { params: Params }) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams.workspace_id;

    // Fetch publication details without auth token
    let publication = null;
    let fetchError = null;

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
                        <p className="text-sm text-red-500">Error: {fetchError}</p>
                    </div>
                </div>
            </section>
        );
    }

    // Generate timeline events based on publication data
    const generateTimelineEvents = (publication: { dispatch_date: string | number | Date; publication_date: string | number | Date; submission_deadline: string | number | Date; }) => {
        if (!publication) return [];

        const events = [];

        if (publication.dispatch_date) {
            events.push({
                date: new Date(publication.dispatch_date),
                title: "Publicatie verzonden",
                description: "Aanbesteding officieel verzonden",
                status: "completed",
                icon: "calendar"
            });
        }

        if (publication.publication_date) {
            events.push({
                date: new Date(publication.publication_date),
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

        if (publication.submission_deadline) {
            const deadlineDate = new Date(publication.submission_deadline);
            const status = now > deadlineDate ? "completed" : "upcoming";

            events.push({
                date: deadlineDate,
                title: "Deadline voor indiening",
                description: "Uiterste datum voor het indienen van de aanbieding",
                status: status,
                icon: "check-circle"
            });
        }

        // Sort events by date
        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    // Pass pre-fetched data to the client component
    return <FreePublicationDetail
        publication={publication}
        timelineEvents={publication ? generateTimelineEvents(publication) : []}
    />;
}
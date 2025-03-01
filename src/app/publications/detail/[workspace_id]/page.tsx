// app/publications/detail/[workspace_id]/page.jsx
import { siteConfig } from "@/app/siteConfig";
import { getCompanyData } from "@/lib/userUtils";
import { currentUser } from '@clerk/nextjs/server';
import PublicationDetail from "../../_components/PublicationDetail";

const API_BASE_URL = siteConfig.api_base_url;

export default async function PublicationDetailPage({ params }) {
    const workspaceId = params.workspace_id;
    const user = await currentUser();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-60 p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Niet ingelogd</h2>
                <p className="text-gray-600 dark:text-gray-400">Log in om aanbestedingen te bekijken</p>
            </div>
        );
    }

    // Get company data
    const { company, error } = await getCompanyData(user);

    if (error) {
        console.error("Error loading company data:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-60 p-6">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Fout bij laden</h2>
                <p className="text-gray-600 dark:text-gray-400">Er is een probleem opgetreden bij het laden van bedrijfsgegevens</p>
            </div>
        );
    }

    // Fetch publication details
    let publication = null;
    let fetchError = null;

    try {
        if (company) {
            const response = await fetch(`${API_BASE_URL}/publications/${company.email}/publication/${workspaceId}/`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            publication = await response.json();
        }
    } catch (error) {
        fetchError = error.message;
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
    const generateTimelineEvents = (publication) => {
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
    return <PublicationDetail
        publication={publication}
        timelineEvents={publication ? generateTimelineEvents(publication) : []}
        company={company}
    />;
}
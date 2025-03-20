"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import PublicationList from "../publications/_components/PublicationList";

const API_BASE_URL = siteConfig.api_base_url;

export default async function SavedPublications() {
    const { getToken } = await auth();

    // Fetch saved publications using authenticated endpoint
    let publicationsData = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0
    };
    let fetchError = null;

    try {
        const token = await getToken();

        // For saved page, we want saved=true by default
        const response = await fetch(`${API_BASE_URL}/publications/?page=1&size=10&saved=true&active=true`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure we get fresh data
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        publicationsData = await response.json();
    } catch (error) {
        fetchError = error instanceof Error ? error.message : String(error);
        console.error("Error fetching saved publications:", error);
    }

    return (
        <section aria-label="Saved Publications">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Overzicht van alle opgeslagen publieke aanbestedingen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bekijk hieronder de publieke aanbestedingen die je hebt .</p>
                </div>
            </div>

            <div className="w-full">
                {fetchError ? (
                    <div className="p-6 text-center">
                        <p>Fout bij het laden van opgeslagen aanbestedingen: {fetchError}</p>
                        <form action="/publications/saved">
                            <button
                                type="submit"
                                className="mt-4 px-4 py-2 bg-astral-500 text-white rounded-md hover:bg-astral-600 transition-colors"
                            >
                                Probeer opnieuw
                            </button>
                        </form>
                    </div>
                ) : publicationsData.items.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm my-4 mx-6">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Geen opgeslagen aanbestedingen</h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-4">
                                Je hebt nog geen aanbestedingen opgeslagen. Bekijk de aanbevolen aanbestedingen en sla interessante kansen op.
                            </p>
                            <a href="/publications" className="px-4 py-2 bg-astral-600 text-white rounded-md hover:bg-astral-700 transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Bekijk aanbevolen aanbestedingen
                            </a>
                        </div>
                    </div>
                ) : (

                    <div className="p-4">
                        <PublicationList
                            initialPublications={publicationsData}
                            isSavedPage={true}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
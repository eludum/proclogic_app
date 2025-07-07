import { siteConfig } from "@/app/siteConfig";
import { auth, currentUser } from '@clerk/nextjs/server';
import { Suspense } from "react";
import FreePublicationList from "../publications/_components/FreePublicationList";
import PublicationList from "../publications/_components/PublicationList";
import { PublicationSkeleton } from "../publications/_components/PublicationSkeleton";

const API_BASE_URL = siteConfig.api_base_url;

// Fast-loading skeleton that shows immediately
function SearchPageSkeleton() {
    return (
        <section aria-label="Publications Search">
            {/* Premium Banner Skeleton */}
            <div className="mt-5 mx-4 sm:mx-6 mb-6 p-4 bg-gradient-to-r from-astral-50 to-astral-100 dark:from-astral-900/30 dark:to-astral-800/30 rounded-lg border border-astral-200 dark:border-astral-800 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                    </div>
                    <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="mx-4 sm:mx-6">
                <PublicationSkeleton count={8} />
            </div>
        </section>
    );
}

// Async component that loads data
async function SearchContent() {
    const user = await currentUser();
    const { getToken } = await auth();
    const isLoggedIn = !!user;

    // Fetch publications - different endpoints for logged in vs anonymous
    let publicationsData = {
        items: [],
        page: 1,
        size: 10,
        total: 0,
        pages: 0
    };
    let fetchError = null;

    try {
        if (isLoggedIn) {
            // For logged in users with proper authentication
            const token = await getToken();
            const apiUrl = `${API_BASE_URL}/publications/?page=${publicationsData.page}&size=${publicationsData.size}&active=true`;

            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            publicationsData = await response.json();
        } else {
            // For anonymous users
            let apiUrl = `${API_BASE_URL}/publications/free/search/?page=${publicationsData.page}&size=${publicationsData.size}`;

            const response = await fetch(apiUrl, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            publicationsData = await response.json();
        }
    } catch (error) {
        if (error instanceof Error) {
            fetchError = error.message;
        } else {
            fetchError = "An unknown error occurred";
        }
        console.error("Error fetching publications:", error);
    }

    return (
        <section aria-label="Publications Search">
            {/* Premium Banner - only show for non-logged in users */}
            {!isLoggedIn && (
                <div className="mt-5 mx-4 sm:mx-6 mb-6 p-4 bg-gradient-to-r from-astral-50 to-astral-100 dark:from-astral-900/30 dark:to-astral-800/30 rounded-lg border border-astral-200 dark:border-astral-800 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-astral-800 dark:text-astral-300 mb-1">
                                Maak een account aan
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Registreer voor toegang tot uitgebreide zoekmogelijkheden, AI-aanbevelingen en meer.
                            </p>
                        </div>
                        <a
                            href="/sign-up"
                            className="inline-flex items-center px-4 py-2 bg-astral-600 text-white text-sm font-medium rounded-md hover:bg-astral-700 transition-colors"
                        >
                            Gratis account aanmaken
                        </a>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="mx-4 sm:mx-6">
                {fetchError ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-red-600 dark:text-red-400 mb-2">Fout bij ophalen van aanbestedingen</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{fetchError}</p>
                    </div>
                ) : isLoggedIn ? (
                    <PublicationList
                        initialPublications={publicationsData}
                        isSearchPage={true}
                    />
                ) : (
                    <FreePublicationList
                        initialPublications={publicationsData}
                    />
                )}
            </div>
        </section>
    );
}

// Main page component using Suspense for immediate loading
export default function PublicSearch() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchContent />
        </Suspense>
    );
}
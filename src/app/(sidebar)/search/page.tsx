import { siteConfig } from "@/app/siteConfig";
import { auth, currentUser } from '@clerk/nextjs/server';
import { Suspense } from "react";
import ClosableBanner from "../publications/_components/Banner";
import FreePublicationList from "../publications/_components/FreePublicationList";
import PublicationList from "../publications/_components/PublicationList";
import { PublicationSkeleton } from "../publications/_components/PublicationSkeleton";

const API_BASE_URL = siteConfig.api_base_url;

// Fast-loading skeleton that shows immediately
function SearchPageSkeleton() {
    return (
        <section aria-label="Publications Search">
            {/* Main content skeleton */}
            <div className="mt-5 mx-4 sm:mx-6 animate-pulse">
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
                <ClosableBanner />
            )}

            {/* Main content */}
            <div className="mt-5 mx-4 sm:mx-6">
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
                    <div>
                        <FreePublicationList
                            initialPublications={publicationsData}
                        />
                    </div>
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
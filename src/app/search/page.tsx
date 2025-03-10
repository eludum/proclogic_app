"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth, currentUser } from '@clerk/nextjs/server';
import FreePublicationList from "../publications/_components/FreePublicationList";
import PublicationList from "../publications/_components/PublicationList";
import Search from "../publications/_components/Search";

const API_BASE_URL = siteConfig.api_base_url;

export default async function PublicSearch({ searchParams }) {
    const user = await currentUser();
    const { getToken } = await auth();
    const isLoggedIn = !!user;

    // Get search term, filters, and pagination params from URL parameters
    const searchTerm = searchParams.q || "";
    const sector = searchParams.sector || "";
    const region = searchParams.region || "";
    const date = searchParams.date || "";
    const cpvCode = searchParams.cpv_code || "";
    const page = parseInt(searchParams.page || "1", 10);
    const size = parseInt(searchParams.size || "10", 10);

    // Fetch publications - different endpoints for logged in vs anonymous
    let publicationsData = {
        items: [],
        page: page,
        size: size,
        total: 0,
        pages: 0
    };
    let fetchError = null;

    try {
        // Determine API endpoint based on user status
        let apiUrl = `${API_BASE_URL}/publications/free/search/`;
        let headers = {};
        let queryParams = new URLSearchParams();

        // Add search term if present
        if (searchTerm) queryParams.append("q", searchTerm);

        // Add filters if they exist
        if (sector) queryParams.append("sector", sector);
        if (region) queryParams.append("region", region);

        // Add pagination parameters
        queryParams.append("page", page.toString());
        queryParams.append("size", size.toString());

        // Add the query parameters to the URL
        if (queryParams.toString()) {
            apiUrl += `?${queryParams.toString()}`;
        }

        if (isLoggedIn) {
            // For logged in users with proper authentication
            const token = await getToken();
            apiUrl = `${API_BASE_URL}/publications/search/`;

            // Add premium filters if logged in
            if (date) queryParams.append("date", date);
            if (cpvCode) queryParams.append("cpv_code", cpvCode);

            // Update URL with all parameters
            if (queryParams.toString()) {
                apiUrl += `?${queryParams.toString()}`;
            }

            headers = {
                Authorization: `Bearer ${token}`,
            };
        }

        const response = await fetch(apiUrl, {
            headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        publicationsData = await response.json();
    } catch (error) {
        fetchError = error.message;
        console.error("Error fetching publications:", error);
    }

    return (
        <section aria-label="Publications Search">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbestedingen Zoeken</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vind relevante aanbestedingsmogelijkheden voor uw bedrijf</p>
                </div>
            </div>

            {/* Search Component */}
            <Search
                isPremium={isLoggedIn}
                initialSearchParams={searchParams}
            />

            {/* Premium Banner - only show for non-logged in users */}
            {!isLoggedIn && (
                <div className="mx-4 sm:mx-6 mb-6 p-4 bg-gradient-to-r from-astral-50 to-astral-100 dark:from-astral-900/30 dark:to-astral-800/30 rounded-lg border border-astral-200 dark:border-astral-800 shadow-xs">
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
                            href="/register"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-astral-600 hover:bg-astral-700 transition-colors duration-200"
                        >
                            Registreren
                        </a>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-800 w-full">
                {fetchError ? (
                    <div className="p-6 text-center">
                        <p className="text-red-500">Fout bij het laden van aanbestedingen: {fetchError}</p>
                    </div>
                ) : publicationsData.items.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Geen aanbestedingen gevonden</p>
                    </div>
                ) : (
                    <div className="p-4">
                        {isLoggedIn ? (
                            // Logged-in users see the full PublicationList with all features
                            <PublicationList
                                initialPublications={publicationsData}
                            />
                        ) : (
                            // Non-logged in users see the limited PublicationList
                            <FreePublicationList
                                publications={publicationsData}
                                isLoggedIn={isLoggedIn}
                            />
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
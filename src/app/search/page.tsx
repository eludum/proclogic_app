"use server"
import { siteConfig } from "@/app/siteConfig";
import { Table, TableBody, TableCell, TableRoot, TableRow } from "@/components/Table";
import { getCompanyData } from "@/lib/userUtils";
import { currentUser } from '@clerk/nextjs/server';
import FreePublicationList from "../publications/_components/FreePublicationList";
import SearchComponent from "../publications/_components/Search";


const API_BASE_URL = siteConfig.api_base_url;

export default async function PublicSearch() {
    const user = await currentUser();
    let company = null;
    let isLoggedIn = false;
    let isPremium = false;

    // Check if user is logged in and get company data if available
    if (user) {
        isLoggedIn = true;
        const companyData = await getCompanyData(user);
        if (!companyData.error && companyData.company) {
            company = companyData.company;
            isPremium = company.license === 'premium';
        }
    }

    // Fetch publications - different endpoints for logged in vs anonymous
    let publications = [];
    let fetchError = null;

    try {
        // Different API endpoints based on user status
        let apiUrl = `${API_BASE_URL}/publications/public`;

        if (isLoggedIn && company) {
            // For logged in users, we can personalize results
            apiUrl = isPremium
                ? `${API_BASE_URL}/publications/search/${company.vat_number}/`
                : `${API_BASE_URL}/publications/search/free/${company.vat_number}/`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        console.log(apiUrl);

        publications = await response.json();
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
            <SearchComponent isPremium={isPremium} />

            {/* Premium Banner - only show for non-premium users */}
            {!isPremium && (
                <div className="mx-4 sm:mx-6 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                {isLoggedIn ? "Upgrade naar Premium" : "Maak een account aan"}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {isLoggedIn
                                    ? "Krijg toegang tot AI-aanbevelingen, uitgebreide zoekopties, en gepersonaliseerde inzichten."
                                    : "Registreer voor gratis toegang tot basis aanbestedingen. Premium gebruikers krijgen AI-aanbevelingen en meer."}
                            </p>
                        </div>
                        <a
                            href={isLoggedIn ? "/pricing" : "/register"}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                            {isLoggedIn ? "Meer informatie" : "Registreren"}
                        </a>
                    </div>
                </div>
            )}

            <TableRoot className="border-t border-gray-200 dark:border-gray-800 w-full">
                <Table>
                    <TableBody>
                        {fetchError ? (
                            <TableRow>
                                <TableCell>
                                    <div className="p-6 text-center">
                                        <p className="text-red-500">Error loading publications: {fetchError}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : publications.length === 0 ? (
                            <TableRow>
                                <TableCell>
                                    <div className="p-6 text-center">
                                        <p className="text-gray-500">Geen aanbestedingen gevonden</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <FreePublicationList
                                publications={publications}
                                isLoggedIn={isLoggedIn}
                                isPremium={isPremium}
                                company={company}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableRoot>
        </section>
    );
}
"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import PublicationList from "../_components/PublicationList";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Overview() {
    const { getToken } = await auth()


    // Fetch publications using authenticated endpoint
    let publications = [];
    let fetchError = null;
    let token = null;

    try {
        const token = await getToken();

        const response = await fetch(`${API_BASE_URL}/publications/saved/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        publications = await response.json();
    } catch (error) {
        fetchError = error.message;
        console.error("Error fetching publications:", error);
    }

    if (fetchError) {
        return (
            <section aria-label="Publications Overview">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Opgeslagen aanbestedingen</h1>
                        <p className="text-sm text-red-500">Error: {fetchError}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section aria-label="Publications Overview">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Opgeslagen aanbestedingen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bekijk de opgeslagen aanbestedingen</p>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 w-full">
                {fetchError ? (
                    <div className="p-6 text-center">
                        <p className="text-red-500">Fout bij het laden van publicaties: {fetchError}</p>
                    </div>
                ) : publications.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Geen aanbestedingen gevonden</p>
                    </div>
                ) : (
                    <div className="p-4">
                        <PublicationList publications={publications} initialToken={token} />
                    </div>
                )}
            </div>
        </section>
    );
}
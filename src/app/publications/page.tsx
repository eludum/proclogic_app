"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import { Sparkles } from "lucide-react";
import PublicationList from "./_components/PublicationList";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Publications() {
  const { getToken } = await auth();

  // Fetch publications using authenticated endpoint
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

    // For overview page, we want recommended=true by default
    const response = await fetch(`${API_BASE_URL}/publications/?page=${publicationsData.page}&size=${publicationsData.size}&recommended=true&active=true`, {
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
    console.error("Error fetching publications:", error);
  }

  return (
    <section aria-label="Publications">
      <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Overzicht aanbevolen aanbestedingen</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ontdek hieronder de publieke aanbestedingen die Procy speciaal voor je bedrijf heeft geselecteerd op basis van je behoeften.</p>
        </div>
      </div>

      <div className="w-full">
        {fetchError ? (
          <div className="p-6 text-center">
            <p>Er is een fout opgetreden bij het laden van de aanbestedingen {fetchError}</p>
            <form action="/publications">
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-astral-500 text-white rounded-md hover:bg-astral-600 transition-colors"
              >
                Probeer het later opnieuw
              </button>
            </form>
          </div>
        ) : publicationsData.items.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm my-4 mx-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-astral-100 dark:bg-astral-900/30">
                <Sparkles className="w-8 h-8 text-astral-600 dark:text-astral-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Geen aanbevolen aanbestedingen</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mb-4">
                Momenteel zijn er geen aanbevolen publieke aanbestedingen die bij je bedrijf passen.
              </p>
              <a href="/publications/search" className="px-4 py-2 bg-astral-600 text-white rounded-md hover:bg-astral-700 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Zoek alle aanbestedingen
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <PublicationList
              initialPublications={publicationsData}
              isOverviewPage={true}
            />
          </div>
        )}
      </div>
    </section>
  );
}
"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
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
    const response = await fetch(`${API_BASE_URL}/publications/?page=1&size=10&recommended=true&active=true`, {
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
    fetchError = error.message;
    console.error("Error fetching publications:", error);
  }

  return (
    <section aria-label="Publications">
      <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbestedingen Overzicht</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bekijk aanbevolen aanbestedingen voor uw bedrijf</p>
        </div>
      </div>

      <div className="w-full">
        {fetchError ? (
          <div className="p-6 text-center">
            <p>Fout bij het laden van aanbestedingen: {fetchError}</p>
            <form action="/publications">
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Probeer opnieuw
              </button>
            </form>
          </div>
        ) : publicationsData.items.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-gray-600 dark:text-gray-300 mb-3">Geen aanbevolen aanbestedingen gevonden</p>
            <a href="/publications/search" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Zoek alle aanbestedingen
            </a>
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
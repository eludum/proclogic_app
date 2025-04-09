// src/app/analytics/page.tsx
"use server"
import { siteConfig } from "@/app/siteConfig";
import { auth } from '@clerk/nextjs/server';
import AnalyticsClient from "./_components/AnalyticsDashboard";

const API_BASE_URL = siteConfig.api_base_url;

export default async function AnalyticsPage() {
  const { getToken } = await auth();

  // Fetch initial summary data
  let summaryData = null;
  let sectorData = [];
  let fetchError = null;

  try {
    const token = await getToken();

    // Fetch award summary
    const summaryResponse = await fetch(`${API_BASE_URL}/awards/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!summaryResponse.ok) {
      throw new Error(`API error: ${summaryResponse.status}`);
    }

    summaryData = await summaryResponse.json();

    // Fetch sector data
    const sectorResponse = await fetch(`${API_BASE_URL}/awards/by-sector`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!sectorResponse.ok) {
      throw new Error(`API error: ${sectorResponse.status}`);
    }

    sectorData = await sectorResponse.json();
  } catch (error) {
    fetchError = error instanceof Error ? error.message : String(error);
    console.error("Error fetching analytics data:", error);
  }

  return (
    <section aria-label="Analytics">
      <div className="px-4 py-6 sm:px-6">
        <div className="w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Aanbestedingsanalyse</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inzichten in toegekende aanbestedingen en contractwaarden.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6">
        {fetchError ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p>Er is een fout opgetreden bij het laden van de analysegegevens: {fetchError}</p>
          </div>
        ) : (
          <AnalyticsClient
            initialSummaryData={summaryData}
            initialSectorData={sectorData}
          />
        )}
      </div>
    </section>
  );
}
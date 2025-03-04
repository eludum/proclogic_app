"use server"
import { siteConfig } from "@/app/siteConfig";
import { getCompanyData } from "@/lib/userUtils";
import { currentUser } from '@clerk/nextjs/server';
import PublicationList from "../_components/PublicationList";

const API_BASE_URL = siteConfig.api_base_url;

export default async function Overview() {
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

  // Fetch publications
  let publications = [];
  let fetchError = null;

  try {
    if (company) {
      const response = await fetch(`${API_BASE_URL}/publications/${company.vat_number}/`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      publications = await response.json();
    }
  } catch (error) {
    fetchError = error.message;
    console.error("Error fetching publications:", error);
  }

  return (
    <section aria-label="Publications Overview">
      <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbestedingen Overzicht</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bekijk en monitor aanbestedingsmogelijkheden</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 w-full">
        {fetchError ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading publications: {fetchError}</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Geen aanbestedingen gevonden</p>
          </div>
        ) : (
          <div className="p-4">
            <PublicationList publications={publications} company={company} />
          </div>
        )}
      </div>
    </section>
  );
}
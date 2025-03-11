"use server"
import { auth } from '@clerk/nextjs/server';
import CompanySettings from './_components/CompanySettings';

export default async function CompanySettingsPage() {
    // Check authentication
    const { userId } = auth();

    if (!userId) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Toegang geweigerd</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Je moet ingelogd zijn om deze pagina te bekijken. Log in om je bedrijfsgegevens te beheren.
                    </p>
                </div>
            </div>
        );
    }

    return <CompanySettings />;
}
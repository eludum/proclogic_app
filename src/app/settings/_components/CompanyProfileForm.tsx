import { Button } from '@/components/Button';
import { InfoIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { Company } from '../company-profile/page';

interface CompanyProfileFormProps {
    company: Company;
    onSave: (data: Partial<Company>) => Promise<void>;
    saving: boolean;
}

export default function CompanyProfileForm({ company, onSave, saving }: CompanyProfileFormProps) {
    const [name, setName] = useState(company.name);
    const [emails, setEmails] = useState(company.emails.join(', '));
    const [summaryActivities, setSummaryActivities] = useState(company.summary_activities);
    const [maxPublicationValue, setMaxPublicationValue] = useState(company.max_publication_value?.toString() || '');
    const [activityKeywords, setActivityKeywords] = useState(company.activity_keywords?.join(', ') || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process inputs before submission
        const emailsArray = emails.split(',').map(email => email.trim()).filter(Boolean);
        const keywordsArray = activityKeywords.split(',').map(keyword => keyword.trim()).filter(Boolean);

        const updatedData: Partial<Company> = {
            name,
            emails: emailsArray,
            summary_activities: summaryActivities,
            max_publication_value: maxPublicationValue ? parseInt(maxPublicationValue) : null,
            activity_keywords: keywordsArray.length > 0 ? keywordsArray : null
        };

        await onSave(updatedData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Bedrijfsprofiel
                    </h3>

                    {/* VAT Number (Read-only) */}
                    <div className="mb-6">
                        <label htmlFor="vat_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            BTW-nummer
                        </label>
                        <input
                            type="text"
                            id="vat_number"
                            className="w-full px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md cursor-not-allowed"
                            value={company.vat_number}
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <InfoIcon size={12} />
                            <span>BTW-nummer kan niet worden gewijzigd.</span>
                        </p>
                    </div>

                    {/* Company Name */}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bedrijfsnaam
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email Addresses */}
                    <div className="mb-6">
                        <label htmlFor="emails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            E-mailadressen (gescheiden door komma's)
                        </label>
                        <input
                            type="text"
                            id="emails"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder="email@bedrijf.be, contact@bedrijf.be"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Deze e-mailadressen worden gebruikt voor notificaties en communicatie.
                        </p>
                    </div>

                    {/* Subscription */}
                    <div className="mb-6">
                        <label htmlFor="subscription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Abonnement
                        </label>
                        <input
                            type="text"
                            id="subscription"
                            className="w-full px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md cursor-not-allowed"
                            value={company.subscription}
                            disabled
                        />
                    </div>

                    {/* Company Activities */}
                    <div className="mb-6">
                        <label htmlFor="summary_activities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bedrijfsactiviteiten
                        </label>
                        <textarea
                            id="summary_activities"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                            value={summaryActivities}
                            onChange={(e) => setSummaryActivities(e.target.value)}
                            placeholder="Beschrijf de kernactiviteiten van uw bedrijf..."
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Deze beschrijving wordt gebruikt voor het maken van aanbevelingen.
                        </p>
                    </div>

                    {/* Max Publication Value */}
                    <div className="mb-6">
                        <label htmlFor="max_publication_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Maximale aanbestedingswaarde (€)
                        </label>
                        <input
                            type="number"
                            id="max_publication_value"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                            value={maxPublicationValue}
                            onChange={(e) => setMaxPublicationValue(e.target.value)}
                            min="0"
                            placeholder="Bijvoorbeeld: 500000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Laat leeg als er geen limiet is voor aanbestedingen.
                        </p>
                    </div>

                    {/* Activity Keywords */}
                    <div className="mb-6">
                        <label htmlFor="activity_keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Activiteit Trefwoorden (gescheiden door komma's)
                        </label>
                        <input
                            type="text"
                            id="activity_keywords"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                            value={activityKeywords}
                            onChange={(e) => setActivityKeywords(e.target.value)}
                            placeholder="software, ontwikkeling, consultancy"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Deze trefwoorden helpen bij het vinden van relevante aanbestedingen.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="flex items-center gap-2"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin">⟳</span>
                                <span>Opslaan...</span>
                            </>
                        ) : (
                            <>
                                <SaveIcon size={16} />
                                <span>Opslaan</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
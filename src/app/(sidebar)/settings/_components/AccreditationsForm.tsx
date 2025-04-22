import { Button } from '@/components/Button';
import { AwardIcon, InfoIcon, PlusCircleIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Company } from '../company-profile/page';

interface AccreditationsFormProps {
    company: Company;
    onSave: (data: Partial<Company>) => Promise<void>;
    saving: boolean;
}

interface AccreditationInput {
    key: string;
    value: string;
    id: string;
}

// Common Belgian accreditation categories
const commonAccreditations = [
    "Erkenning als aannemer",
    "Attest VCA (Veiligheid, Gezondheid en Milieu Checklist Aannemers)",
    "BELAC certificering",
    "ISO 9001",
    "ISO 14001",
    "ISO 27001",
    "ISO 45001",
    "FSC certificaat",
    "PEFC certificaat",
    "CE-markering",
    "HACCP certificaat",
    "BRC certificaat",
    "IFS certificaat"
];

export default function AccreditationsForm({ company, onSave, saving }: AccreditationsFormProps) {
    // Initialize accreditation inputs from company data
    const initializeAccreditations = (): AccreditationInput[] => {
        if (!company.accreditations || Object.keys(company.accreditations).length === 0) {
            return [];
        }

        return Object.entries(company.accreditations).map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value.join(', ') : String(value),
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
    };

    const [accreditationInputs, setAccreditationInputs] = useState<AccreditationInput[]>(initializeAccreditations());
    const [newAccreditationKey, setNewAccreditationKey] = useState('');
    const [selectedCommonAccreditation, setSelectedCommonAccreditation] = useState(commonAccreditations[0]);

    // Add an empty accreditation input
    const addEmptyAccreditation = () => {
        setAccreditationInputs([
            ...accreditationInputs,
            {
                key: '',
                value: '',
                id: Date.now().toString()
            }
        ]);
    };

    // Add a pre-defined accreditation
    const addCommonAccreditation = () => {
        // Check if it already exists
        if (accreditationInputs.some(a => a.key === selectedCommonAccreditation)) {
            return; // Don't add duplicates
        }

        setAccreditationInputs([
            ...accreditationInputs,
            {
                key: selectedCommonAccreditation,
                value: '',
                id: Date.now().toString()
            }
        ]);
    };

    // Add custom accreditation
    const addCustomAccreditation = () => {
        if (!newAccreditationKey.trim()) return;

        // Check if it already exists
        if (accreditationInputs.some(a => a.key === newAccreditationKey)) {
            setNewAccreditationKey('');
            return; // Don't add duplicates
        }

        setAccreditationInputs([
            ...accreditationInputs,
            {
                key: newAccreditationKey,
                value: '',
                id: Date.now().toString()
            }
        ]);

        setNewAccreditationKey('');
    };

    const removeAccreditation = (id: string) => {
        setAccreditationInputs(accreditationInputs.filter(input => input.id !== id));
    };

    const updateAccreditation = (id: string, field: keyof AccreditationInput, value: string) => {
        setAccreditationInputs(
            accreditationInputs.map(input =>
                input.id === id ? { ...input, [field]: value } : input
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process inputs before submission
        const accreditationsObj: Record<string, any> = {};

        accreditationInputs.forEach(input => {
            if (input.key.trim() && input.value.trim()) {
                // Check if the value should be an array (comma-separated)
                if (input.value.includes(',')) {
                    accreditationsObj[input.key] = input.value.split(',').map(v => v.trim()).filter(Boolean);
                } else {
                    // Try to convert to number if it's numeric
                    const numValue = Number(input.value);
                    accreditationsObj[input.key] = isNaN(numValue) ? input.value : numValue;
                }
            }
        });

        await onSave({
            accreditations: Object.keys(accreditationsObj).length > 0 ? accreditationsObj : null
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Accreditaties & Certificeringen
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Voeg je bedrijfsaccreditaties en certificeringen toe. Deze worden gebruikt voor het vinden van aanbestedingen waarvoor je gekwalificeerd bent.
                    </p>

                    <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                            <InfoIcon size={16} className="text-astral-600 dark:text-astral-300 mt-0.5" />
                            <div className="text-sm text-astral-700 dark:text-astral-200">
                                <p className="font-medium">Waarom accreditaties toevoegen?</p>
                                <p className="mt-1">
                                    Veel aanbestedingen vereisen specifieke certificeringen. Door je accreditaties toe te voegen,
                                    kunnen we je aanbestedingen tonen waarvoor jouw bedrijf in aanmerking komt.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add common accreditation */}
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <AwardIcon size={16} />
                            <span>Gebruikelijke accreditaties toevoegen</span>
                        </h4>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                    value={selectedCommonAccreditation}
                                    onChange={(e) => setSelectedCommonAccreditation(e.target.value)}
                                >
                                    {commonAccreditations.map(accreditation => (
                                        <option key={accreditation} value={accreditation}>
                                            {accreditation}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                type="button"
                                onClick={addCommonAccreditation}
                                className="flex items-center gap-2 bg-astral-100 hover:bg-astral-200 text-astral-700 dark:bg-astral-900/40 dark:hover:bg-astral-900/60 dark:text-astral-300"
                            >
                                <PlusCircleIcon size={16} />
                                <span>Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    {/* Add custom accreditation */}
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                            Eigen accreditatie toevoegen
                        </h4>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                                    value={newAccreditationKey}
                                    onChange={(e) => setNewAccreditationKey(e.target.value)}
                                    placeholder="Voer een accreditatienaam in"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={addCustomAccreditation}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                                <PlusCircleIcon size={16} />
                                <span>Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    {/* Add empty row for fully custom entry */}
                    <div className="mb-6">
                        <Button
                            type="button"
                            onClick={addEmptyAccreditation}
                            className="flex items-center gap-2 text-astral-600 dark:text-astral-400"
                            variant="ghost"
                        >
                            <PlusCircleIcon size={16} />
                            <span>Lege rij toevoegen</span>
                        </Button>
                    </div>

                    {/* Accreditation inputs list */}
                    <div className="space-y-4">
                        {accreditationInputs.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Geen accreditaties toegevoegd. Gebruik de opties hierboven om accreditaties toe te voegen.
                                </p>
                            </div>
                        ) : (
                            accreditationInputs.map((input, index) => (
                                <div key={input.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-slate-900">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <AwardIcon size={16} className="text-astral-600 dark:text-astral-300" />
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                Accreditatie {index + 1}
                                            </h4>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => removeAccreditation(input.id)}
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-1 h-auto"
                                        >
                                            <TrashIcon size={16} />
                                        </Button>
                                    </div>

                                    {/* Accreditation Name */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Accreditatie Naam
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                                            value={input.key}
                                            onChange={(e) => updateAccreditation(input.id, 'key', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Accreditation Value */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Waarde/Niveau
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                                            value={input.value}
                                            onChange={(e) => updateAccreditation(input.id, 'value', e.target.value)}
                                            placeholder="Bijv. 1, 2, 3 of D1, D24"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Voer een waarde, niveau of classificatie in. Voor meerdere waarden, scheid ze met komma&apos;s.
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
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
import { Button } from '@/components/Button';
import { InfoIcon, MapPinIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { Company } from '../company-profile/page';

interface RegionsFormProps {
    company: Company;
    onSave: (data: Partial<Company>) => Promise<void>;
    saving: boolean;
}

// Available regions based on NUTS codes for Belgium
const availableRegions = [
    { value: "BE1", label: "Brussels Hoofdstedelijk Gewest" },
    { value: "BE10", label: "Région de Bruxelles-Capitale / Brussels Hoofdstedelijk Gewest" },
    { value: "BE2", label: "Vlaams Gewest" },
    { value: "BE21", label: "Prov. Antwerpen" },
    { value: "BE22", label: "Prov. Limburg (BE)" },
    { value: "BE23", label: "Prov. Oost-Vlaanderen" },
    { value: "BE24", label: "Prov. Vlaams-Brabant" },
    { value: "BE25", label: "Prov. West-Vlaanderen" },
    { value: "BE3", label: "Région wallonne" },
    { value: "BE31", label: "Prov. Brabant Wallon" },
    { value: "BE32", label: "Prov. Hainaut" },
    { value: "BE33", label: "Prov. Liège" },
    { value: "BE34", label: "Prov. Luxembourg (BE)" },
    { value: "BE35", label: "Prov. Namur" },
    { value: "BE", label: "België (Heel België)" },
];

export default function RegionsForm({ company, onSave, saving }: RegionsFormProps) {
    const [selectedRegions, setSelectedRegions] = useState<string[]>(
        company.operating_regions || []
    );

    const toggleRegion = (regionValue: string) => {
        if (selectedRegions.includes(regionValue)) {
            setSelectedRegions(selectedRegions.filter(r => r !== regionValue));
        } else {
            setSelectedRegions([...selectedRegions, regionValue]);
        }
    };

    const selectAll = () => {
        setSelectedRegions(availableRegions.map(r => r.value));
    };

    const clearAll = () => {
        setSelectedRegions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ operating_regions: selectedRegions.length > 0 ? selectedRegions : null });
    };

    // Group regions by the first character (B for Belgium, then by number)
    const groupedRegions = availableRegions.reduce((acc, region) => {
        const key = region.value.charAt(0) + (region.value.length > 2 ? region.value.charAt(1) : '');
        if (!acc[key]) acc[key] = [];
        acc[key].push(region);
        return acc;
    }, {} as Record<string, typeof availableRegions>);

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Operationele Regio's
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Selecteer de regio's waar uw bedrijf actief is. Dit helpt ons om relevante lokale aanbestedingen te vinden.
                    </p>

                    <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                            <InfoIcon size={16} className="text-astral-600 dark:text-astral-300 mt-0.5" />
                            <div className="text-sm text-astral-700 dark:text-astral-200">
                                <p className="font-medium">NUTS codes</p>
                                <p className="mt-1">
                                    De geselecteerde regio's zijn gebaseerd op NUTS codes (Nomenclature of Territorial Units for Statistics),
                                    een hiërarchisch systeem voor het indelen van economische gebieden in Europa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Region selection controls */}
                    <div className="flex justify-end gap-2 mb-4">
                        <Button
                            type="button"
                            onClick={selectAll}
                            variant="secondary"
                            className="text-sm"
                        >
                            Alles selecteren
                        </Button>
                        <Button
                            type="button"
                            onClick={clearAll}
                            variant="secondary"
                            className="text-sm"
                        >
                            Alles wissen
                        </Button>
                    </div>

                    {/* Regions selection grid */}
                    <div className="mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Country-wide option */}
                            <div
                                className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer 
                  ${selectedRegions.includes('BE')
                                        ? 'bg-astral-50 border-astral-200 dark:bg-astral-900/20 dark:border-astral-800'
                                        : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-gray-700'
                                    }`}
                                onClick={() => toggleRegion('BE')}
                            >
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-astral-600 border-gray-300 rounded"
                                        checked={selectedRegions.includes('BE')}
                                        onChange={() => { }} // Controlled by the onClick of the parent div
                                    />
                                </div>
                                <div className="flex items-center">
                                    <MapPinIcon size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        België (Heel België)
                                    </label>
                                </div>
                            </div>

                            {/* Region groups */}
                            {Object.keys(groupedRegions).filter(key => key !== 'BE').map(groupKey => (
                                <div key={groupKey} className="space-y-2">
                                    <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
                                        {groupKey === 'B2' ? 'Vlaanderen' :
                                            groupKey === 'B3' ? 'Wallonië' :
                                                groupKey === 'B1' ? 'Brussel' : groupKey}
                                    </div>

                                    {groupedRegions[groupKey].map(region => (
                                        // Skip the all-Belgium option as it's already shown above
                                        region.value !== 'BE' && (
                                            <div
                                                key={region.value}
                                                className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer 
                          ${selectedRegions.includes(region.value)
                                                        ? 'bg-astral-50 border-astral-200 dark:bg-astral-900/20 dark:border-astral-800'
                                                        : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-gray-700'
                                                    }`}
                                                onClick={() => toggleRegion(region.value)}
                                            >
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-astral-600 border-gray-300 rounded"
                                                        checked={selectedRegions.includes(region.value)}
                                                        onChange={() => { }} // Controlled by the onClick of the parent div
                                                    />
                                                </div>
                                                <div className="ml-2 text-sm">
                                                    <label className="font-medium text-gray-700 dark:text-gray-300">
                                                        {region.label}
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {region.value}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected regions summary */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Geselecteerde regio's ({selectedRegions.length})
                        </h4>
                        {selectedRegions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedRegions.map(regionValue => {
                                    const region = availableRegions.find(r => r.value === regionValue);
                                    return (
                                        <div
                                            key={regionValue}
                                            className="px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-md text-xs"
                                        >
                                            {region?.label || regionValue}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Geen regio's geselecteerd. Selecteer minstens één regio.
                            </p>
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
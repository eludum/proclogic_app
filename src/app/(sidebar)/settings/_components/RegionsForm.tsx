import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cx } from "@/lib/utils";
import {
    CheckCircle,
    InfoIcon,
    MapPinIcon,
    SaveIcon,
    SearchIcon
} from 'lucide-react';
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

// Group regions into categories
const regionCategories = [
    {
        name: "Landelijk",
        regions: ["BE"]
    },
    {
        name: "Gewesten",
        regions: ["BE1", "BE2", "BE3"]
    },
    {
        name: "Provincies in Vlaanderen",
        regions: ["BE21", "BE22", "BE23", "BE24", "BE25"]
    },
    {
        name: "Provincies in Wallonië",
        regions: ["BE31", "BE32", "BE33", "BE34", "BE35"]
    },
    {
        name: "Brussel",
        regions: ["BE10"]
    }
];

export default function RegionsForm({ company, onSave, saving }: RegionsFormProps) {
    const [selectedRegions, setSelectedRegions] = useState<string[]>(
        company.operating_regions || []
    );
    const [searchQuery, setSearchQuery] = useState('');

    // Filter regions based on search query
    const filteredRegions = availableRegions.filter(region =>
        region.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleRegion = (regionValue: string) => {
        if (selectedRegions.includes(regionValue)) {
            setSelectedRegions(selectedRegions.filter(r => r !== regionValue));
        } else {
            setSelectedRegions([...selectedRegions, regionValue]);
        }
    };

    const selectAllRegions = () => {
        setSelectedRegions(availableRegions.map(r => r.value));
    };

    const clearAllRegions = () => {
        setSelectedRegions([]);
    };

    const selectCategory = (category: string) => {
        const categoryToRegions: Record<string, string[]> = {
            "Landelijk": ["BE"],
            "Gewesten": ["BE1", "BE2", "BE3"],
            "Provincies in Vlaanderen": ["BE21", "BE22", "BE23", "BE24", "BE25"],
            "Provincies in Wallonië": ["BE31", "BE32", "BE33", "BE34", "BE35"],
            "Brussel": ["BE10"]
        };

        const regionsToAdd = categoryToRegions[category] || [];

        // Add all regions from the category that aren't already selected
        setSelectedRegions(prev => {
            const newRegions = [...prev];
            regionsToAdd.forEach(region => {
                if (!newRegions.includes(region)) {
                    newRegions.push(region);
                }
            });
            return newRegions;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ operating_regions: selectedRegions.length > 0 ? selectedRegions : null });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Operationele regio&apos;s
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Selecteer de regio&apos;s waar je bedrijf actief is. Dit helpt ons om relevante aanbestedingen in je regio te vinden.
                    </p>

                    <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                            <InfoIcon size={16} className="text-astral-600 dark:text-astral-300 mt-0.5" />
                            <div className="text-sm text-astral-700 dark:text-astral-200">
                                <p className="font-medium">NUTS codes</p>
                                <p className="mt-1">
                                    De geselecteerde regio&apos;s zijn gebaseerd op NUTS codes (Nomenclature of Territorial Units for Statistics),
                                    een hiërarchisch systeem voor het indelen van economische gebieden in Europa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and actions */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <Input
                                type="search"
                                className="pl-10"
                                placeholder="Zoek op regio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">{selectedRegions.length}</span> van {availableRegions.length} regio&apos;sgeselecteerd
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={selectAllRegions}
                                    className="text-xs"
                                >
                                    Alles selecteren
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={clearAllRegions}
                                    className="text-xs"
                                >
                                    Alles wissen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Regions selection */}
                    <div className="mb-6">
                        {searchQuery ? (
                            // Show search results
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                                    Zoekresultaten
                                </h3>
                                {filteredRegions.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                        Geen regio&apos;s gevonden voor &quot;{searchQuery}&quot;
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {filteredRegions.map((region) => {
                                            const isSelected = selectedRegions.includes(region.value);
                                            return (
                                                <div
                                                    key={region.value}
                                                    className={cx(
                                                        "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                        isSelected
                                                            ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                    )}
                                                    onClick={() => toggleRegion(region.value)}
                                                >
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="h-4 w-4 text-astral-600 border-gray-300 rounded"
                                                        />
                                                    </div>
                                                    <div className="flex items-center ml-3">
                                                        <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                        <label className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {region.label}
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                ({region.value})
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Show categorized regions
                            <div className="space-y-6">
                                {regionCategories.map((category) => (
                                    <div key={category.name}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {category.name}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-8 text-xs text-astral-600 dark:text-astral-400"
                                                onClick={() => selectCategory(category.name)}
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                Alles in {category.name.toLowerCase()} selecteren
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {availableRegions
                                                .filter(region => category.regions.includes(region.value))
                                                .map(region => {
                                                    const isSelected = selectedRegions.includes(region.value);
                                                    return (
                                                        <div
                                                            key={region.value}
                                                            className={cx(
                                                                "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                                isSelected
                                                                    ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                            )}
                                                            onClick={() => toggleRegion(region.value)}
                                                        >
                                                            <div className="flex items-center h-5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => { }}
                                                                    className="h-4 w-4 text-astral-600 border-gray-300 rounded"
                                                                />
                                                            </div>
                                                            <div className="flex items-center ml-3">
                                                                <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                                <label className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {region.label}
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                        ({region.value})
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected regions summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Geselecteerde regio&apos;s ({selectedRegions.length})
                        </h3>
                        {selectedRegions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedRegions.map(regionValue => {
                                    const region = availableRegions.find(r => r.value === regionValue);
                                    return (
                                        <div
                                            key={regionValue}
                                            className="px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-md text-xs flex items-center group"
                                        >
                                            {region?.label || regionValue}
                                            <button
                                                type="button"
                                                className="ml-1 text-astral-500 dark:text-astral-400 hover:text-astral-700 dark:hover:text-astral-200"
                                                onClick={() => toggleRegion(regionValue)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Geen regio&apos;s geselecteerd. Selecteer minstens één regio.
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
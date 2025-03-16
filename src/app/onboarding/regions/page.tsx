// src/app/onboarding/regions/page.tsx
"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { cx } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { ArrowRight, CheckCircleIcon, InfoIcon, Loader2, MapPinIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

// List of detailed regions (for search and selection)
const detailedRegions = [
    ...availableRegions,
    { value: "BE211", label: "Arr. Antwerpen" },
    { value: "BE212", label: "Arr. Mechelen" },
    { value: "BE213", label: "Arr. Turnhout" },
    { value: "BE221", label: "Arr. Hasselt" },
    { value: "BE222", label: "Arr. Maaseik" },
    { value: "BE223", label: "Arr. Tongeren" },
    { value: "BE231", label: "Arr. Aalst" },
    { value: "BE232", label: "Arr. Dendermonde" },
    { value: "BE233", label: "Arr. Eeklo" },
    { value: "BE234", label: "Arr. Gent" },
    { value: "BE235", label: "Arr. Oudenaarde" },
    { value: "BE236", label: "Arr. Sint-Niklaas" },
    { value: "BE241", label: "Arr. Halle-Vilvoorde" },
    { value: "BE242", label: "Arr. Leuven" },
    { value: "BE251", label: "Arr. Brugge" },
    { value: "BE252", label: "Arr. Diksmuide" },
    { value: "BE253", label: "Arr. Ieper" },
    { value: "BE254", label: "Arr. Kortrijk" },
    { value: "BE255", label: "Arr. Oostende" },
    { value: "BE256", label: "Arr. Roeselare" },
    { value: "BE257", label: "Arr. Tielt" },
    { value: "BE258", label: "Arr. Veurne" },
    { value: "BE310", label: "Arr. Nivelles" },
    { value: "BE323", label: "Arr. Mons" },
    { value: "BE328", label: "Arr. Tournai-Mouscron" },
    { value: "BE329", label: "Arr. La Louvière" },
    { value: "BE32A", label: "Arr. Ath" },
    { value: "BE32B", label: "Arr. Charleroi" },
    { value: "BE32C", label: "Arr. Soignies" },
    { value: "BE32D", label: "Arr. Thuin" },
    { value: "BE331", label: "Arr. Huy" },
    { value: "BE332", label: "Arr. Liège" },
    { value: "BE334", label: "Arr. Waremme" },
    { value: "BE335", label: "Arr. Verviers — communes francophones" },
    { value: "BE336", label: "Bezirk Verviers — Deutschsprachige Gemeinschaft" },
    { value: "BE341", label: "Arr. Arlon" },
    { value: "BE342", label: "Arr. Bastogne" },
    { value: "BE343", label: "Arr. Marche-en-Famenne" },
    { value: "BE344", label: "Arr. Neufchâteau" },
    { value: "BE345", label: "Arr. Virton" },
    { value: "BE351", label: "Arr. Dinant" },
    { value: "BE352", label: "Arr. Namur" },
    { value: "BE353", label: "Arr. Philippeville" },
];

interface RegionItemProps {
    region: { value: string; label: string };
    checked: boolean;
    onCheckedChange: (value: string, checked: boolean) => void;
}

const RegionItem = ({ region, checked, onCheckedChange }: RegionItemProps) => {
    return (
        <div
            className={cx(
                "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                checked
                    ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            )}
            onClick={() => onCheckedChange(region.value, !checked)}
        >
            <div className="flex items-center h-5">
                <Checkbox
                    id={`region-${region.value}`}
                    checked={checked}
                    onCheckedChange={() => { }}
                    className="h-4 w-4"
                />
            </div>
            <div className="flex items-center ml-3">
                <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                <Label
                    htmlFor={`region-${region.value}`}
                    className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {region.label}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({region.value})
                    </span>
                </Label>
            </div>
        </div>
    );
};

export default function RegionsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

    // Fetch existing regions data if available
    useEffect(() => {
        async function fetchRegionsData() {
            try {
                setLoading(true);
                const token = await getToken();
                const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.operating_regions && Array.isArray(data.operating_regions)) {
                        setSelectedRegions(data.operating_regions);
                    }
                } else if (response.status !== 404) {
                    // Only show error if it's not a 404 (company not found is expected)
                    console.error("Error fetching company data", response.status);
                    toast({
                        title: "Fout",
                        description: "Er is een fout opgetreden bij het ophalen van regio's.",
                        variant: "error",
                    });
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRegionsData();
    }, [getToken, toast]);

    const toggleRegion = (value: string, checked: boolean) => {
        setSelectedRegions(prev =>
            checked
                ? [...prev, value]
                : prev.filter(r => r !== value)
        );
    };

    const selectAll = () => {
        setSelectedRegions(availableRegions.map(r => r.value));
    };

    const clearAll = () => {
        setSelectedRegions([]);
    };

    const selectCategory = (category: string) => {
        const categoryToSelect = regionCategories.find(c => c.name === category);
        if (categoryToSelect) {
            setSelectedRegions(prev => {
                const newSelection = [...prev];
                categoryToSelect.regions.forEach(region => {
                    if (!newSelection.includes(region)) {
                        newSelection.push(region);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if at least one region is selected
        if (selectedRegions.length === 0) {
            toast({
                title: "Ontbrekende informatie",
                description: "Selecteer ten minste één regio.",
                variant: "error",
            });
            return;
        }

        setFormSubmitting(true);

        try {
            const token = await getToken();

            // Update company with new regions
            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operating_regions: selectedRegions
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            toast({
                title: "Regio's Opgeslagen",
                description: "Je regio's zijn succesvol opgeslagen.",
                variant: "success",
            });

            router.push("/onboarding/complete");
        } catch (error) {
            console.error("Error saving regions data:", error);
            toast({
                title: "Fout bij Opslaan",
                description: "Er is een fout opgetreden bij het opslaan van je regio's.",
                variant: "error",
            });
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter regions based on search query
    const filteredRegions = detailedRegions.filter(region =>
        region.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader loadingtext="Regio's laden..." size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Regio's Selecteren
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Selecteer de regio's waar je bedrijf actief is voor relevante aanbestedingen.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                {/* Info box */}
                <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-4 rounded-md flex items-start gap-3">
                    <InfoIcon className="text-astral-600 dark:text-astral-300 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-medium text-astral-800 dark:text-astral-200 text-sm">
                            NUTS-codes
                        </h3>
                        <p className="text-sm text-astral-700 dark:text-astral-300 mt-1">
                            De geselecteerde regio's zijn gebaseerd op NUTS-codes, een hiërarchisch systeem voor het indelen van economische gebieden in Europa.
                        </p>
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
                            <span className="font-medium">{selectedRegions.length}</span> van {availableRegions.length} regio's geselecteerd
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAll}
                                className="text-xs"
                            >
                                Alles selecteren
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearAll}
                                className="text-xs"
                            >
                                Alles wissen
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Regions selection */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        {searchQuery ? (
                            // Show search results
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                                    Zoekresultaten
                                </h3>
                                {filteredRegions.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                        Geen regio's gevonden voor "{searchQuery}"
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {filteredRegions.map((region) => (
                                            <RegionItem
                                                key={region.value}
                                                region={region}
                                                checked={selectedRegions.includes(region.value)}
                                                onCheckedChange={toggleRegion}
                                            />
                                        ))}
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
                                                size="sm"
                                                className="h-8 text-xs text-astral-600 dark:text-astral-400"
                                                onClick={() => selectCategory(category.name)}
                                            >
                                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                                Alles in {category.name.toLowerCase()} selecteren
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {availableRegions
                                                .filter(region => category.regions.includes(region.value))
                                                .map(region => (
                                                    <RegionItem
                                                        key={region.value}
                                                        region={region}
                                                        checked={selectedRegions.includes(region.value)}
                                                        onCheckedChange={toggleRegion}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected regions summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Geselecteerde regio's ({selectedRegions.length})
                        </h3>
                        {selectedRegions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedRegions.map(regionValue => {
                                    const region = detailedRegions.find(r => r.value === regionValue);
                                    return (
                                        <div
                                            key={regionValue}
                                            className="px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-md text-xs flex items-center group"
                                        >
                                            {region?.label || regionValue}
                                            <button
                                                type="button"
                                                className="ml-1 text-astral-500 dark:text-astral-400 hover:text-astral-700 dark:hover:text-astral-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => toggleRegion(regionValue, false)}
                                            >
                                                ×
                                            </button>
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

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="flex items-center gap-2"
                            disabled={formSubmitting || selectedRegions.length === 0}
                        >
                            {formSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Opslaan...</span>
                                </>
                            ) : (
                                <>
                                    <span>Doorgaan</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
"use client"
import { Button } from "@/components/Button";
import {
    Filter, MapPinIcon, SearchIcon, TagIcon, X
} from "lucide-react";
import { useState } from "react";

// Define proper interfaces for the component
interface FilterState {
    searchTerm: string;
    sectorFilters: string[];
    regionFilters: string[];
}

interface FreeFilterCardProps {
    onFiltersChange?: (filters: FilterState) => void;
    initialFilters?: Partial<FilterState>;
}

export default function FreeFilterCard({
    onFiltersChange,
    initialFilters = {
        searchTerm: "",
        sectorFilters: [],
        regionFilters: []
    }
}: FreeFilterCardProps) {
    const [showFilters, setShowFilters] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize with default values
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: initialFilters.searchTerm || "",
        sectorFilters: initialFilters.sectorFilters || [],
        regionFilters: initialFilters.regionFilters || []
    });

    // Apply filters to parent component
    const applyFilters = () => {
        setIsSubmitting(true);

        // Always use the callback to trigger data fetching instead of URL navigation
        if (onFiltersChange) {
            onFiltersChange(filters);
            setIsSubmitting(false);
        }
    };

    // Update search term
    const handleSearchChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            searchTerm: value
        }));
    };

    // Toggle a sector filter
    const handleSectorChange = (sector: string) => {
        setFilters(prev => {
            const newSectors = prev.sectorFilters.includes(sector)
                ? prev.sectorFilters.filter(s => s !== sector)
                : [...prev.sectorFilters, sector];

            return {
                ...prev,
                sectorFilters: newSectors
            };
        });
    };

    // Toggle a region filter
    const handleRegionChange = (region: string) => {
        setFilters(prev => {
            const newRegions = prev.regionFilters.includes(region)
                ? prev.regionFilters.filter(r => r !== region)
                : [...prev.regionFilters, region];

            return {
                ...prev,
                regionFilters: newRegions
            };
        });
    };

    // Reset all filters to defaults
    const resetFilters = () => {
        const defaultFilters: FilterState = {
            searchTerm: "",
            sectorFilters: [],
            regionFilters: []
        };
        setFilters(defaultFilters);

        // Use the callback to reset data
        if (onFiltersChange) {
            onFiltersChange(defaultFilters);
        }
    };

    // Determine if any filters are active
    const hasActiveFilters = () => {
        return filters.searchTerm || filters.sectorFilters.length > 0 || filters.regionFilters.length > 0;
    };

    const sectorOptions = [
        { value: "45000000", label: "Bouwwerkzaamheden" },
        { value: "72000000", label: "IT & Technologie" },
        { value: "85000000", label: "Gezondheidszorg" },
        { value: "80000000", label: "Onderwijs" },
        { value: "71000000", label: "Architectuur en Engineering" }
    ];

    const regionOptions = [
        { value: "BE21", label: "Antwerpen" },
        { value: "BE10", label: "Brussel" },
        { value: "BE22", label: "Limburg" },
        { value: "BE23", label: "Oost-Vlaanderen" },
        { value: "BE24", label: "Vlaams-Brabant" },
        { value: "BE25", label: "West-Vlaanderen" }
    ];

    // Handle search on Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    };

    return (
        <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block w-full pl-10 py-2 pr-3 border border-gray-300 dark:border-gray-700 rounded-md 
                        bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white 
                        focus:outline-hidden focus:ring-2 focus:ring-astral-500 focus:border-transparent"
                        placeholder="Zoek in titel, beschrijving, organisatie..."
                    />
                </div>

                {/* Filter toggle button */}
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 ${showFilters ? 'bg-astral-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                    <Filter size={16} />
                    <span>{showFilters ? "Verberg filters" : "Toon filters"}</span>
                    {hasActiveFilters() && (
                        <span className="bg-white text-astral-600 text-xs px-1.5 py-0.5 rounded-full">
                            Actief
                        </span>
                    )}
                </Button>

                {/* Reset filters button - only show if filters are active */}
                {hasActiveFilters() && (
                    <Button
                        onClick={resetFilters}
                        variant="secondary"
                        className="text-sm"
                    >
                        Reset filters
                    </Button>
                )}
            </div>

            {/* Filter options */}
            {showFilters && (
                <div className="mt-3 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    {/* Free available filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Sector filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <TagIcon size={12} />
                                <span>Sector</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {sectorOptions.map(sector => (
                                    <Button
                                        key={sector.value}
                                        type="button"
                                        onClick={() => handleSectorChange(sector.value)}
                                        variant={filters.sectorFilters.includes(sector.value) ? "primary" : "secondary"}
                                        className="flex items-center gap-1 text-xs py-1 px-2"
                                    >
                                        {sector.label}
                                    </Button>
                                ))}
                                {filters.sectorFilters.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, sectorFilters: [] }))}
                                        variant="destructive"
                                        className="flex items-center gap-1 text-xs py-1 px-2"
                                    >
                                        <X size={12} />
                                        <span>Wis</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Region filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <MapPinIcon size={12} />
                                <span>Regio</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {regionOptions.map(region => (
                                    <Button
                                        key={region.value}
                                        type="button"
                                        onClick={() => handleRegionChange(region.value)}
                                        variant={filters.regionFilters.includes(region.value) ? "primary" : "secondary"}
                                        className="flex items-center gap-1 text-xs py-1 px-2"
                                    >
                                        {region.label}
                                    </Button>
                                ))}
                                {filters.regionFilters.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, regionFilters: [] }))}
                                        variant="destructive"
                                        className="flex items-center gap-1 text-xs py-1 px-2"
                                    >
                                        <X size={12} />
                                        <span>Wis</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Premium feature message */}
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Pro tip:</span> Maak een account aan voor toegang tot geavanceerde filters zoals datumbereik, CPV code, en opgeslagen aanbestedingen.
                        </p>
                    </div>

                    {/* Apply Filters Button */}
                    <div className="flex justify-end pt-3">
                        <Button
                            onClick={applyFilters}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-astral-600 hover:bg-astral-700 text-white"
                        >
                            <span>Filters toepassen</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
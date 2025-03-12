"use client"
import { Button } from "@/components/Button";
import {
    BookmarkCheck, BookmarkPlus, CalendarIcon, CheckCircleIcon,
    CodeIcon, Eye, Filter, MapPinIcon, SearchIcon,
    Star, TagIcon, X
} from "lucide-react";
import { useEffect, useState } from "react";

export default function FilterCard({
    isSearchPage = false,
    isSavedPage = false,
    isOverviewPage = false,
    onFiltersChange,
    initialFilters = {
        searchTerm: "",
        activeFilters: {},
        sectorFilters: [],
        regionFilters: [],
        dateFilter: "",
        cpvCodeFilter: ""
    }
}) {
    const [showFilters, setShowFilters] = useState(true);

    // Set default filter values based on page type
    const getDefaultFilters = () => {
        const defaults = {
            searchTerm: "",
            activeFilters: {
                recommended: isOverviewPage,  // Default true on overview page
                viewed: false,
                saved: isSavedPage,          // Default true on saved page
                active: true,                // Always default true
            },
            sectorFilters: [],
            regionFilters: [],
            dateFilter: "",
            cpvCodeFilter: ""
        };
        return defaults;
    };

    // Initialize with combined default values and initial values
    const [filters, setFilters] = useState(() => {
        const defaults = getDefaultFilters();
        return {
            searchTerm: initialFilters.searchTerm || defaults.searchTerm,
            activeFilters: {
                ...defaults.activeFilters,
                ...(initialFilters.activeFilters || {})
            },
            sectorFilters: initialFilters.sectorFilters || defaults.sectorFilters,
            regionFilters: initialFilters.regionFilters || defaults.regionFilters,
            dateFilter: initialFilters.dateFilter || defaults.dateFilter,
            cpvCodeFilter: initialFilters.cpvCodeFilter || defaults.cpvCodeFilter
        };
    });

    // Apply initial filters on first render
    useEffect(() => {
        onFiltersChange(filters);
    }, []);

    // Apply filters to parent component
    const applyFilters = () => {
        onFiltersChange(filters);
    };

    // Toggle boolean filters
    const handleFilterToggle = (filter) => {
        // Special case for saved page - don't allow unsaving on saved page
        if (isSavedPage && filter === 'saved') return;

        setFilters(prev => ({
            ...prev,
            activeFilters: {
                ...prev.activeFilters,
                [filter]: !prev.activeFilters[filter]
            }
        }));
    };

    // Update search term
    const handleSearchChange = (value) => {
        setFilters(prev => ({
            ...prev,
            searchTerm: value
        }));
    };

    // Toggle a sector filter
    const handleSectorChange = (sector) => {
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
    const handleRegionChange = (region) => {
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

    // Update date filter
    const handleDateChange = (value) => {
        setFilters(prev => ({
            ...prev,
            dateFilter: value
        }));
    };

    // Update CPV code filter
    const handleCpvCodeChange = (value) => {
        setFilters(prev => ({
            ...prev,
            cpvCodeFilter: value
        }));
    };

    // Reset all filters to defaults
    const resetFilters = () => {
        const defaultFilters = getDefaultFilters();
        setFilters(defaultFilters);
        onFiltersChange(defaultFilters);
    };

    // Determine if any filters are active beyond defaults
    const hasActiveFilters = () => {
        const defaults = getDefaultFilters();

        // Check search term
        if (filters.searchTerm) return true;

        // Check sector and region filters
        if (filters.sectorFilters.length > 0) return true;
        if (filters.regionFilters.length > 0) return true;

        // Check date and CPV filters
        if (filters.dateFilter) return true;
        if (filters.cpvCodeFilter) return true;

        // Check boolean filters against defaults
        const defaultBooleans = defaults.activeFilters;
        if (filters.activeFilters.recommended !== defaultBooleans.recommended) return true;
        if (filters.activeFilters.viewed !== defaultBooleans.viewed) return true;
        if (filters.activeFilters.saved !== defaultBooleans.saved) return true;
        if (filters.activeFilters.active !== defaultBooleans.active) return true;

        return false;
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

    return (
        <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search input - Only shown on search page */}
                {isSearchPage && (
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="block w-full pl-10 py-2 pr-3 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white 
                            focus:outline-hidden focus:ring-2 focus:ring-astral-500 focus:border-transparent"
                            placeholder="Zoek in titel, beschrijving, organisatie..."
                        />
                    </div>
                )}

                {/* Flex-1 div to take up space when no search bar */}
                {!isSearchPage && <div className="flex-1"></div>}

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
                    {/* Boolean filters - always shown on all pages */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() => handleFilterToggle('active')}
                            variant={filters.activeFilters.active ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <CheckCircleIcon size={14} />
                            <span>Alleen actieve</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleFilterToggle('recommended')}
                            variant={filters.activeFilters.recommended ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Star size={14} className={filters.activeFilters.recommended ? "text-amber-300" : ""} />
                            <span>Aanbevolen</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleFilterToggle('viewed')}
                            variant={filters.activeFilters.viewed ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Eye size={14} />
                            <span>Bekeken</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleFilterToggle('saved')}
                            variant={filters.activeFilters.saved ? "default" : "secondary"}
                            disabled={isSavedPage} // Disable on saved page
                            className={`flex items-center gap-1.5 text-sm ${isSavedPage ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {filters.activeFilters.saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                            <span>Opgeslagen</span>
                        </Button>
                    </div>

                    {/* Advanced filters - only on search page */}
                    {isSearchPage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
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
                                            variant={filters.sectorFilters.includes(sector.value) ? "default" : "secondary"}
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
                                            variant={filters.regionFilters.includes(region.value) ? "default" : "secondary"}
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

                            {/* Date filter */}
                            <div>
                                <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <CalendarIcon size={12} />
                                    <span>Datum</span>
                                </label>
                                <select
                                    id="date"
                                    value={filters.dateFilter}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">Alle datums</option>
                                    <option value="7d">Afgelopen 7 dagen</option>
                                    <option value="30d">Afgelopen 30 dagen</option>
                                    <option value="90d">Afgelopen 90 dagen</option>
                                </select>
                            </div>

                            {/* CPV Code filter */}
                            <div>
                                <label htmlFor="cpvCode" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <CodeIcon size={12} />
                                    <span>CPV Code</span>
                                </label>
                                <input
                                    type="text"
                                    id="cpvCode"
                                    value={filters.cpvCodeFilter}
                                    onChange={(e) => handleCpvCodeChange(e.target.value)}
                                    placeholder="Bijv. 72000000"
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Apply Filters Button */}
                    <div className="flex justify-end pt-3">
                        <Button
                            onClick={applyFilters}
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
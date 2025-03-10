// src/app/publications/_components/Search.tsx
"use client"
import { Button } from "@/components/Button";
import { BookmarkCheck, CalendarIcon, CheckCircleIcon, CodeIcon, Eye, FilterIcon, LockIcon, MapPinIcon, SearchIcon, StarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Search({ isPremium = false }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Expanded filters for search page
    const [filters, setFilters] = useState({
        sector: "",
        region: "",
        date: "",
        cpvCode: "",
        active: true,
        recommended: false,
        viewed: false,
        saved: false
    });

    // Load values from URL on component mount
    useEffect(() => {
        setSearchTerm(searchParams.get("q") || "");

        // Set all filter values from URL params
        setFilters({
            sector: searchParams.get("sector") || "",
            region: searchParams.get("region") || "",
            date: searchParams.get("date") || "",
            cpvCode: searchParams.get("cpv_code") || "",
            active: searchParams.get("active") !== "false", // Default to true if not specified
            recommended: searchParams.get("recommended") === "true",
            viewed: searchParams.get("viewed") === "true",
            saved: searchParams.get("saved") === "true"
        });

        // Open filters panel if any filters are set
        if (
            searchParams.get("sector") ||
            searchParams.get("region") ||
            searchParams.get("date") ||
            searchParams.get("cpv_code") ||
            searchParams.get("active") ||
            searchParams.get("recommended") ||
            searchParams.get("viewed") ||
            searchParams.get("saved")
        ) {
            setShowAdvancedFilters(true);
        }
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleBooleanFilter = (name) => {
        setFilters(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Create a query string from the current search parameters
    const createQueryString = useCallback((params) => {
        const newSearchParams = new URLSearchParams();

        // Add search term if present
        if (params.q) newSearchParams.set("q", params.q);

        // Add other parameters if they have values
        if (params.sector) newSearchParams.set("sector", params.sector);
        if (params.region) newSearchParams.set("region", params.region);
        if (params.date) newSearchParams.set("date", params.date);
        if (params.cpvCode) newSearchParams.set("cpv_code", params.cpvCode);

        // Add boolean filters (only add if not default)
        if (params.active === false) newSearchParams.set("active", "false");
        if (params.recommended === true) newSearchParams.set("recommended", "true");
        if (params.viewed === true) newSearchParams.set("viewed", "true");
        if (params.saved === true) newSearchParams.set("saved", "true");

        return newSearchParams.toString();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();

        const queryString = createQueryString({
            q: searchTerm,
            ...filters
        });

        router.push(`/publications/search?${queryString}`);
    };

    const handleReset = () => {
        setSearchTerm("");
        setFilters({
            sector: "",
            region: "",
            date: "",
            cpvCode: "",
            active: true,
            recommended: false,
            viewed: false,
            saved: false
        });
    };

    // Check if any filter is active (for highlighting the filter button)
    const isAnyFilterActive = () => {
        return (
            filters.sector !== "" ||
            filters.region !== "" ||
            filters.date !== "" ||
            filters.cpvCode !== "" ||
            filters.active === false ||
            filters.recommended === true ||
            filters.viewed === true ||
            filters.saved === true
        );
    };

    return (
        <div className="w-full px-4 sm:px-6 mb-6 max-w-full overflow-hidden">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs w-full">
                <div className="p-4 sm:p-6">
                    {/* Main search bar */}
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 py-3 pr-3 border border-gray-300 dark:border-gray-700 rounded-md 
                                    bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white 
                                    focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Zoek op trefwoord, organisatie, of omschrijving..."
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
                            >
                                Zoeken
                            </Button>
                        </div>

                        {/* Advanced filters toggle */}
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`text-sm flex items-center gap-1 ${isAnyFilterActive() ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'}`}
                            >
                                <FilterIcon size={14} />
                                <span>{showAdvancedFilters ? "Verberg filters" : "Toon filters"}</span>
                                {isAnyFilterActive() && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full">
                                        Actief
                                    </span>
                                )}
                            </button>

                            {!isPremium && (
                                <div className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <LockIcon size={12} />
                                    <span>Sommige filters alleen beschikbaar voor Premium</span>
                                </div>
                            )}
                        </div>

                        {/* Advanced filters - Conditionally rendered */}
                        {showAdvancedFilters && (
                            <div className="mt-4 space-y-4">
                                {/* Boolean filters - Active, Recommended, Viewed, Saved */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => toggleBooleanFilter('active')}
                                        variant={filters.active ? "default" : "secondary"}
                                        className="flex items-center gap-1.5 text-sm"
                                    >
                                        <CheckCircleIcon size={14} />
                                        <span>Alleen actieve</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => toggleBooleanFilter('recommended')}
                                        variant={filters.recommended ? "default" : "secondary"}
                                        className="flex items-center gap-1.5 text-sm"
                                    >
                                        <StarIcon size={14} className={filters.recommended ? "text-amber-300" : ""} />
                                        <span>Aanbevolen</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => toggleBooleanFilter('viewed')}
                                        variant={filters.viewed ? "default" : "secondary"}
                                        className="flex items-center gap-1.5 text-sm"
                                    >
                                        <Eye size={14} />
                                        <span>Bekeken</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => toggleBooleanFilter('saved')}
                                        variant={filters.saved ? "default" : "secondary"}
                                        className="flex items-center gap-1.5 text-sm"
                                    >
                                        <BookmarkCheck size={14} />
                                        <span>Opgeslagen</span>
                                    </Button>
                                </div>

                                {/* Extended filters grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                                    {/* Sector filter - available to all */}
                                    <div>
                                        <label htmlFor="sector" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                            <TagIcon size={12} />
                                            <span>Sector</span>
                                        </label>
                                        <select
                                            id="sector"
                                            name="sector"
                                            value={filters.sector}
                                            onChange={handleFilterChange}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                        >
                                            <option value="">Alle sectoren</option>
                                            <option value="45000000">Bouwwerkzaamheden</option>
                                            <option value="72000000">IT & Technologie</option>
                                            <option value="85000000">Gezondheidszorg</option>
                                            <option value="80000000">Onderwijs</option>
                                            <option value="71000000">Architectuur en Engineering</option>
                                        </select>
                                    </div>

                                    {/* Region filter - available to all */}
                                    <div>
                                        <label htmlFor="region" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                            <MapPinIcon size={12} />
                                            <span>Regio</span>
                                        </label>
                                        <select
                                            id="region"
                                            name="region"
                                            value={filters.region}
                                            onChange={handleFilterChange}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                        >
                                            <option value="">Alle regio's</option>
                                            <option value="BE21">Antwerpen</option>
                                            <option value="BE10">Brussel</option>
                                            <option value="BE22">Limburg</option>
                                            <option value="BE23">Oost-Vlaanderen</option>
                                            <option value="BE24">Vlaams-Brabant</option>
                                            <option value="BE25">West-Vlaanderen</option>
                                        </select>
                                    </div>

                                    {/* Date filter - premium indicator */}
                                    <div className="relative">
                                        <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                            <CalendarIcon size={12} />
                                            <span>Datum</span>
                                            {!isPremium && <StarIcon size={10} className="text-amber-500" />}
                                        </label>
                                        <select
                                            id="date"
                                            name="date"
                                            value={filters.date}
                                            onChange={handleFilterChange}
                                            disabled={!isPremium}
                                            className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white ${!isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Alle datums</option>
                                            <option value="7d">Afgelopen 7 dagen</option>
                                            <option value="30d">Afgelopen 30 dagen</option>
                                            <option value="90d">Afgelopen 90 dagen</option>
                                        </select>
                                        {!isPremium && (
                                            <div className="absolute right-3 top-1/2 transform translate-y-1 opacity-80">
                                                <LockIcon size={12} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* CPV Code filter - premium indicator */}
                                    <div className="relative">
                                        <label htmlFor="cpvCode" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                            <CodeIcon size={12} />
                                            <span>CPV Code</span>
                                            {!isPremium && <StarIcon size={10} className="text-amber-500" />}
                                        </label>
                                        <input
                                            type="text"
                                            id="cpvCode"
                                            name="cpvCode"
                                            value={filters.cpvCode}
                                            onChange={handleFilterChange}
                                            disabled={!isPremium}
                                            placeholder={isPremium ? "Bijv. 72000000" : "Premium functie"}
                                            className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white ${!isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                        {!isPremium && (
                                            <div className="absolute right-3 top-1/2 transform translate-y-1 opacity-80">
                                                <LockIcon size={12} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-end gap-2 pt-3">
                                    <Button
                                        type="button"
                                        onClick={handleReset}
                                        variant="secondary"
                                        className="text-sm"
                                    >
                                        Filters wissen
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                    >
                                        Toepassen
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Premium feature explanation */}
                        {showAdvancedFilters && !isPremium && (
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <StarIcon size={10} className="text-amber-500" />
                                <span>Premium functies geven u toegang tot geavanceerde filters en meer nauwkeurige zoekresultaten</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
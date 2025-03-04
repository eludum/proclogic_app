"use client"
import { Button } from "@/components/Button";
import { FilterIcon, LockIcon, SearchIcon, StarIcon } from "lucide-react";
import { useState } from "react";

export default function Search({ isPremium = false }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Only for display - actual filtering would happen on form submit or API call
    const [filters, setFilters] = useState({
        sector: "",
        region: "",
        date: "",
        cpvCode: ""
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // In a real implementation, this would trigger an API call with the search parameters
        console.log("Search with:", { searchTerm, filters });
    };

    return (
        <div className="mx-4 sm:mx-6 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
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
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <FilterIcon size={14} />
                                <span>{showAdvancedFilters ? "Verberg filters" : "Toon filters"}</span>
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
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Sector filter - available to all */}
                                <div>
                                    <label htmlFor="sector" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Sector
                                    </label>
                                    <select
                                        id="sector"
                                        name="sector"
                                        value={filters.sector}
                                        onChange={handleFilterChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">Alle sectoren</option>
                                        <option value="it">IT & Technologie</option>
                                        <option value="healthcare">Gezondheidszorg</option>
                                        <option value="construction">Bouw & Infrastructuur</option>
                                        <option value="education">Onderwijs</option>
                                    </select>
                                </div>

                                {/* Region filter - available to all */}
                                <div>
                                    <label htmlFor="region" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Regio
                                    </label>
                                    <select
                                        id="region"
                                        name="region"
                                        value={filters.region}
                                        onChange={handleFilterChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">Alle regio's</option>
                                        <option value="noord-holland">Noord-Holland</option>
                                        <option value="zuid-holland">Zuid-Holland</option>
                                        <option value="utrecht">Utrecht</option>
                                        <option value="gelderland">Gelderland</option>
                                    </select>
                                </div>

                                {/* Date filter - premium indicator */}
                                <div className="relative">
                                    <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                        Datum
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
                                        CPV Code
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
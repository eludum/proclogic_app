"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { BookmarkCheck, BookmarkPlus, CalendarIcon, CheckCircleIcon, CodeIcon, Eye, Filter, MapPinIcon, SearchIcon, Star, TagIcon, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";
import { Pagination } from "./Pagination";
import { PublicationCard } from "./PublicationCard";

const API_BASE_URL = siteConfig.api_base_url;

export default function PublicationList({
    initialPublications,
    isSearchPage = false,
    isSavedPage = false,
    isOverviewPage = false
}) {
    // State for publications data
    const [activeChatPublication, setActiveChatPublication] = useState(null);
    const [savingPublications, setSavingPublications] = useState({});
    const [unsavingPublications, setUnsavingPublications] = useState({});
    const [publicationsList, setPublicationsList] = useState(initialPublications?.items || []);
    const [pagination, setPagination] = useState({
        page: initialPublications?.page || 1,
        size: initialPublications?.size || 10,
        total: initialPublications?.total || 0,
        pages: initialPublications?.pages || 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // State for filters - set defaults based on page type
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState(() => {
        if (isSavedPage) {
            return {
                recommended: false,
                viewed: false,
                saved: true, // Default for saved page
                active: true
            };
        } else if (isOverviewPage) {
            return {
                recommended: true, // Default for overview page
                viewed: false,
                saved: false,
                active: true
            };
        } else {
            return {
                recommended: false,
                viewed: false,
                saved: false,
                active: true
            };
        }
    });

    // Advanced filters for search page - changed to use arrays for multi-selection
    const [advancedFilters, setAdvancedFilters] = useState({
        sector: [],
        region: [],
        date: "",
        cpvCode: ""
    });

    const [showFilters, setShowFilters] = useState(true);
    const [shouldFetch, setShouldFetch] = useState(false);

    const { getToken } = useAuth();
    const { toast } = useToast();

    // Update createQueryParams to handle arrays
    const createQueryParams = useCallback(() => {
        const params = new URLSearchParams({
            page: pagination.page.toString(),
            size: pagination.size.toString()
        });

        // Add boolean filters
        if (activeFilters.active !== undefined) params.append('active', activeFilters.active.toString());
        if (activeFilters.recommended) params.append('recommended', 'true');
        if (activeFilters.viewed) params.append('viewed', 'true');
        if (activeFilters.saved) params.append('saved', 'true');

        // Add search term if present
        if (isSearchPage && searchTerm.trim()) params.append('search_term', searchTerm.trim());

        // Add advanced filters - handling arrays
        advancedFilters.sector.forEach(value => {
            if (value) params.append('sector', value);
        });

        advancedFilters.region.forEach(value => {
            if (value) params.append('region', value);
        });

        // Date handling
        if (advancedFilters.date) {
            const today = new Date();
            if (advancedFilters.date === "7d") {
                const dateFrom = new Date(today);
                dateFrom.setDate(today.getDate() - 7);
                params.append('date_from', dateFrom.toISOString().split('T')[0]);
            } else if (advancedFilters.date === "30d") {
                const dateFrom = new Date(today);
                dateFrom.setDate(today.getDate() - 30);
                params.append('date_from', dateFrom.toISOString().split('T')[0]);
            } else if (advancedFilters.date === "90d") {
                const dateFrom = new Date(today);
                dateFrom.setDate(today.getDate() - 90);
                params.append('date_from', dateFrom.toISOString().split('T')[0]);
            }
        }

        if (advancedFilters.cpvCode) params.append('cpv_code', advancedFilters.cpvCode);

        return params;
    }, [pagination.page, pagination.size, activeFilters, searchTerm, advancedFilters, isSearchPage]);

    // Update the fetchPublications function
    const fetchPublications = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const token = await getToken();

            // Update page in query params
            const params = createQueryParams();
            params.set('page', page.toString());

            const endpoint = `${API_BASE_URL}/publications/`;
            const url = `${endpoint}?${params.toString()}`;

            console.log('Fetching publications with URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Received data:', data);
                setPublicationsList(data.items || []);
                setPagination({
                    page: data.page || 1,
                    size: data.size || 10,
                    total: data.total || 0,
                    pages: data.pages || 0
                });
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch publications:', errorText);
                toast({
                    title: "Fout bij laden",
                    description: "De aanbestedingen konden niet worden geladen. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error fetching publications:', error);
            toast({
                title: "Fout bij laden",
                description: "Er is een fout opgetreden bij het laden van aanbestedingen.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
            setShouldFetch(false);
        }
    }, [createQueryParams, getToken, toast]);

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fixed effect for filter changes - using shouldFetch flag
    useEffect(() => {
        if (shouldFetch) {
            fetchPublications(1);
        }
    }, [shouldFetch, fetchPublications]);

    // Effect to set the shouldFetch flag when filters change
    useEffect(() => {
        // Skip the initial render
        if (initialPublications && !shouldFetch) {
            return;
        }

        setShouldFetch(true);
    }, [activeFilters, advancedFilters]);

    // Create debounced fetch function for text search
    const debouncedFetch = useCallback(
        debounce(() => {
            setShouldFetch(true);
        }, 500),
        []
    );

    // Effect for search term changes - debounced
    useEffect(() => {
        if (isSearchPage && searchTerm.trim() !== "") {
            debouncedFetch();
        }
    }, [searchTerm, debouncedFetch, isSearchPage]);

    // Reset filters based on page type
    const resetFilters = () => {
        setSearchTerm("");

        if (isSavedPage) {
            setActiveFilters({
                recommended: false,
                viewed: false,
                saved: true,
                active: true
            });
        } else if (isOverviewPage) {
            setActiveFilters({
                recommended: true,
                viewed: false,
                saved: false,
                active: true
            });
        } else {
            setActiveFilters({
                recommended: false,
                viewed: false,
                saved: false,
                active: true
            });
        }

        // Reset advanced filters
        setAdvancedFilters({
            sector: [],
            region: [],
            date: "",
            cpvCode: ""
        });

        // Trigger fetch with reset filters
        setShouldFetch(true);
    };

    // Toggle a filter
    const toggleFilter = (filter) => {
        // Special case for saved page
        if (isSavedPage && filter === 'saved') {
            // Don't allow turning off the saved filter on the saved page
            return;
        }

        setActiveFilters(prev => ({
            ...prev,
            [filter]: !prev[filter]
        }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchPublications(newPage);
        }
    };

    // Handlers for multi-select filters
    const handleSectorChange = (value) => {
        setAdvancedFilters(prev => {
            if (value === "") {
                return { ...prev, sector: [] };
            }

            if (prev.sector.includes(value)) {
                return { ...prev, sector: prev.sector.filter(item => item !== value) };
            } else {
                return { ...prev, sector: [...prev.sector, value] };
            }
        });
    };

    const handleRegionChange = (value) => {
        setAdvancedFilters(prev => {
            if (value === "") {
                return { ...prev, region: [] };
            }

            if (prev.region.includes(value)) {
                return { ...prev, region: prev.region.filter(item => item !== value) };
            } else {
                return { ...prev, region: [...prev.region, value] };
            }
        });
    };

    // Regular advanced filter change handler
    const handleAdvancedFilterChange = (e) => {
        const { name, value } = e.target;
        setAdvancedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Start a chat with a publication
    const startChat = (publication) => {
        setActiveChatPublication(publication);
    };

    // Save a publication
    const savePublication = async (publication) => {
        setSavingPublications(prev => ({ ...prev, [publication.workspace_id]: true }));

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: true }
                            : pub
                    )
                );

                toast({
                    title: "Opgeslagen!",
                    description: "Aanbesteding is opgeslagen in uw lijst.",
                    variant: "success"
                });

                // Refresh the list if "saved" filter is active
                if (activeFilters.saved) {
                    setShouldFetch(true);
                }
            } else {
                console.error('Failed to save publication:', await response.text());
                toast({
                    title: "Fout bij opslaan",
                    description: "De aanbesteding kon niet worden opgeslagen. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error saving publication:', error);
            toast({
                title: "Fout bij opslaan",
                description: "Er is een fout opgetreden bij het opslaan van de aanbesteding.",
                variant: "error"
            });
        } finally {
            setSavingPublications(prev => ({ ...prev, [publication.workspace_id]: false }));
        }
    };

    // Unsave a publication
    const unsavePublication = async (publication) => {
        setUnsavingPublications(prev => ({ ...prev, [publication.workspace_id]: true }));

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/unsave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: false }
                            : pub
                    )
                );

                toast({
                    title: "Verwijderd",
                    description: "Aanbesteding is verwijderd uit uw lijst.",
                    variant: "info"
                });

                // Refresh the list if "saved" filter is active or on saved page
                if (activeFilters.saved || isSavedPage) {
                    setShouldFetch(true);
                }
            } else {
                console.error('Failed to unsave publication:', await response.text());
                toast({
                    title: "Fout bij verwijderen",
                    description: "De aanbesteding kon niet worden verwijderd. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error unsaving publication:', error);
            toast({
                title: "Fout bij verwijderen",
                description: "Er is een fout opgetreden bij het verwijderen van de aanbesteding.",
                variant: "error"
            });
        } finally {
            setUnsavingPublications(prev => ({ ...prev, [publication.workspace_id]: false }));
        }
    };

    // Mark publication as viewed
    const markAsViewed = async (publication) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/viewed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_viewed: true }
                            : pub
                    )
                );

                // Refresh the list if "viewed" filter is active
                if (activeFilters.viewed) {
                    setShouldFetch(true);
                }
            }
        } catch (error) {
            console.error('Error marking publication as viewed:', error);
        }
    };

    // Sort publications to show recommended ones first
    const sortedPublications = [...publicationsList].sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        return 0;
    });

    return (
        <>
            <Toaster />

            {/* Search and filter bar */}
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                        {Object.values(activeFilters).some(f => f) && (
                            <span className="bg-white text-astral-600 text-xs px-1.5 py-0.5 rounded-full">
                                {Object.values(activeFilters).filter(Boolean).length}
                            </span>
                        )}
                    </Button>

                    {/* Reset filters button - only show if filters are active */}
                    {(isSearchPage && searchTerm ||
                        (isSearchPage && (advancedFilters.sector.length > 0 || advancedFilters.region.length > 0 || advancedFilters.date || advancedFilters.cpvCode)) ||
                        Object.entries(activeFilters).some(([key, value]) =>
                            // Only consider it active if it's different from default
                            (isSavedPage && key === 'saved' && value === true) ? false :
                                (isOverviewPage && key === 'recommended' && value === true) ? false :
                                    (key === 'active' && value === true) ? false :
                                        value
                        )
                    ) && (
                            <Button
                                onClick={resetFilters}
                                variant="secondary"
                                className="text-sm"
                            >
                                Reset filters
                            </Button>
                        )}
                </div>

                {/* Filter options - conditionally rendered */}
                {showFilters && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        {/* Always show these general filters */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => toggleFilter('active')}
                                variant={activeFilters.active ? "default" : "secondary"}
                                className="flex items-center gap-1.5 text-sm"
                            >
                                <CheckCircleIcon size={14} />
                                <span>Alleen actieve</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => toggleFilter('recommended')}
                                variant={activeFilters.recommended ? "default" : "secondary"}
                                className="flex items-center gap-1.5 text-sm"
                            >
                                <Star size={14} className={activeFilters.recommended ? "text-amber-300" : ""} />
                                <span>Aanbevolen</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => toggleFilter('viewed')}
                                variant={activeFilters.viewed ? "default" : "secondary"}
                                className="flex items-center gap-1.5 text-sm"
                            >
                                <Eye size={14} />
                                <span>Bekeken</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => toggleFilter('saved')}
                                variant={activeFilters.saved ? "default" : "secondary"}
                                disabled={isSavedPage} // Disable on saved page
                                className={`flex items-center gap-1.5 text-sm ${isSavedPage ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {activeFilters.saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                                <span>Opgeslagen</span>
                            </Button>
                        </div>

                        {/* Advanced filters only for search page */}
                        {isSearchPage && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                {/* Sector filter - modified for multi-select */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                        <TagIcon size={12} />
                                        <span>Sector</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[
                                            { value: "45000000", label: "Bouwwerkzaamheden" },
                                            { value: "72000000", label: "IT & Technologie" },
                                            { value: "85000000", label: "Gezondheidszorg" },
                                            { value: "80000000", label: "Onderwijs" },
                                            { value: "71000000", label: "Architectuur en Engineering" }
                                        ].map(sector => (
                                            <Button
                                                key={sector.value}
                                                type="button"
                                                onClick={() => handleSectorChange(sector.value)}
                                                variant={advancedFilters.sector.includes(sector.value) ? "default" : "secondary"}
                                                className="flex items-center gap-1 text-xs py-1 px-2"
                                            >
                                                {sector.label}
                                            </Button>
                                        ))}
                                        {advancedFilters.sector.length > 0 && (
                                            <Button
                                                type="button"
                                                onClick={() => setAdvancedFilters(prev => ({ ...prev, sector: [] }))}
                                                variant="destructive"
                                                className="flex items-center gap-1 text-xs py-1 px-2"
                                            >
                                                <X size={12} />
                                                <span>Wis selectie</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Region filter - modified for multi-select */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                        <MapPinIcon size={12} />
                                        <span>Regio</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[
                                            { value: "BE21", label: "Antwerpen" },
                                            { value: "BE10", label: "Brussel" },
                                            { value: "BE22", label: "Limburg" },
                                            { value: "BE23", label: "Oost-Vlaanderen" },
                                            { value: "BE24", label: "Vlaams-Brabant" },
                                            { value: "BE25", label: "West-Vlaanderen" }
                                        ].map(region => (
                                            <Button
                                                key={region.value}
                                                type="button"
                                                onClick={() => handleRegionChange(region.value)}
                                                variant={advancedFilters.region.includes(region.value) ? "default" : "secondary"}
                                                className="flex items-center gap-1 text-xs py-1 px-2"
                                            >
                                                {region.label}
                                            </Button>
                                        ))}
                                        {advancedFilters.region.length > 0 && (
                                            <Button
                                                type="button"
                                                onClick={() => setAdvancedFilters(prev => ({ ...prev, region: [] }))}
                                                variant="destructive"
                                                className="flex items-center gap-1 text-xs py-1 px-2"
                                            >
                                                <X size={12} />
                                                <span>Wis selectie</span>
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
                                        name="date"
                                        value={advancedFilters.date}
                                        onChange={handleAdvancedFilterChange}
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
                                        name="cpvCode"
                                        value={advancedFilters.cpvCode}
                                        onChange={handleAdvancedFilterChange}
                                        placeholder="Bijv. 72000000"
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ?
                    "Aanbestedingen laden..." : (
                        <>
                            {`${pagination.total} aanbestedingen gevonden${isSearchPage && searchTerm ? ` voor "${searchTerm}"` : ''}`}
                        </>
                    )
                }
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <Loader loadingtext={"Laden..."} size={32} />
                ) : sortedPublications.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Geen aanbestedingen gevonden</p>
                        {(isSearchPage && searchTerm ||
                            (isSearchPage && (advancedFilters.sector.length > 0 || advancedFilters.region.length > 0 || advancedFilters.date || advancedFilters.cpvCode)) ||
                            Object.values(activeFilters).some(f => f && f !== activeFilters.active)
                        ) && (
                                <Button
                                    onClick={resetFilters}
                                    variant="secondary"
                                    className="mt-2"
                                >
                                    Filters wissen
                                </Button>
                            )}
                    </div>
                ) : (
                    <>
                        {sortedPublications.map((publication, index) => (
                            <PublicationCard
                                key={publication.workspace_id || index}
                                publication={publication}
                                onStartChat={startChat}
                                onSave={savePublication}
                                onUnsave={unsavePublication}
                                onMarkAsViewed={markAsViewed}
                                isSaving={savingPublications[publication.workspace_id]}
                                isUnsaving={unsavingPublications[publication.workspace_id]}
                            />
                        ))}

                        {/* Pagination Controls */}
                        {pagination.pages > 1 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                totalItems={pagination.total}
                                onPageChange={handlePageChange}
                                isLoading={isLoading}
                            />
                        )}
                    </>
                )}

                {/* Chat dialog */}
                {activeChatPublication && (
                    <ChatComponent
                        publicationId={activeChatPublication.workspace_id}
                        onClose={() => setActiveChatPublication(null)}
                    />
                )}
            </div>
        </>
    );
}
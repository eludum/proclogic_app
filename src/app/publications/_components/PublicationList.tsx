"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { BookmarkCheck, BookmarkPlus, CheckCircleIcon, Eye, Filter, SearchIcon, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";
import { Pagination } from "./Pagination";
import { PublicationCard } from "./PublicationCard";

const API_BASE_URL = siteConfig.api_base_url;

export default function PublicationList({ initialPublications, isSearchPage = false, isSavedPage = false }) {
    // State for publications data
    const [activeChatPublication, setActiveChatPublication] = useState(null);
    const [savingPublications, setSavingPublications] = useState({});
    const [unsavingPublications, setUnsavingPublications] = useState({});
    const [publicationsList, setPublicationsList] = useState(initialPublications.items || []);
    const [allPublications, setAllPublications] = useState(initialPublications.items || []);
    const [pagination, setPagination] = useState({
        page: initialPublications.page || 1,
        size: initialPublications.size || 10,
        total: initialPublications.total || 0,
        pages: initialPublications.pages || 0
    });
    const [localPagination, setLocalPagination] = useState({
        page: 1,
        size: 10,
        total: 0,
        pages: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isServerPaginated, setIsServerPaginated] = useState(true);

    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        recommended: true, // Set recommended filter to true by default
        viewed: false,
        saved: false,
        active: true // Active filter on by default
    });
    const [showFilters, setShowFilters] = useState(true);

    const { getToken } = useAuth();
    const { toast } = useToast();

    const applyFilters = useCallback((publications = allPublications, search = searchTerm, filters = activeFilters) => {
        let filteredList = [...publications];

        // Apply text search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filteredList = filteredList.filter(pub =>
                pub.title?.toLowerCase().includes(searchLower) ||
                pub.original_description?.toLowerCase().includes(searchLower) ||
                pub.organisation?.toLowerCase().includes(searchLower) ||
                pub.sector?.toLowerCase().includes(searchLower)
            );
        }

        // Apply other filters
        if (filters.recommended) {
            filteredList = filteredList.filter(pub => pub.is_recommended);
        }

        if (filters.viewed) {
            filteredList = filteredList.filter(pub => pub.is_viewed);
        }

        if (filters.saved) {
            filteredList = filteredList.filter(pub => pub.is_saved);
        }

        if (filters.active) {
            filteredList = filteredList.filter(pub => pub.is_active);
        }

        return filteredList;
    }, [allPublications]);

    // Apply pagination to filtered list
    const applyPagination = useCallback((filteredList, page = localPagination.page, pageSize = localPagination.size) => {
        const total = filteredList.length;
        const pages = Math.ceil(total / pageSize) || 1; // Ensure at least 1 page

        // Update local pagination info
        setLocalPagination(prev => ({
            ...prev,
            total,
            pages,
            page: page > pages ? 1 : page // Make sure page is valid
        }));

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredList.slice(startIndex, endIndex);
    }, []);

    useEffect(() => {
        // Determine if we should use server or client pagination
        const hasNonActiveFilter = searchTerm.trim() ||
            activeFilters.recommended ||
            activeFilters.viewed ||
            activeFilters.saved ||
            !activeFilters.active;

        const shouldUseServerPagination = !hasNonActiveFilter;
        setIsServerPaginated(shouldUseServerPagination);

        // If any filter is active and we haven't loaded all publications yet, fetch them all
        if (hasNonActiveFilter && allPublications.length <= pagination.size) {
            fetchAllPublications();
        } else {
            // Get the filtered list - passing current search term and filters explicitly
            const filteredList = applyFilters(allPublications, searchTerm, activeFilters);

            // Update pagination info for client-side filtering
            if (!shouldUseServerPagination) {
                const total = filteredList.length;
                const pages = Math.ceil(total / localPagination.size) || 1;

                // Update local pagination with new totals but keep current page if possible
                setLocalPagination(prev => ({
                    ...prev,
                    total,
                    pages,
                    // Reset to page 1 if current page would be out of bounds
                    page: prev.page > pages ? 1 : prev.page
                }));

                // Apply pagination
                // Use applyPagination to get paginated list
                const paginatedList = applyPagination(filteredList);
                setPublicationsList(paginatedList);
            } else {
                // For server-side pagination, use the whole filtered list from current server page
                setPublicationsList(filteredList);
            }
        }
    }, [
        searchTerm,
        activeFilters,
        applyFilters,
        applyPagination,
        localPagination.page, // Re-apply pagination when page changes
        allPublications // Re-run when allPublications changes
    ]);

    // Fetch publications for a specific page
    const fetchPublications = async (page = 1) => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/?page=${page}&size=${pagination.size}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllPublications(data.items || []);
                setPagination({
                    page: data.page || 1,
                    size: data.size || 10,
                    total: data.total || 0,
                    pages: data.pages || 0
                });
                setPublicationsList(data.items || []);
            } else {
                console.error('Failed to fetch publications:', await response.text());
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
        }
    };

    // Fetch all publications for filtering
    const fetchAllPublications = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();

            // First, get total count to determine how many pages to fetch
            const countResponse = await fetch(`${API_BASE_URL}/publications/?page=1&size=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!countResponse.ok) {
                throw new Error(`API error: ${countResponse.status}`);
            }

            const countData = await countResponse.json();
            const totalItems = countData.total;
            const pageSize = 50; // Larger page size for bulk fetching
            const totalPages = Math.ceil(totalItems / pageSize);

            // Fetch all pages
            const allItems = [];
            const fetchPromises = [];

            for (let page = 1; page <= totalPages; page++) {
                fetchPromises.push(
                    fetch(`${API_BASE_URL}/publications/?page=${page}&size=${pageSize}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }).then(resp => {
                        if (!resp.ok) throw new Error(`API error on page ${page}: ${resp.status}`);
                        return resp.json();
                    }).then(data => {
                        allItems.push(...(data.items || []));
                    })
                );
            }

            // Wait for all fetches to complete
            await Promise.all(fetchPromises);

            // Update state with all items
            setAllPublications(allItems);

            // Apply filters to get filtered list
            const filteredList = applyFilters(allItems, searchTerm, activeFilters);

            // Set up pagination and update publications list
            const paginatedList = applyPagination(filteredList, 1, localPagination.size);
            setPublicationsList(paginatedList);

        } catch (error) {
            console.error('Error fetching all publications:', error);
            toast({
                title: "Fout bij laden",
                description: "Niet alle aanbestedingen konden worden geladen. Filtering werkt mogelijk onvolledig.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Reset filters
    const resetFilters = () => {
        // Reset search term
        setSearchTerm("");

        // Reset filters with recommended true by default
        const newFilters = {
            recommended: true,
            viewed: false,
            saved: false,
            active: true
        };
        setActiveFilters(newFilters);

        // Update to server pagination
        setIsServerPaginated(true);

        // Apply the filters
        const filteredList = applyFilters(allPublications, "", newFilters);
        const total = filteredList.length;
        const pages = Math.ceil(total / 10) || 1;

        // Reset local pagination
        setLocalPagination({
            page: 1,
            size: 10,
            total: total,
            pages: pages
        });

        // Fetch publications from first page
        fetchPublications(1);
    };

    // Toggle a filter and fetch all publications if needed
    const toggleFilter = (filter) => {
        const newValue = !activeFilters[filter];

        // Update filters state
        const newFilters = {
            ...activeFilters,
            [filter]: newValue
        };
        setActiveFilters(newFilters);

        // Determine if we need to use server or client pagination after this change
        const willHaveNonActiveFilter = searchTerm.trim() ||
            newFilters.recommended ||
            newFilters.viewed ||
            newFilters.saved ||
            !newFilters.active;

        const willUseServerPagination = !willHaveNonActiveFilter;

        // If turning on any filter or turning off the only active filter, fetch all publications
        if ((newValue || !willHaveNonActiveFilter) && allPublications.length <= pagination.size) {
            fetchAllPublications();
        } else {
            // Apply filters with the new filter state
            const filteredList = applyFilters(allPublications, searchTerm, newFilters);

            // Update pagination info
            if (!willUseServerPagination) {
                const total = filteredList.length;
                const pages = Math.ceil(total / localPagination.size) || 1;

                setLocalPagination(prev => ({
                    ...prev,
                    page: 1,
                    total,
                    pages
                }));

                // Apply pagination for client-side
                const startIndex = 0; // page 1
                const endIndex = localPagination.size;
                setPublicationsList(filteredList.slice(startIndex, endIndex));
            } else {
                // For server pagination, fetch first page
                fetchPublications(1);
            }
        }
    };

    // Handle page change - choose between server and client pagination
    const handlePageChange = (newPage) => {
        const hasNonActiveFilter = searchTerm.trim() ||
            activeFilters.recommended ||
            activeFilters.viewed ||
            activeFilters.saved ||
            !activeFilters.active;

        const useServerPagination = !hasNonActiveFilter;

        if (useServerPagination) {
            // Server-side pagination
            if (newPage >= 1 && newPage <= pagination.pages) {
                fetchPublications(newPage);
            }
        } else {
            // Client-side pagination - update page and apply pagination manually
            if (newPage >= 1 && newPage <= localPagination.pages) {
                setLocalPagination(prev => ({
                    ...prev,
                    page: newPage
                }));

                // Apply pagination immediately to prevent UI lag
                const filteredList = applyFilters();
                const startIndex = (newPage - 1) * localPagination.size;
                const endIndex = startIndex + localPagination.size;
                setPublicationsList(filteredList.slice(startIndex, endIndex));
            }
        }
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
                // Update both lists with the saved publication
                const updatePublication = (pubList) =>
                    pubList.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: true }
                            : pub
                    );

                setPublicationsList(updatePublication(publicationsList));
                setAllPublications(updatePublication(allPublications));

                toast({
                    title: "Opgeslagen!",
                    description: "Aanbesteding is opgeslagen in uw lijst.",
                    variant: "success"
                });

                // Reapply filters if necessary
                const filteredList = applyFilters(updatePublication(allPublications));
                if (!isServerPaginated) {
                    setPublicationsList(applyPagination(filteredList));
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
                // Update both lists with the unsaved publication
                const updatePublication = (pubList) =>
                    pubList.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: false }
                            : pub
                    );

                setPublicationsList(updatePublication(publicationsList));
                setAllPublications(updatePublication(allPublications));

                toast({
                    title: "Verwijderd",
                    description: "Aanbesteding is verwijderd uit uw lijst.",
                    variant: "info"
                });

                // Reapply filters if necessary
                const filteredList = applyFilters(updatePublication(allPublications));
                if (!isServerPaginated) {
                    setPublicationsList(applyPagination(filteredList));
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
                // Update both lists with the viewed publication
                const updatePublication = (pubList) =>
                    pubList.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_viewed: true }
                            : pub
                    );

                setPublicationsList(updatePublication(publicationsList));
                setAllPublications(updatePublication(allPublications));

                // Reapply filters if necessary
                const filteredList = applyFilters(updatePublication(allPublications));
                if (!isServerPaginated) {
                    setPublicationsList(applyPagination(filteredList));
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
                    {/* Search input - Only show in search page */}
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
                    {(searchTerm || Object.values(activeFilters).some(f => f && f !== activeFilters.active)) && (
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
                    <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <Button
                            onClick={() => toggleFilter('active')}
                            variant={activeFilters.active ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <CheckCircleIcon size={14} />
                            <span>Alleen actieve</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('recommended')}
                            variant={activeFilters.recommended ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Star size={14} className={activeFilters.recommended ? "text-amber-300" : ""} />
                            <span>Aanbevolen</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('viewed')}
                            variant={activeFilters.viewed ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Eye size={14} />
                            <span>Bekeken</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('saved')}
                            variant={activeFilters.saved ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            {activeFilters.saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                            <span>Opgeslagen</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ?
                    "Aanbestedingen laden..." : (
                        <>
                            {`${isServerPaginated ? pagination.total : localPagination.total} aanbestedingen gevonden${searchTerm ? ` voor "${searchTerm}"` : ''}`}

                            {(Object.entries(activeFilters).some(([key, value]) => value && key !== 'active') ||
                                (activeFilters.active && Object.values(activeFilters).filter(Boolean).length === 1)) && (
                                    <span> (Gefilterd op: {Object.entries(activeFilters)
                                        .filter(([key, value]) => value)
                                        .map(([key]) =>
                                            key === 'recommended' ? 'aanbevolen' :
                                                key === 'viewed' ? 'bekeken' :
                                                    key === 'saved' ? 'opgeslagen' :
                                                        key === 'active' ? 'alleen actieve' : ''
                                        )
                                        .filter(text => text) // Remove any empty strings
                                        .join(', ')})
                                    </span>
                                )}
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
                        {(searchTerm || Object.values(activeFilters).some(f => f && f !== activeFilters.active)) && (
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

                        {/* Pagination Controls - Always show pagination (server or client) */}
                        {isServerPaginated ? (
                            pagination.pages > 1 && (
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    totalItems={pagination.total}
                                    onPageChange={handlePageChange}
                                    isLoading={isLoading}
                                />
                            )
                        ) : (
                            localPagination.pages > 1 && (
                                <Pagination
                                    currentPage={localPagination.page}
                                    totalPages={localPagination.pages}
                                    totalItems={localPagination.total}
                                    onPageChange={handlePageChange}
                                    isLoading={isLoading}
                                />
                            )
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
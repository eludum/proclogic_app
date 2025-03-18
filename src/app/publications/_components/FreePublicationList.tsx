"use client"
import { siteConfig } from "@/app/siteConfig";
import { formatDate } from "@/lib/publicationUtils";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, CodeIcon, MapPinIcon, TagIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from "react";
import FreeFilterCard from "./FreeFilterCard";
import { Pagination } from "./Pagination";

const API_BASE_URL = siteConfig.api_base_url;

export default function FreePublicationList({ initialPublications }) {
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [publications, setPublications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({
        searchTerm: "",
        sectorFilters: [],
        regionFilters: []
    });

    // Track if this is the initial load
    const isInitialLoad = useRef(true);
    // Track current API request to cancel if another is made
    const currentRequestController = useRef(null);

    // Initialize state from initialPublications prop
    useEffect(() => {
        if (initialPublications) {
            setPublications(initialPublications.items || []);
            setCurrentPage(initialPublications.page || 1);
            setTotalPages(initialPublications.pages || 1);
            setTotalItems(initialPublications.total || 0);

            // Extract initial filters from URL if available
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                setCurrentFilters({
                    searchTerm: url.searchParams.get('q') || "",
                    sectorFilters: url.searchParams.getAll('sector') || [],
                    regionFilters: url.searchParams.getAll('region') || []
                });
            }
        }
    }, [initialPublications]);

    // Toggle description expansion for a publication
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Load publications with filters and pagination using useCallback for stable reference
    const loadPublications = useCallback(async (page = 1, filters = currentFilters) => {
        // Skip loading on initial render since we already have server-side data
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        setIsLoading(true);

        // Cancel any in-flight request
        if (currentRequestController.current) {
            currentRequestController.current.abort();
        }

        // Create a new AbortController for this request
        currentRequestController.current = new AbortController();
        const signal = currentRequestController.current.signal;

        try {
            const params = new URLSearchParams();

            // Add pagination params
            params.append('page', page.toString());
            params.append('size', '10'); // Default page size

            // Add search term if present
            if (filters.searchTerm) {
                params.append('q', filters.searchTerm);
            }

            // Add sector filters
            filters.sectorFilters.forEach(sector => {
                params.append('sector', sector);
            });

            // Add region filters
            filters.regionFilters.forEach(region => {
                params.append('region', region);
            });

            // Fetch data from API
            const response = await fetch(`${API_BASE_URL}/publications/free/search/?${params.toString()}`, {
                signal // Pass the abort signal
            });

            if (!response.ok) {
                if (!signal.aborted) {
                    throw new Error(`API error: ${response.status}`);
                }
                return;
            }

            const data = await response.json();

            // Only update state if the request wasn't aborted
            if (!signal.aborted) {
                // Update state with new data
                setPublications(data.items || []);
                setCurrentPage(data.page || 1);
                setTotalPages(data.pages || 1);
                setTotalItems(data.total || 0);

                // Update URL without page reload (for browser history)
                if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);

                    // Reset URL params
                    url.search = '';

                    // Add current filters to URL
                    if (filters.searchTerm) url.searchParams.set('q', filters.searchTerm);
                    if (page > 1) url.searchParams.set('page', page.toString());

                    filters.sectorFilters.forEach(sector => {
                        url.searchParams.append('sector', sector);
                    });

                    filters.regionFilters.forEach(region => {
                        url.searchParams.append('region', region);
                    });

                    // Update URL without reload
                    window.history.pushState({}, '', url.toString());
                }
            }
        } catch (error) {
            // Only log errors if the request wasn't aborted
            if (error.name !== 'AbortError') {
                console.error('Error fetching publications:', error);
            }
        } finally {
            // Only update loading state if the request wasn't aborted
            if (currentRequestController.current && !currentRequestController.current.signal.aborted) {
                setIsLoading(false);
                currentRequestController.current = null;
            }
        }
    }, [currentFilters]);

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !isLoading) {
            setCurrentPage(newPage);
            loadPublications(newPage);
        }
    }, [totalPages, isLoading, loadPublications]);

    // Handle filter changes
    const handleFiltersChange = useCallback((newFilters) => {
        setCurrentFilters(newFilters);
        loadPublications(1, newFilters);
    }, [loadPublications]);

    // Clean up any pending requests on unmount
    useEffect(() => {
        return () => {
            if (currentRequestController.current) {
                currentRequestController.current.abort();
            }
        };
    }, []);

    return (
        <div className="w-full space-y-6">
            {/* Filter component */}
            <FreeFilterCard
                onFiltersChange={handleFiltersChange}
                initialFilters={currentFilters}
            />

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? "Aanbestedingen laden..." : `${totalItems} aanbestedingen gevonden`}
            </div>

            {/* Publications list */}
            <div className="space-y-6">
                {publications.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Geen aanbestedingen gevonden</p>
                    </div>
                ) : (
                    publications.map((publication, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                            {/* Header with status */}
                            <div className={`flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700`}>
                                <div className="flex items-center gap-3">
                                    {/* Status badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${publication.is_active
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        <CheckCircleIcon className="mr-1 inline-block size-3" />
                                        {publication.is_active ? "Actief" : "Inactief"}
                                    </span>
                                </div>
                            </div>

                            {/* Content section */}
                            <div className="p-5">
                                {/* Title */}
                                <div className="mb-4">
                                    <a
                                        target="_blank"
                                        href={`/publications/free/detail/${publication.workspace_id}`}
                                        className="text-lg font-semibold text-astral-600 dark:text-astral-400 hover:underline focus:outline-hidden mb-1 block"
                                    >
                                        <p className="line-clamp-2">{publication.title}</p>
                                    </a>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {publication.workspace_id}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    <p className={expandedDescriptions[publication.workspace_id] ? "" : "line-clamp-2"}>
                                        {publication.original_description}
                                    </p>
                                    {publication.original_description && publication.original_description.length > 150 && (
                                        <button
                                            onClick={() => toggleDescription(publication.workspace_id)}
                                            className="text-astral-600 dark:text-astral-400 mt-1 text-xs font-medium hover:underline focus:outline-hidden"
                                        >
                                            {expandedDescriptions[publication.workspace_id] ? "Minder tonen" : "Meer tonen"}
                                        </button>
                                    )}
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <BuildingIcon size={14} className="text-gray-400" />
                                        <div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400">Organisatie: </span>
                                            <span className="text-gray-800 dark:text-gray-200">{publication.organisation}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <TagIcon size={14} className="text-gray-400" />
                                        <div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400">Sector: </span>
                                            <span className="text-gray-800 dark:text-gray-200">{publication.sector}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CodeIcon size={14} className="text-gray-400" />
                                        <div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400">CPV Code: </span>
                                            <span className="text-gray-800 dark:text-gray-200">{publication.cpv_code}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPinIcon size={14} className="text-gray-400" />
                                        <div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400">Regio: </span>
                                            <span className="text-gray-800 dark:text-gray-200">{publication.region?.join(", ") || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date information */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 mt-4">
                                    <div className="flex items-center gap-2 text-xs text-astral-600 dark:text-astral-400">
                                        <CalendarIcon size={14} />
                                        <span>Gepubliceerd: {formatDate(publication.publication_date)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                        <CalendarIcon size={14} />
                                        <span>Deadline: {formatDate(publication.submission_deadline)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
"use client"

import { siteConfig } from "@/app/siteConfig";
import { formatDate } from "@/lib/publicationUtils";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, CodeIcon, MapPinIcon, TagIcon } from 'lucide-react';
import { useEffect, useState } from "react";
import FreeFilterCard from "./FreeFilterCard";
import { Pagination } from "./Pagination";

const API_BASE_URL = siteConfig.api_base_url;

// Define interfaces for the component
interface Publication {
    workspace_id: string;
    title: string;
    original_description: string;
    is_active: boolean;
    publication_date: string | Date;
    submission_deadline?: string | Date;
    organisation: string;
    sector: string;
    cpv_code: string;
    region?: string[];
}

interface PaginatedResponse {
    items: Publication[];
    page: number;
    pages: number;
    total: number;
}

interface FilterState {
    searchTerm: string;
    sectorFilters: string[];
    regionFilters: string[];
}

interface FreePublicationListProps {
    initialPublications: PaginatedResponse;
}

export default function FreePublicationList({ initialPublications }: FreePublicationListProps) {
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
    const [publications, setPublications] = useState<Publication[]>(initialPublications?.items || []);
    const [currentPage, setCurrentPage] = useState<number>(initialPublications?.page || 1);
    const [totalPages, setTotalPages] = useState<number>(initialPublications?.pages || 1);
    const [totalItems, setTotalItems] = useState<number>(initialPublications?.total || 0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        sectorFilters: [],
        regionFilters: []
    });

    // Toggle description expansion for a publication
    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Load publications from API
    const fetchPublications = async (page: number, filterState: FilterState) => {
        setIsLoading(true);

        try {
            const params = new URLSearchParams();

            // Add pagination
            params.append('page', page.toString());
            params.append('size', '10');

            // Add search term
            if (filterState.searchTerm) {
                params.append('search_term', filterState.searchTerm);
            }

            // Add sector filters
            filterState.sectorFilters.forEach(sector => {
                params.append('sector', sector);
            });

            // Add region filters
            filterState.regionFilters.forEach(region => {
                params.append('region', region);
            });

            // Fetch data
            const response = await fetch(`${API_BASE_URL}/publications/free/search/?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data: PaginatedResponse = await response.json();

            // Update state
            setPublications(data.items || []);
            setCurrentPage(data.page);
            setTotalPages(data.pages);
            setTotalItems(data.total);

            // Update URL for browser history
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);

                // Reset URL params
                url.search = '';

                // Add filters to URL
                if (filterState.searchTerm) url.searchParams.set('q', filterState.searchTerm);
                if (page > 1) url.searchParams.set('page', page.toString());

                filterState.sectorFilters.forEach(sector => {
                    url.searchParams.append('sector', sector);
                });

                filterState.regionFilters.forEach(region => {
                    url.searchParams.append('region', region);
                });

                window.history.pushState({}, '', url.toString());
            }
        } catch (error) {
            console.error('Error fetching publications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle page change from pagination component
    const handlePageChange = (page: number) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchPublications(page, filters);
        }
    };

    // Handle filter changes from filter component
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        // Reset to page 1 when filters change
        setCurrentPage(1);
        fetchPublications(1, newFilters);
    };

    // Initialize filters from URL on first load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const urlFilters: FilterState = {
                searchTerm: url.searchParams.get('q') || "",
                sectorFilters: url.searchParams.getAll('sector') || [],
                regionFilters: url.searchParams.getAll('region') || []
            };

            setFilters(urlFilters);

            // Get page from URL if present
            const pageParam = url.searchParams.get('page');
            if (pageParam) {
                const page = parseInt(pageParam, 10);
                if (!isNaN(page) && page > 0) {
                    setCurrentPage(page);
                }
            }
        }
    }, []);

    return (
        <div className="w-full space-y-6">
            {/* Filter component */}
            <FreeFilterCard
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
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
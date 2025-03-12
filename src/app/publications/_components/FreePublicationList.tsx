"use client"
import { formatDate } from "@/lib/publicationUtils";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, CodeIcon, MapPinIcon, TagIcon } from 'lucide-react';
import { useEffect, useState } from "react";
import FreeFilterCard from "./FreeFilterCard";
import { Pagination } from "./Pagination";

export default function FreePublicationList({ initialPublications }) {
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [filteredinitialPublications, setFilteredinitialPublications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize state from initialPublications prop
    useEffect(() => {
        if (initialPublications) {
            setFilteredinitialPublications(initialPublications.items || []);
            setCurrentPage(initialPublications.page || 1);
            setTotalPages(initialPublications.pages || 1);
            setTotalItems(initialPublications.total || 0);
        }
    }, [initialPublications]);

    // Toggle description expansion for a publication
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle page change with URL param update
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !isLoading) {
            setIsLoading(true);
            // Construct the URL with the new page parameter
            const url = new URL(window.location.href);
            url.searchParams.set('page', newPage);
            window.location.href = url.toString();
        }
    };

    // Handle filter changes
    const handleFiltersChange = (newFilters) => {
        // Build the URL with filter parameters
        const url = new URL(window.location.href);

        // Clear existing params except size
        const size = url.searchParams.get('size') || '10';
        url.search = '';
        url.searchParams.set('size', size);

        // Add search term if present
        if (newFilters.searchTerm) {
            url.searchParams.set('q', newFilters.searchTerm);
        }

        // Add sector filters
        newFilters.sectorFilters.forEach(sector => {
            url.searchParams.append('sector', sector);
        });

        // Add region filters
        newFilters.regionFilters.forEach(region => {
            url.searchParams.append('region', region);
        });

        // Reset to page 1 when applying filters
        url.searchParams.set('page', '1');

        // Navigate to the new URL
        setIsLoading(true);
        window.location.href = url.toString();
    };

    // Parse current URL to get initial filter values
    const getInitialFilters = () => {
        if (typeof window === 'undefined') return { searchTerm: "", sectorFilters: [], regionFilters: [] };

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        return {
            searchTerm: searchParams.get('q') || "",
            sectorFilters: searchParams.getAll('sector') || [],
            regionFilters: searchParams.getAll('region') || []
        };
    };

    return (
        <div className="w-full space-y-6">
            {/* Filter component */}
            <FreeFilterCard
                onFiltersChange={handleFiltersChange}
                initialFilters={getInitialFilters()}
            />

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? "Aanbestedingen laden..." : `${totalItems} aanbestedingen gevonden`}
            </div>

            {/* initialPublications list */}
            <div className="space-y-6">
                {filteredinitialPublications.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Geen aanbestedingen gevonden</p>
                    </div>
                ) : (
                    filteredinitialPublications.map((publication, index) => (
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
                                        href={`/initialPublications/free/detail/${publication.workspace_id}`}
                                        className="text-lg font-semibold text-astral-600 dark:text-astral-400 hover:underline focus:outline-hidden mb-1 block"
                                    >
                                        {publication.title}
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
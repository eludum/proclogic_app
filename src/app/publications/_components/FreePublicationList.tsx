"use client"
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/publicationUtils";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ChevronLeft, ChevronRight, CodeIcon, MapPinIcon, StarIcon, TagIcon } from 'lucide-react';
import { useState } from "react";

export default function FreePublicationList({ publications }) {
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const items = publications.items || [];
    const page = publications.page || 1;
    const pages = publications.pages || 1;
    const total = publications.total || 0;

    // Toggle description expansion for a publication
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        // Construct the URL with the new page parameter
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage);
        window.location.href = url.toString();
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        if (pages <= 7) {
            return Array.from({ length: pages }, (_, i) => i + 1);
        }

        if (page <= 3) {
            return [1, 2, 3, 4, 5, '...', pages];
        }

        if (page >= pages - 2) {
            return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
        }

        return [1, '...', page - 1, page, page + 1, '...', pages];
    };

    return (
        <div className="w-full space-y-6">
            {/* Publications list */}
            <div className="space-y-4">
                {items.map((publication, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        {/* Header with status */}
                        <div className={`flex items-center justify-between px-5 py-3 border-b ${publication.is_recommended
                            ? 'bg-astral-500 border-astral-600 text-white'
                            : 'border-slate-100 dark:border-slate-700'
                            }`}>
                            <div className="flex items-center gap-3">
                                {/* Status badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${publication.is_active
                                    ? publication.is_recommended
                                        ? 'bg-white/20 text-white'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : publication.is_recommended
                                        ? 'bg-amber-200/30 text-white'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                    <CheckCircleIcon className="mr-1 inline-block size-3" />
                                    {publication.is_active ? "Actief" : "Inactief"}
                                </span>
                            </div>

                        </div>

                        {/* Recommendation banner if applicable */}
                        {publication.is_recommended && (
                            <div className="w-full bg-astral-50 dark:bg-astral-950 px-6 py-2 border-b border-astral-100 dark:border-astral-800">
                                <div className="flex items-center gap-2">
                                    <StarIcon size={14} className="text-amber-500 shrink-0" />
                                    <span className="text-xs text-astral-600 dark:text-astral-300">
                                        <strong>ProcLogic AI beveelt deze publicatie aan voor uw bedrijf</strong> gebaseerd op uw profiel.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Content section */}
                        <div className="p-5">
                            {/* Title */}
                            <div className="mb-4">
                                <a
                                    href={`/publications/free/detail/${publication.workspace_id}`}
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
                ))}
            </div>

            {/* Pagination controls */}
            {pages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-1">
                        <Button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </Button>

                        {generatePageNumbers().map((pageNum, index) => (
                            <Button
                                key={index}
                                onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
                                disabled={pageNum === '...' || pageNum === page}
                                className={`p-2 min-w-[36px] text-center rounded-md ${pageNum === page
                                    ? 'bg-astral-600 text-white border border-astral-600'
                                    : pageNum === '...'
                                        ? 'bg-transparent text-slate-500 border-transparent cursor-default'
                                        : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {pageNum}
                            </Button>
                        ))}

                        <Button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === pages}
                            className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Page info */}
            {total > 0 && (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Pagina {page} van {pages} • Totaal {total} aanbestedingen
                </div>
            )}
        </div>
    );
}
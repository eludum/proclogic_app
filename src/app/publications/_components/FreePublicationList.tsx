"use client"
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ClockIcon, CodeIcon, MapPinIcon, TagIcon } from 'lucide-react';
import { useState } from "react";

export default function FreePublicationList({ publications, isLoggedIn }) {
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // Toggle description expansion for a publication
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="w-full">
            {publications.map((publication, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="p-6">
                        <div className="flex flex-col space-y-4">
                            {/* Publication header section with status and title */}
                            <div className="flex flex-col sm:flex-row justify-between w-full">
                                {/* Status indicator */}
                                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${publication.is_active
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                        }`}>
                                        <CheckCircleIcon className="mr-1 size-3" />
                                        {publication.is_active ? "Actief" : "Inactief"}
                                    </span>
                                </div>

                                {/* Deadline indicator */}
                                <span className={`inline-flex items-center self-start gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                                    <ClockIcon className="size-3" />
                                    <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                                </span>
                            </div>

                            {/* Publication title */}
                            <div className="flex flex-col w-full">
                                <a
                                    href={isLoggedIn ? `/publications/detail/${publication.workspace_id}` : `/publications/free/detail/${publication.workspace_id}`}
                                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none mb-1"
                                >
                                    {publication.title}
                                </a>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    ID: {publication.workspace_id}
                                </span>
                            </div>

                            {/* Description section (truncated by default) */}
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <p className={expandedDescriptions[publication.workspace_id] ? "" : "line-clamp-2"}>
                                    {publication.original_description}
                                </p>
                                {publication.original_description && publication.original_description.length > 150 && (
                                    <button
                                        onClick={() => toggleDescription(publication.workspace_id)}
                                        className="text-blue-600 dark:text-blue-400 mt-1 text-xs font-medium hover:underline focus:outline-none"
                                    >
                                        {expandedDescriptions[publication.workspace_id] ? "Minder tonen" : "Meer tonen"}
                                    </button>
                                )}
                            </div>

                            {/* Publication details grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
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
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                    <CalendarIcon className="size-3" />
                                    <span>Gepubliceerd: {formatDate(publication.publication_date)}</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <CalendarIcon className="size-3" />
                                    <span>Deadline: {formatDate(publication.submission_deadline)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
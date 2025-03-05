"use client"
import { Button } from "@/components/Button";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { RiChatSmile2Line } from '@remixicon/react';
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ClockIcon, CodeIcon, MapPinIcon, PlusIcon, StarIcon, TagIcon, ThumbsUpIcon } from 'lucide-react';
import { useState } from "react";
import ChatComponent from "./ChatComponent";

export default function PublicationList({ publications }) {
    const [activeChatPublication, setActiveChatPublication] = useState(null);

    // Start a chat with a publication
    const startChat = (publication) => {
        setActiveChatPublication(publication);
    };

    // Sort publications to show recommended ones first
    const sortedPublications = [...publications].sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            {sortedPublications.map((publication, index) => (
                <div
                    key={index}
                    className="w-full max-w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900"
                >
                    {/* Status banner - Green for active */}
                    <div className={`w-full py-2 px-4 flex flex-wrap justify-between items-center gap-2 text-xs font-medium text-white ${publication.is_active ? "bg-emerald-500" : "bg-amber-500"}`}>
                        <div className="flex items-center gap-1">
                            <CheckCircleIcon size={14} />
                            <span>{publication.is_active ? "Actieve aanbesteding" : "Inactieve aanbesting"}</span>
                        </div>

                        {publication.is_recommended && (
                            <div className="flex items-center gap-1 bg-white text-emerald-600 px-2 py-1 rounded-full text-xs font-medium">
                                <ThumbsUpIcon size={12} />
                                <span>ProcLogic aanbeveling</span>
                            </div>
                        )}
                    </div>

                    {/* Recommendation banner (if recommended) */}
                    {publication.is_recommended && (
                        <div className="w-full bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                                <StarIcon size={14} className="text-amber-500 shrink-0" />
                                <span className="text-xs text-blue-800 dark:text-blue-200">
                                    <strong>ProcLogic AI beveelt deze publicatie aan voor uw bedrijf</strong> gebaseerd op uw profiel.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Content with padding */}
                    <div className="p-4 sm:p-6 flex flex-col gap-4">
                        {/* Header with time remaining badge */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-wrap items-start justify-between gap-2 w-full">
                                <a href={`/publications/detail/${publication.workspace_id}`} target="_blank" className="text-base sm:text-lg font-semibold leading-tight break-words flex-1 min-w-0 hover:underline focus:outline-none">
                                    {publication.title}
                                </a>

                                {/* Time remaining badge */}
                                <div className={`flex items-center shrink-0 gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                                    <ClockIcon size={12} />
                                    <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                                </div>
                            </div>
                            <a href={`/publications/detail/${publication.workspace_id}`} target="_blank" className="text-xs text-gray-500 dark:text-gray-400 hover:underline focus:outline-none">
                                ID: {publication.workspace_id}
                            </a>
                        </div>

                        {/* Description with proper wrapping */}
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal">{publication.original_description}</p>

                        {/* Details grid - properly responsive layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="flex items-start sm:items-center gap-2">
                                <BuildingIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                <div className="min-w-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Organisatie</span>
                                    <span className="text-gray-800 dark:text-gray-200 break-words">{publication.organisation}</span>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center gap-2">
                                <TagIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                <div className="min-w-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Sector</span>
                                    <span className="text-gray-800 dark:text-gray-200 break-words">{publication.sector}</span>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center gap-2">
                                <CodeIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                <div className="min-w-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">CPV Code</span>
                                    <span className="text-gray-800 dark:text-gray-200 break-words">{publication.cpv_code}</span>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center gap-2">
                                <MapPinIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                <div className="min-w-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Regio</span>
                                    <span className="text-gray-800 dark:text-gray-200 break-words">{publication.region?.join(", ") || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                        {/* Date badges */}
                        <div className="flex flex-col sm:flex-row gap-2 text-xs">
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md w-full sm:w-auto">
                                <CalendarIcon size={14} className="shrink-0" />
                                <span className="whitespace-nowrap">Published: {formatDate(publication.publication_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-md w-full sm:w-auto">
                                <CalendarIcon size={14} className="shrink-0" />
                                <span className="whitespace-nowrap">Due: {formatDate(publication.submission_deadline)}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <Button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-md w-full sm:w-auto">
                                <PlusIcon size={16} />
                                <span>Opslaan</span>
                            </Button>
                            <Button
                                onClick={() => startChat(publication)}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                            >
                                <RiChatSmile2Line className="size-5" />
                                <span>ProcLogic AI</span>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Chat dialog */}
            {activeChatPublication && (
                <ChatComponent
                    publicationId={activeChatPublication.workspace_id}
                    onClose={() => setActiveChatPublication(null)}
                />
            )}
        </div>
    );
}

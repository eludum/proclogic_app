"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { RiChatSmile2Line } from '@remixicon/react';
import {
    ArrowLeftIcon,
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    DownloadIcon,
    EuroIcon,
    FileIcon,
    Layers,
    MapPinIcon,
    StarIcon,
    TagIcon
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChatComponent from "./ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

// Modified getCompany hook to use server-side data
export default function PublicationDetail({ publication, timelineEvents }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('ai');
    const [activeChatPublication, setActiveChatPublication] = useState(null);

    if (!publication) {
        return (
            <section aria-label="Publication Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbesteding Details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Publication not found</p>
                    </div>
                </div>

                <div className="relative min-h-60 w-full flex flex-col justify-center items-center my-6 bg-white shadow-xs border border-slate-200 rounded-lg p-2 dark:bg-[#090E1A]">
                    <div className="p-3 text-center">
                        <div className="flex justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="text-slate-400 w-10 h-10"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <div className="flex justify-center mb-2">
                            <h5 className="text-slate-800 text-2xl font-semibold dark:text-white">
                                Publication not found
                            </h5>
                        </div>
                        <Button
                            onClick={() => router.push('/publications')}
                            className="mt-4 flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-2 rounded-md"
                        >
                            <ArrowLeftIcon size={16} />
                            <span>Back to Publications</span>
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    // Start a chat with a publication
    const startChat = async (pub) => {
        try {
            setActiveChatPublication(pub);
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    const timeRemaining = getTimeRemaining(publication.submission_deadline);

    // Helper function to render icon based on string name
    const renderIcon = (iconName, size = 14) => {
        switch (iconName) {
            case 'calendar': return <CalendarIcon size={size} />;
            case 'file': return <FileIcon size={size} />;
            case 'clock': return <ClockIcon size={size} />;
            case 'check-circle': return <CheckCircleIcon size={size} />;
            default: return <CalendarIcon size={size} />;
        }
    };

    const isRecommended = publication.is_recommended;

    return (
        <section aria-label="Publication Detail">
            <div className="px-4 sm:px-6 pb-6 pt-6">
                <div className={`w-full max-w-full border ${isRecommended ? 'border-astral-200 dark:border-astral-800' : 'border-slate-200 dark:border-slate-800'} rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900`}>
                    {/* Header with viewed status, active status, recommendation status and time remaining */}
                    <div className={`w-full p-3 flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-800 ${isRecommended ? 'bg-astral-50 dark:bg-astral-900/20' : ''}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active status */}
                            <div className={`flex items-center gap-1 ${publication.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"} px-2 py-1 rounded-full text-xs`}>
                                <CheckCircleIcon size={12} />
                                <span>{publication.is_active ? "Actief" : "Inactief"}</span>
                            </div>

                            {/* Recommendation status */}
                            {isRecommended && (
                                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs">
                                    <StarIcon size={12} className="text-amber-500" />
                                    <span>Aanbevolen</span>
                                </div>
                            )}



                        </div>

                        {/* Time remaining badge */}
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                            <ClockIcon size={12} />
                            <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                        </div>
                    </div>

                    {/* Enhanced Recommendation banner (if recommended) - Keep this prominent */}
                    {publication.is_recommended && (
                        <div className="w-full bg-astral-50 dark:bg-astral-950 px-4 py-3 border-astral-100 dark:border-astral-800 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center bg-amber-500 text-white rounded-full p-2 shrink-0 animate-pulse">
                                    <StarIcon size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-astral-700 dark:text-astral-300">
                                        ProcLogic AI beveelt deze publicatie aan voor uw bedrijf!
                                    </span>
                                    <span className="text-xs text-astral-600 dark:text-astral-400">
                                        Geselecteerd op basis van uw bedrijfsprofiel
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content with padding */}
                    <div className="p-6 flex flex-col gap-6">
                        {/* Header with time remaining badge */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-wrap items-start justify-between gap-4 w-full">
                                <h2 className="text-xl sm:text-2xl font-semibold leading-tight break-words flex-1 min-w-0 text-gray-900 dark:text-white line-clamp-2">
                                    {publication.title}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {publication.workspace_id}</p>
                        </div>

                        {/* Description tabs section with timeline */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Description tabs - takes 2/3 of the width on large screens */}
                            <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                {/* Tab navigation */}
                                <div className="flex border-b border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setActiveTab('ai')}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'ai'
                                            ? 'text-astral-600 border-b-2 border-astral-500 dark:text-astral-300 dark:border-astral-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <RiChatSmile2Line className="size-4" />
                                        <span>AI Samenvatting</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('original')}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5  ${activeTab === 'original'
                                            ? 'text-astral-600 border-b-2 border-astral-500 dark:text-astral-300 dark:border-astral-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <FileIcon size={14} />
                                        <span>Oorspronkelijke beschrijving</span>
                                    </button>
                                </div>

                                {/* Tab content */}
                                <div className="p-4">
                                    {activeTab === 'original' && (
                                        <div>
                                            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Oorspronkelijke beschrijving</h3>
                                            <div className="h-full overflow-y-auto">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-line">
                                                    {publication.original_description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ai' && (
                                        <div className="flex flex-col gap-4">
                                            {publication.ai_summary_without_documents && (
                                                <div className="bg-astral-50 dark:bg-astral-950/50 p-4 rounded-lg">
                                                    <h3 className="text-lg font-medium mb-3 text-astral-800 dark:text-astral-200">AI Aankondiging Samenvatting</h3>
                                                    <div className="max-h-80 overflow-y-auto">
                                                        <p className="text-sm text-astral-700 dark:text-astral-300 break-words whitespace-pre-line">
                                                            {publication.ai_summary_without_documents}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {publication.ai_summary_with_documents && (
                                                <div className="bg-astral-50 dark:bg-astral-950/50 p-4 rounded-lg">
                                                    <h3 className="text-lg font-medium mb-3 text-astral-800 dark:text-astral-200">AI Document Samenvatting</h3>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        <p className="text-sm text-astral-700 dark:text-astral-300 break-words whitespace-pre-line">
                                                            {publication.ai_summary_with_documents}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {!publication.ai_summary_without_documents && !publication.ai_summary_with_documents && (
                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        Geen AI samenvatting beschikbaar voor deze publicatie.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline - takes 1/3 of the width on large screens */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <h3 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">Tijdlijn Proces</h3>
                                <div className="relative max-h-100 overflow-y-auto">
                                    {/* Timeline vertical line */}
                                    <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Timeline events */}
                                    <div className="space-y-6 relative">
                                        {timelineEvents.map((event, index) => (
                                            <div key={index} className="flex gap-4">
                                                {/* Event dot with icon */}
                                                <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 
                        ${event.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : event.status === 'in-progress'
                                                            ? 'bg-astral-100 text-astral-600 dark:bg-astral-900/30 dark:text-astral-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {renderIcon(event.icon)}
                                                </div>

                                                {/* Event content */}
                                                <div className="flex flex-col pb-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {event.title}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(event.date)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organization, Sector, Region Information - Card style with consistent layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <BuildingIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Organisatie</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200">{publication.organisation}</p>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <TagIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Sector</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200">{publication.sector}</p>
                                {publication.publication_in_your_sector && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <CheckCircleIcon size={12} />
                                        <span>Matched met uw sector</span>
                                    </div>
                                )}
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPinIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Regio</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 truncate" title={publication.region?.join(", ") || "N/A"}>
                                    {publication.region?.join(", ") || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* CPV Codes and Value */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <CodeIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">CPV Codes</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-sm text-sm">
                                        <span>{publication.cpv_code}</span>
                                    </div>

                                    {publication.cpv_additional_codes && publication.cpv_additional_codes.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aanvullende CPV codes:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {publication.cpv_additional_codes.map((code, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-sm text-xs text-gray-700 dark:text-gray-300"
                                                    >
                                                        {code}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <EuroIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Aanbestedingswaarde</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold">
                                    {publication.estimated_value
                                        ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(publication.estimated_value)
                                        : "Niet gespecificeerd"}
                                </p>
                            </div>
                        </div>

                        {/* Lots Section */}
                        {publication.lots && publication.lots.length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Percelen ({publication.lots.length})</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                    {publication.lots.map((lot, idx) => (
                                        <div key={idx} className="text-sm bg-slate-50 dark:bg-slate-800 rounded p-2 truncate" title={lot}>
                                            {lot}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Section */}
                        {publication.documents && Object.keys(publication.documents).length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Documenten</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(publication.documents).map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileIcon size={14} className="text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc}</span>
                                            </div>
                                            <Button className="flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-astral-500 dark:text-astral-400 p-1.5 rounded-md">
                                                <DownloadIcon size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Accreditations if available */}
                        {publication.accreditations && Object.keys(publication.accreditations).length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircleIcon size={16} className="text-gray-400" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Vereiste Accreditaties</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(publication.accreditations).map(([key, value], index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <Button
                                onClick={() => startChat(publication)}
                                className="flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                            >
                                <RiChatSmile2Line className="size-5" />
                                <span>ProcLogic AI</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat dialog */}
            {activeChatPublication && (
                <ChatComponent
                    publicationId={activeChatPublication.workspace_id}
                    onClose={() => setActiveChatPublication(null)}
                />
            )}
        </section>
    );
}
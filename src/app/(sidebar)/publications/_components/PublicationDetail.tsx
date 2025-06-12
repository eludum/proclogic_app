"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { useAuth } from "@clerk/nextjs";
import { RiChatSmile2Line, RiExternalLinkLine } from '@remixicon/react';
import {
    ArrowLeftIcon,
    BookmarkCheck,
    BookmarkPlus,
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    DownloadIcon,
    EuroIcon,
    ExternalLinkIcon,
    FileIcon,
    Layers,
    LinkIcon,
    MapPinIcon,
    StarIcon,
    TagIcon,
    UsersIcon
} from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

// TODO: make one uniform interface
export interface Publication {
    publication_date: any;
    dispatch_date: any;
    cpv_additional_codes: string[];
    workspace_id: string;
    title: string;
    original_description: string;
    is_active: boolean;
    submission_deadline?: string | Date;
    organisation: string;
    sector: string;
    cpv_code: string;
    region?: string[];
    lot_titles?: string[];
    lot_descriptions?: string[];
    documents?: string[];
    estimated_value?: number;
    accreditations?: Record<string, any>;
    is_recommended?: boolean;
    match_percentage?: number;
    publication_in_your_sector?: boolean;
    publication_in_your_region?: boolean;
    ai_summary_without_documents?: string;
    ai_summary_with_documents?: string;
    external_links?: string[];
    is_saved?: boolean; // Add this to track save status
}

interface TimelineEvent {
    title: string;
    date: Date | string;
    description: string;
    status: 'completed' | 'in-progress' | 'pending';
    icon: 'calendar' | 'file' | 'clock' | 'check-circle';
}

// Related content interfaces
interface RelatedContractItem {
    publication_id: string;
    title: string;
    award_date?: string;
    winner: string;
    value: number;
    sector: string;
    cpv_code: string;
    buyer: string;
    similarity_score: number;
    similarity_reason: string;
}

interface RelatedContentResponse {
    related_contracts: RelatedContractItem[];
    total_contracts: number;
}

interface PublicationDetailProps {
    publication: Publication | null;
    timelineEvents: TimelineEvent[];
}

export default function PublicationDetail({ publication, timelineEvents }: PublicationDetailProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ai' | 'original'>('ai');
    const [activeChatPublication, setActiveChatPublication] = useState<Publication | null>(null);
    const [selectedLotIndex, setSelectedLotIndex] = useState<number | null>(null);
    const [contentTab, setContentTab] = useState<'info' | 'lots' | 'documents'>('info');
    const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
    const [relatedContent, setRelatedContent] = useState<RelatedContentResponse | null>(null);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { getToken } = useAuth();

    // Initialize save status from publication prop
    useEffect(() => {
        if (publication?.is_saved !== undefined) {
            setIsSaved(publication.is_saved);
        }
    }, [publication?.is_saved]);

    // Fetch related content when publication changes
    useEffect(() => {
        if (publication?.workspace_id) {
            fetchRelatedContent();
        }
    }, [publication?.workspace_id]);

    const fetchRelatedContent = async () => {
        if (!publication?.workspace_id) return;

        try {
            setLoadingRelated(true);
            const token = await getToken();

            const response = await fetch(
                `${API_BASE_URL}/publications/publication/${publication.workspace_id}/related?contracts_limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setRelatedContent(data);
            }
        } catch (error) {
            console.error("Error fetching related content:", error);
        } finally {
            setLoadingRelated(false);
        }
    };

    const handleSaveToggle = async () => {
        if (!publication?.workspace_id || isSaving) return;

        try {
            setIsSaving(true);
            const token = await getToken();
            const endpoint = isSaved ? 'unsave' : 'save';

            const response = await fetch(
                `${API_BASE_URL}/publications/publication/${publication.workspace_id}/${endpoint}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                setIsSaved(!isSaved);
            } else {
                console.error('Failed to toggle save status');
            }
        } catch (error) {
            console.error("Error toggling save status:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value === 0) {
            return "Niet beschikbaar";
        }
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getSimilarityColor = (score: number) => {
        if (score >= 70) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const handleDownload = async (filename: string) => {
        try {
            setDownloadingFiles(prev => ({ ...prev, [filename]: true }));
            const token = await getToken();
            const downloadUrl = `${API_BASE_URL}/publications/publication/${publication?.workspace_id}/document/${filename}`;

            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error downloading file:", error);
        } finally {
            setDownloadingFiles(prev => ({ ...prev, [filename]: false }));
        }
    };

    const startChat = async (pub: Publication) => {
        try {
            setActiveChatPublication(pub);
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    if (!publication) {
        return (
            <section aria-label="Publication Detail">
                <div className="relative min-h-60 w-full flex flex-col justify-center items-center my-6 bg-white border border-slate-200 rounded-lg p-2 dark:bg-[#090E1A]">
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
                                Aanbesteding niet gevonden
                            </h5>
                        </div>
                        <Button
                            onClick={() => router.push('/publications')}
                            className="mt-4 flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-2 rounded-md"
                        >
                            <ArrowLeftIcon size={16} />
                            <span>Terug naar overzicht</span>
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    const timeRemaining = getTimeRemaining(publication.submission_deadline);

    const renderIcon = (iconName: TimelineEvent['icon'], size = 14) => {
        switch (iconName) {
            case 'calendar': return <CalendarIcon size={size} />;
            case 'file': return <FileIcon size={size} />;
            case 'clock': return <ClockIcon size={size} />;
            case 'check-circle': return <CheckCircleIcon size={size} />;
            default: return <CalendarIcon size={size} />;
        }
    };

    const isRecommended = publication.is_recommended;
    const hasLots = publication.lot_titles && publication.lot_titles.length > 0 && publication.lot_descriptions && publication.lot_descriptions.length > 0;
    const hasDocuments = publication.documents && Array.isArray(publication.documents) && publication.documents.length > 0;
    const hasExternalLinks = publication.external_links && Array.isArray(publication.external_links) && publication.external_links.length > 0;
    const showDocumentsTab = hasDocuments || hasExternalLinks;

    return (
        <section aria-label="Publication Detail">
            <div className="px-4 sm:px-6 pb-6 pt-6">
                <div className={`w-full max-w-full border ${isRecommended ? 'border-astral-300 dark:border-astral-800' : 'border-slate-200 dark:border-slate-800'} rounded-lg overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900`}>
                    {/* Header with viewed status, active status, recommendation status and time remaining */}
                    <div className={`w-full p-3 flex flex-wrap justify-between items-center gap-2 ${isRecommended ? 'bg-astral-100 dark:bg-astral-900/20 border-b border-astral-300 dark:border-slate-800' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className={`flex items-center gap-1 border ${publication.is_active ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"} px-2 py-1 rounded-full text-xs`}>
                                <CheckCircleIcon size={12} />
                                <span>{publication.is_active ? "Actief" : "Inactief"}</span>
                            </div>
                        </div>

                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTimeRemainingStyles(timeRemaining.variant)}`}>
                            <ClockIcon size={12} />
                            <span>{timeRemaining.text}</span>
                        </div>
                    </div>

                    {/* Enhanced Recommendation banner (if recommended) */}
                    {isRecommended && (
                        <div className="w-full bg-astral-100 dark:bg-astral-900/20 px-4 py-3 border-b border-astral-300 dark:border-astral-800">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shrink-0 animate-pulse">
                                    <StarIcon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-astral-800 dark:text-astral-200">
                                        <strong>Deze publieke aanbesteding is je aangeraden</strong> op basis van je profiel.
                                    </p>
                                    <div className="flex flex-wrap items-center">
                                        <div className="flex items-center text-xs">
                                            <span className="font-medium text-astral-700 dark:text-astral-300">Match score:</span>
                                            <span className="ml-1 font-bold text-emerald-600 dark:text-emerald-400">{publication.match_percentage?.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content with padding */}
                    <div className="p-6 flex flex-col gap-6">
                        {/* Header with Full-Width Title */}
                        <div className="flex flex-col gap-3 w-full">
                            {/* Full-width title section */}
                            <div className="w-full">
                                <h2 className="text-xl sm:text-2xl font-semibold leading-tight break-words text-gray-900 dark:text-white">
                                    {publication.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {publication.workspace_id}</p>
                            </div>

                            {/* Action buttons row */}
                            <div className="pt-2 flex items-center justify-between w-full">

                                {/* Enhanced Action buttons group */}
                                <div className="flex items-center bg-slate-25 dark:bg-slate-850 rounded-lg p-1 gap-1 border border-slate-100 dark:border-slate-750 shrink-0">
                                    <Button
                                        onClick={handleSaveToggle}
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                    >
                                        {isSaving ? (
                                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                        ) : isSaved ? (
                                            <BookmarkCheck size={14} />
                                        ) : (
                                            <BookmarkPlus size={14} />
                                        )}
                                        <span className="hidden sm:inline">
                                            {isSaving ? (isSaved ? 'Verwijderen...' : 'Opslaan...') : (isSaved ? 'Verwijderen' : 'Opslaan')}
                                        </span>
                                    </Button>

                                    <Button
                                        onClick={() => startChat(publication)}
                                        className="flex items-center justify-center gap-1.5 bg-astral-500 hover:bg-astral-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                    >
                                        <RiChatSmile2Line className="size-4" />
                                        <span className="hidden sm:inline">Procy</span>
                                    </Button>

                                    <Link href={`https://publicprocurement.be/publication-workspaces/${publication.workspace_id}/general`} target="_blank">
                                        <Button
                                            className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                        >
                                            <RiExternalLinkLine className="size-4" />
                                            <span className="hidden sm:inline">Indienen</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
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

                        {/* Content tabs: Info, Lots, Documents */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                            <div className="flex border-b border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setContentTab('info')}
                                    className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${contentTab === 'info'
                                        ? 'text-astral-600 border-b-2 border-astral-500 dark:text-astral-300 dark:border-astral-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <BuildingIcon size={14} />
                                    <span>Informatie</span>
                                </button>
                                {hasLots && (
                                    <button
                                        onClick={() => {
                                            setContentTab('lots');
                                            setSelectedLotIndex(null);
                                        }}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${contentTab === 'lots'
                                            ? 'text-astral-600 border-b-2 border-astral-500 dark:text-astral-300 dark:border-astral-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Layers size={14} />
                                        <span>Percelen</span>
                                    </button>
                                )}
                                {showDocumentsTab && (
                                    <button
                                        onClick={() => setContentTab('documents')}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${contentTab === 'documents'
                                            ? 'text-astral-600 border-b-2 border-astral-500 dark:text-astral-300 dark:border-astral-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <FileIcon size={14} />
                                        <span>Documenten</span>
                                    </button>
                                )}
                            </div>

                            {/* Tab content area */}
                            <div className="p-6">
                                {/* Info tab content */}
                                {contentTab === 'info' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BuildingIcon size={16} className="text-gray-400" />
                                                    <h3 className="font-medium text-gray-900 dark:text-white">Organisatie</h3>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200">{publication.organisation}</p>
                                            </div>

                                            <div className={`border ${publication.publication_in_your_sector ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} rounded-lg p-4`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <TagIcon size={16} className={`${publication.publication_in_your_sector ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                                                    <h3 className={`font-medium ${publication.publication_in_your_sector ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                                                        Sector {publication.publication_in_your_sector && <span className="ml-1 text-sm">• In je sector</span>}
                                                    </h3>
                                                </div>
                                                <p className={`${publication.publication_in_your_sector ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {publication.sector}
                                                </p>
                                            </div>

                                            <div className={`border ${publication.publication_in_your_region ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} rounded-lg p-4`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPinIcon size={16} className={`${publication.publication_in_your_region ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                                                    <h3 className={`font-medium ${publication.publication_in_your_region ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                                                        Regio {publication.publication_in_your_region && <span className="ml-1 text-sm">• In je regio</span>}
                                                    </h3>
                                                </div>
                                                <p className={`${publication.publication_in_your_region ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-800 dark:text-gray-200'} truncate`} title={publication.region?.join(", ") || "N/A"}>
                                                    {publication.region?.join(", ") || "N/A"}
                                                </p>
                                            </div>
                                        </div>

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
                                                        : "Niet gespecificeerd in de aanbesteding"}
                                                </p>
                                            </div>
                                        </div>

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
                                    </div>
                                )}

                                {/* Lots tab content */}
                                {contentTab === 'lots' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layers size={16} className="text-gray-400" />
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Percelen ({publication.lot_titles?.length || 0})
                                            </h3>
                                        </div>

                                        {selectedLotIndex !== null ? (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => setSelectedLotIndex(null)}
                                                    className="flex items-center gap-1 text-sm text-astral-600 dark:text-astral-400 hover:underline"
                                                >
                                                    <ArrowLeftIcon size={12} />
                                                    Terug naar percelenoverzicht
                                                </button>

                                                <div className="border border-astral-200 dark:border-astral-800 bg-astral-50 dark:bg-astral-900/20 rounded-lg p-4">
                                                    <h4 className="font-medium text-lg text-astral-800 dark:text-astral-300 mb-2">
                                                        {publication.lot_titles?.[selectedLotIndex]}
                                                    </h4>
                                                    <div className="text-sm text-astral-700 dark:text-astral-400 whitespace-pre-line">
                                                        {publication.lot_descriptions?.[selectedLotIndex] || "Geen beschrijving beschikbaar."}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                                {publication.lot_titles?.map((title, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-astral-300 dark:hover:border-astral-700 cursor-pointer transition-all duration-150"
                                                        onClick={() => setSelectedLotIndex(idx)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="font-medium text-gray-800 dark:text-white text-sm">{title}</h4>
                                                            <span className="text-xs px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-full flex-shrink-0">
                                                                #{idx + 1}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            Klik voor details en beschrijving
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Documents tab content */}
                                {contentTab === 'documents' && (
                                    <div className="space-y-4">
                                        {hasDocuments && (
                                            <>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileIcon size={16} className="text-gray-400" />
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        Documenten ({publication.documents?.length})
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                    {publication.documents?.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg hover:shadow-md hover:border-astral-300 dark:hover:border-astral-700 transition-all duration-150">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileIcon size={16} className="text-gray-400 shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc}</span>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleDownload(doc)}
                                                                disabled={downloadingFiles[doc]}
                                                                className="flex items-center justify-center bg-astral-100 hover:bg-astral-200 dark:bg-astral-900/30 dark:hover:bg-astral-800/50 text-astral-600 dark:text-astral-400 p-2 rounded-md"
                                                            >
                                                                {downloadingFiles[doc] ? (
                                                                    <div className="animate-spin h-4 w-4 border-2 border-astral-500 border-t-transparent rounded-full" />
                                                                ) : (
                                                                    <DownloadIcon size={16} />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {hasExternalLinks && (
                                            <>
                                                <div className="flex items-center gap-2 mt-6 mb-2">
                                                    <LinkIcon size={16} className="text-gray-400" />
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        Externe links ({publication.external_links?.length})
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                    {publication.external_links?.map((link, index) => (
                                                        <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                                                            <Link
                                                                href={link}
                                                                target="_blank"
                                                                className="flex items-center gap-2 text-astral-600 dark:text-astral-400 hover:underline"
                                                            >
                                                                <RiExternalLinkLine className="size-4" />
                                                                <span className="text-sm truncate">{link}</span>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {!hasDocuments && !hasExternalLinks && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                                                Geen documenten of externe links beschikbaar.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related Content Section - Only Contracts */}
                        {relatedContent && relatedContent.total_contracts > 0 && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <UsersIcon size={18} />
                                        Vergelijkbare gunningen
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Ontdek vergelijkbare toegekende gunningen
                                    </p>
                                </div>

                                {/* Related Contracts Content */}
                                <div className="p-6">
                                    {loadingRelated ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {relatedContent.related_contracts.length === 0 ? (
                                                <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                                                    <UsersIcon className="mx-auto h-8 w-8 mb-2" />
                                                    <p>Geen vergelijkbare gunningen gevonden</p>
                                                </div>
                                            ) : (
                                                relatedContent.related_contracts.map((contract) => (
                                                    <div key={contract.publication_id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-4">
                                                                {contract.title}
                                                            </h4>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(contract.similarity_score)}`}>
                                                                {contract.similarity_score.toFixed(0)}% match
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center space-x-2">
                                                                <BuildingIcon className="h-4 w-4" />
                                                                <span className="truncate">{contract.buyer}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <UsersIcon className="h-4 w-4" />
                                                                <span className="font-medium text-green-600 dark:text-green-400 truncate">
                                                                    {contract.winner}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-semibold">
                                                                    {formatCurrency(contract.value)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <CalendarIcon className="h-4 w-4" />
                                                                <span>
                                                                    {contract.award_date ? formatDate(contract.award_date) : 'Datum onbekend'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="font-medium">Gelijkenis:</span> {contract.similarity_reason}
                                                                </p>
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`/contracts/${contract.publication_id}`, '_blank');
                                                                    }}
                                                                    className="text-xs bg-astral-100 hover:bg-astral-200 dark:bg-astral-900/30 dark:hover:bg-astral-800/50 text-astral-600 dark:text-astral-400 px-3 py-1 rounded-md flex items-center gap-1"
                                                                >
                                                                    <ExternalLinkIcon size={12} />
                                                                    Bekijk
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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

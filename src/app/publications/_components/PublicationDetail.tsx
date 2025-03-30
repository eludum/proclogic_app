"use client"
import { siteConfig } from "@/app/siteConfig";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { RiChatSmile2Line, RiExternalLinkLine } from '@remixicon/react';
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
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChatComponent from "./ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

// TODO: make one uniform interface
// Define interfaces for the component
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
    documents?: Record<string, any>;
    documents_loading?: boolean; 
    estimated_value?: number;
    accreditations?: Record<string, any>;
    is_recommended?: boolean;
    match_percentage?: number;
    publication_in_your_sector?: boolean;
    publication_in_your_region?: boolean;
    ai_summary_without_documents?: string;
    ai_summary_with_documents?: string;
}

interface TimelineEvent {
    title: string;
    date: Date | string;
    description: string;
    status: 'completed' | 'in-progress' | 'pending';
    icon: 'calendar' | 'file' | 'clock' | 'check-circle';
}

interface PublicationDetailProps {
    publication: Publication | null;
    timelineEvents: TimelineEvent[];
}

// Modified getCompany hook to use server-side data
export default function PublicationDetail({ publication, timelineEvents }: PublicationDetailProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ai' | 'original'>('ai');
    const [activeChatPublication, setActiveChatPublication] = useState<Publication | null>(null);
    const [selectedLotIndex, setSelectedLotIndex] = useState<number | null>(null);
    const [contentTab, setContentTab] = useState<'info' | 'lots' | 'documents'>('info');
    const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
    const { getToken } = useAuth();
    const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
    const [documents, setDocuments] = useState<Record<string, any>>({});


    useEffect(() => {
        const fetchDocuments = async () => {
            if (!publication?.workspace_id) return;
            
            // If publication already has documents and they're not loading, use those
            if (publication.documents && 
                Object.keys(publication.documents).length > 0 && 
                !publication.documents_loading) {
                setDocuments(publication.documents);
                setDocumentsLoading(false);
                return;
            }
            
            try {
                setDocumentsLoading(true);
                const token = await getToken();
                
                const response = await fetch(
                    `${API_BASE_URL}/publications/publication/${publication.workspace_id}/documents`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setDocuments(data.documents);
                } else {
                    console.error('Failed to fetch documents:', response.status);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setDocumentsLoading(false);
            }
        };
        
        fetchDocuments();
    }, [publication?.workspace_id, getToken]);
    

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

    const handleDownload = async (filename: string) => {
        try {
            // Set loading state for this specific file
            setDownloadingFiles(prev => ({ ...prev, [filename]: true }));
            
            // Get authentication token
            const token = await getToken();
            
            // Construct the document URL
            const downloadUrl = `${API_BASE_URL}/publications/publication/${publication.workspace_id}/document/${filename}`;
                
            // Create a fetch request with authentication to get the file
            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
        } catch (error) {
            console.error("Error downloading file:", error);
            // TODO: You might want to show a notification to the user here
        } finally {
            // Clear loading state for this file
            setDownloadingFiles(prev => ({ ...prev, [filename]: false }));
        }
    };
    
    
    // Start a chat with a publication
    const startChat = async (pub: Publication) => {
        try {
            setActiveChatPublication(pub);
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    const timeRemaining = getTimeRemaining(publication.submission_deadline);

    // Helper function to render icon based on string name
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
    const hasDocuments = documents && Object.keys(documents).length > 0;

    return (
        <section aria-label="Publication Detail">
            <div className="px-4 sm:px-6 pb-6 pt-6">
                <div className={`w-full max-w-full border ${isRecommended ? 'border-astral-300 dark:border-astral-800' : 'border-slate-200 dark:border-slate-800'} rounded-lg overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900`}>
                    {/* Header with viewed status, active status, recommendation status and time remaining */}
                    <div className={`w-full p-3 flex flex-wrap justify-between items-center gap-2 ${isRecommended ? 'bg-astral-100 dark:bg-astral-900/20 border-b border-astral-300 dark:border-slate-800' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Active status */}
                            <div className={`flex items-center gap-1 border ${publication.is_active ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"} px-2 py-1 rounded-full text-xs`}>
                                <CheckCircleIcon size={12} />
                                <span>{publication.is_active ? "Actief" : "Inactief"}</span>
                            </div>
                        </div>

                        {/* Time remaining badge */}
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
                                {hasDocuments && (
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
                                        {/* Organization, Sector, Region Information - Card style with consistent layout */}
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
                                                        Sector {publication.publication_in_your_sector && <span className="ml-1 text-sm">• In uw sector</span>}
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
                                                        Regio {publication.publication_in_your_region && <span className="ml-1 text-sm">• In uw regio</span>}
                                                    </h3>
                                                </div>
                                                <p className={`${publication.publication_in_your_region ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-800 dark:text-gray-200'} truncate`} title={publication.region?.join(", ") || "N/A"}>
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
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileIcon size={16} className="text-gray-400" />
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Documenten {documentsLoading ? "(Laden...)" : `(${Object.keys(documents || {}).length})`}
                                            </h3>
                                        </div>
                                        
                                        {documentsLoading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <div className="animate-spin h-8 w-8 border-4 border-astral-500 border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                                {Object.keys(documents || {}).length > 0 ? (
                                                    Object.keys(documents || {}).map((doc, index) => (
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
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 text-center p-4 text-gray-500 dark:text-gray-400">
                                                        Geen documenten beschikbaar.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <Button
                                onClick={() => startChat(publication)}
                                className="flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                            >
                                <RiChatSmile2Line className="size-5" />
                                <span>Procy</span>
                            </Button>
                            <Link href={`https://publicprocurement.be/publication-workspaces/${publication.workspace_id}/general`} target="_blank">
                                <Button
                                    className="flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                                >
                                    <RiExternalLinkLine className="size-5" />
                                    <span>Indienen</span>
                                </Button>
                            </Link>
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
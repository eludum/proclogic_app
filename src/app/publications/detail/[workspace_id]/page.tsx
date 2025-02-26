"use client"

import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Publication } from "@/data/publicationSchema";
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
    MapPinIcon,
    PlusIcon,
    StarIcon,
    TagIcon,
    ThumbsUpIcon
} from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatComponent from "../../_components/ChatComponent";

const API_BASE_URL = siteConfig.api_base_url;

export default function PublicationDetail() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspace_id;

    const [publication, setPublication] = useState<Publication | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ai');
    const [activeChatPublication, setActiveChatPublication] = useState<Publication | null>(null);
    const [publicationFiles, setPublicationFiles] = useState<Record<string, any>>({});

    useEffect(() => {
        async function fetchPublication() {
            try {
                const response = await fetch(`${API_BASE_URL}/publications/BE0893620715/publication/${workspaceId}/`);
                const data = await response.json();
                setPublication(data);
            } catch (error) {
                console.error("Error fetching publication:", error);
            } finally {
                setLoading(false);
            }
        }

        if (workspaceId) {
            fetchPublication();
        }
    }, [workspaceId]);

    // Format dates nicely
    const formatDate = (dateString: string | number | Date | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate time remaining until deadline
    const getTimeRemaining = (deadline: string | number | Date | null | undefined) => {
        if (!deadline) return { text: "No deadline", variant: "neutral" };

        const now = new Date();
        const dueDate = new Date(deadline);
        const timeDiff = dueDate.getTime() - now.getTime();

        // If past due
        if (timeDiff < 0) return { text: "Expired", variant: "expired" };

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        // Urgent: less than 3 days
        if (days < 3) {
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days === 0) {
                return { text: `${hours} hours remaining`, variant: "urgent" };
            }
            return { text: `${days}d ${hours}h remaining`, variant: "urgent" };
        }

        // Soon: less than 7 days
        if (days < 7) {
            return { text: `${days} days remaining`, variant: "soon" };
        }

        // Weeks
        if (days < 30) {
            const weeks = Math.floor(days / 7);
            const remainingDays = days % 7;
            return {
                text: `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays}d` : ''} remaining`,
                variant: "comfortable"
            };
        }

        // Months
        const months = Math.floor(days / 30);
        return {
            text: `${months} month${months !== 1 ? 's' : ''} remaining`,
            variant: "comfortable"
        };
    };

    // Get the appropriate styling for the time remaining badge
    const getTimeRemainingStyles = (variant: string) => {
        switch (variant) {
            case "urgent":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
            case "soon":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
            case "comfortable":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
            case "expired":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    // Start a chat with a publication
    const startChat = async (pub: Publication) => {
        try {
            setActiveChatPublication(pub);

            // Fetch the publication files if not already fetched
            if (!publicationFiles[pub.workspace_id]) {
                const response = await fetch(`${API_BASE_URL}/publications/${pub.workspace_id}/files`);
                if (response.ok) {
                    const files = await response.json();
                    setPublicationFiles(prev => ({
                        ...prev,
                        [pub.workspace_id]: files
                    }));
                } else {
                    console.error("Error fetching publication files");
                    // If we can't fetch files, provide an empty object
                    setPublicationFiles(prev => ({
                        ...prev,
                        [pub.workspace_id]: {}
                    }));
                }
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    if (loading) {
        return (
            <section aria-label="Publication Detail" className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="relative min-h-60 w-full flex flex-col justify-center items-center my-6 bg-white shadow-sm border border-slate-200 rounded-lg p-2 dark:bg-[#090E1A]">
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
                                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                                />
                            </svg>
                        </div>
                        <div className="flex justify-center mb-2">
                            <h5 className="text-slate-800 text-2xl font-semibold">
                                Aanbesteding details laden...
                            </h5>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!publication) {
        return (
            <section aria-label="Publication Detail">
                <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbesteding Details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Publication not found</p>
                    </div>
                </div>

                <div className="relative min-h-60 w-full flex flex-col justify-center items-center my-6 bg-white shadow-sm border border-slate-200 rounded-lg p-2 dark:bg-[#090E1A]">
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
                            className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            <ArrowLeftIcon size={16} />
                            <span>Back to Publications</span>
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    // Generate timeline events based on publication data
    const generateTimelineEvents = () => {
        const events = [];

        if (publication.dispatch_date) {
            events.push({
                date: new Date(publication.dispatch_date),
                title: "Publicatie verzonden",
                description: "Aanbesteding officieel verzonden",
                status: "completed",
                icon: <CalendarIcon size={14} />
            });
        }

        if (publication.publication_date) {
            events.push({
                date: new Date(publication.publication_date),
                title: "Gepubliceerd",
                description: "Aanbesteding officieel gepubliceerd",
                status: "completed",
                icon: <FileIcon size={14} />
            });
        }

        // Add current date as a milestone
        const now = new Date();
        events.push({
            date: now,
            title: "Vandaag",
            description: "Huidige datum",
            status: "in-progress",
            icon: <ClockIcon size={14} />
        });

        if (publication.submission_deadline) {
            const deadlineDate = new Date(publication.submission_deadline);
            const status = now > deadlineDate ? "completed" : "upcoming";

            events.push({
                date: deadlineDate,
                title: "Deadline voor indiening",
                description: "Uiterste datum voor het indienen van de aanbieding",
                status: status,
                icon: <CheckCircleIcon size={14} />
            });
        }

        // Sort events by date
        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const timelineEvents = generateTimelineEvents();
    const timeRemaining = getTimeRemaining(publication.submission_deadline);

    return (
        <section aria-label="Publication Detail">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Aanbesteding Details</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gedetailleerde informatie over deze aanbesteding</p>
                </div>
            </div>

            <div className="px-4 sm:px-6 pb-6">
                <div className="w-full max-w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-md bg-white dark:bg-slate-900">
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
                                    <strong>ProcLogic AI beveelt deze publicatie aan voor uw bedrijf</strong> gebaseerd op uw profiel en eerdere activiteit.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Content with padding */}
                    <div className="p-6 flex flex-col gap-6">
                        {/* Header with time remaining badge */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-wrap items-start justify-between gap-4 w-full">
                                <h2 className="text-xl sm:text-2xl font-semibold leading-tight break-words flex-1 min-w-0 text-gray-900 dark:text-white">
                                    {publication.title}
                                </h2>

                                {/* Time remaining badge */}
                                <div className={`flex items-center shrink-0 gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getTimeRemainingStyles(timeRemaining.variant)}`}>
                                    <ClockIcon size={12} />
                                    <span>{timeRemaining.text}</span>
                                </div>
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
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <RiChatSmile2Line className="size-4" />
                                        <span>AI Samenvatting</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('original')}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5  ${activeTab === 'original'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
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
                                            {publication.ai_notice_summary && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                    <h3 className="text-lg font-medium mb-3 text-blue-900 dark:text-blue-200">AI Aankondiging Samenvatting</h3>
                                                    <div className="max-h-80 overflow-y-auto">
                                                        <p className="text-sm text-blue-800 dark:text-blue-200 break-words whitespace-pre-line">
                                                            {publication.ai_notice_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {publication.ai_document_summary && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                                                    <h3 className="text-lg font-medium mb-3 text-emerald-900 dark:text-emerald-200">AI Document Samenvatting</h3>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        <p className="text-sm text-emerald-800 dark:text-emerald-200 break-words whitespace-pre-line">
                                                            {publication.ai_document_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {!publication.ai_notice_summary && !publication.ai_document_summary && (
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
                                <div className="relative max-h-100 overflow-y-auto" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
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
                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {event.icon}
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

                        {/* Organization and Sector Information - Card style */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <BuildingIcon size={16} />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Organisatie</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200">{publication.organisation}</p>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <TagIcon size={16} />
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
                                    <MapPinIcon size={16} />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Regio</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200">
                                    {publication.region?.join(", ") || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* CPV Codes and Value */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <CodeIcon size={16} />
                                    <h3 className="font-medium text-gray-900 dark:text-white">CPV Codes</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm">
                                        <span className="font-medium">Hoofd CPV: </span>
                                        <span>{publication.cpv_code}</span>
                                    </div>

                                    {publication.cpv_additional_codes && publication.cpv_additional_codes.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aanvullende CPV codes:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {publication.cpv_additional_codes.map((code, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300"
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
                                    <EuroIcon size={16} />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Aanbestedingswaarde</h3>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold">
                                    {publication.publication_value || "Niet gespecificeerd"}
                                </p>
                            </div>
                        </div>

                        {/* Documents Section */}
                        {publication.documents && publication.documents.length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileIcon size={16} className="text-blue-500" />
                                    <h3 className="font-medium text-gray-900 dark:text-white">Documenten</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {publication.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileIcon size={14} className="text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc}</span>
                                            </div>
                                            <Button className="flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 p-1.5 rounded-md">
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
                                    <CheckCircleIcon size={16} className="text-green-500" />
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
                            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md w-full sm:w-auto">
                                <PlusIcon size={16} />
                                <span>Opslaan in Mijn Aanbestedingen</span>
                            </Button>
                            <Button
                                onClick={() => startChat(publication)}
                                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                            >
                                <RiChatSmile2Line className="size-5" />
                                <span>Analyze met ProcLogic AI</span>
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
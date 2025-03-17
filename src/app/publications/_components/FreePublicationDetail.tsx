"use client"
import { Button } from "@/components/Button";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import {
    ArrowLeftIcon,
    BarChartIcon,
    BellIcon,
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    DownloadIcon,
    FileIcon,
    LockIcon,
    MapPinIcon,
    TagIcon
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FreePublicationDetail({ publication, timelineEvents }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('original');

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
                    {/* Status banner */}
                    <div className={`w-full py-2 px-4 flex flex-wrap justify-between items-center gap-2 text-xs font-medium text-white ${publication.is_active ? "bg-emerald-500" : "bg-amber-500"}`}>
                        <div className="flex items-center gap-1">
                            <CheckCircleIcon size={14} />
                            <span>{publication.is_active ? "Actieve aanbesteding" : "Inactieve aanbesting"}</span>
                        </div>
                    </div>

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
                                        onClick={() => setActiveTab('original')}
                                        className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'original'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <FileIcon size={14} />
                                        <span>Beschrijving</span>
                                    </button>
                                    <button
                                        className="px-4 py-3 text-sm font-medium flex items-center gap-1.5 text-gray-400 cursor-not-allowed"
                                        disabled
                                    >
                                        <LockIcon size={14} />
                                        <span>AI Samenvatting</span>
                                        <span className="ml-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                                            PRO
                                        </span>
                                    </button>
                                </div>

                                {/* Tab content */}
                                <div className="p-4">
                                    <div>
                                        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Beschrijving</h3>
                                        <div className="max-h-80 overflow-y-auto">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-line">
                                                {publication.original_description}
                                            </p>
                                        </div>
                                    </div>
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
                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
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

                        {/* CTA in the middle of the page */}
                        <div className="w-full my-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Wilt u meer informatie over deze aanbesteding?
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <BarChartIcon size={18} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Bekijk gedetailleerde analyse en insights</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileIcon size={18} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Download alle gerelateerde documenten</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BellIcon size={18} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Ontvang updates over belangrijke ontwikkelingen</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={() => router.push('/pricing')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md shadow-xs"
                                    >
                                        Registreer
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/demo')}
                                        className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 font-medium px-5 py-2.5 rounded-md shadow-xs"
                                    >
                                        Meer informatie
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information Cards */}
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

                        {/* CPV Codes Panel */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 mb-3">
                                <CodeIcon size={16} />
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

                        {/* Documents Section - Premium Feature */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900 relative overflow-hidden">
                            {/* Premium overlay */}
                            <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                                <LockIcon size={24} className="text-gray-500 mb-2" />
                                <p className="text-gray-700 dark:text-gray-300 font-medium text-center mb-1">Premium Functie</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-3">Upgrade naar Premium om documenten te bekijken</p>
                                <Button
                                    onClick={() => router.push('/pricing')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                >
                                    Upgrade Nu
                                </Button>
                            </div>

                            {/* Blurred content behind overlay */}
                            <div className="flex items-center gap-2 mb-4 blur-xs">
                                <FileIcon size={16} className="text-blue-500" />
                                <h3 className="font-medium text-gray-900 dark:text-white">Documenten</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 blur-xs">
                                {Array(3).fill(0).map((_, index) => (
                                    <div key={index} className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileIcon size={14} className="text-gray-400 shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Document_{index + 1}.pdf</span>
                                        </div>
                                        <Button disabled className="flex items-center justify-center bg-transparent text-blue-600 dark:text-blue-400 p-1.5 rounded-md opacity-50">
                                            <DownloadIcon size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Source information with more prominence */}
                        {/* <div className="dark:border-slate-800">
                            <h3 className="font-medium text-base mb-2 text-gray-900 dark:text-white">Indienen</h3>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <a
                                    href={`https://www.publicprocurement.be/publication-workspaces/${publication.workspace_id}/general`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    publicprocurement.be
                                </a>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
}
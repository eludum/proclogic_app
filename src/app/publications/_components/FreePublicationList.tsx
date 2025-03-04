"use client"
import { Button } from "@/components/Button";
import { TableCell, TableRow } from "@/components/Table";
import { formatDate, getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { RiChatSmile2Line } from '@remixicon/react';
import {
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    ExternalLinkIcon,
    LockIcon,
    MapPinIcon,
    PlusIcon,
    StarIcon,
    TagIcon,
    ThumbsUpIcon
} from 'lucide-react';
import { useState } from "react";

export default function FreePublicationList({ publications, isLoggedIn, isPremium, company }) {
    const [expandedPublications, setExpandedPublications] = useState({});

    // Toggles the expanded state of a publication
    const toggleExpand = (id) => {
        setExpandedPublications(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Track clicks on premium features for analytics
    const trackPremiumFeatureClick = (feature) => {
        console.log(`Premium feature click: ${feature}`);
        // In a real implementation, this would send analytics data
    };

    // Redirect to login if not logged in, or to pricing if logged in but not premium
    const handlePremiumFeatureClick = (feature) => {
        trackPremiumFeatureClick(feature);

        if (!isLoggedIn) {
            window.location.href = "/login?redirect=publications&feature=" + feature;
        } else {
            window.location.href = "/pricing?feature=" + feature;
        }
    };

    // Handle save click - different behavior for different user types
    const handleSaveClick = (publicationId) => {
        if (!isLoggedIn) {
            // Redirect to login
            window.location.href = `/login?redirect=publications&action=save&id=${publicationId}`;
            return;
        }

        // If logged in, save the publication (even for free users)
        console.log("Saving publication", publicationId);
        // Implement actual save functionality
    };

    return (
        <>
            {publications.map((publication, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <div className="w-full max-w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow transition-all duration-300 bg-white dark:bg-slate-900">
                            {/* Status banner */}
                            <div className={`w-full py-2 px-4 flex justify-between items-center text-xs font-medium text-white 
                                ${publication.is_active ? "bg-emerald-500" : "bg-amber-500"}`}>
                                <div className="flex items-center gap-1">
                                    <CheckCircleIcon size={14} />
                                    <span>{publication.is_active ? "Actieve aanbesteding" : "Inactieve aanbesting"}</span>
                                </div>

                                {/* We show this badge but make it clickable to upgrade */}
                                {publication.is_recommended && (
                                    <div onClick={() => handlePremiumFeatureClick('recommendation')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                            ${isPremium
                                                ? "bg-white text-emerald-600 cursor-default"
                                                : "bg-white/90 text-emerald-600/90 cursor-pointer hover:bg-white hover:text-emerald-600"}`}
                                    >
                                        {isPremium ? (
                                            <>
                                                <ThumbsUpIcon size={12} />
                                                <span>ProcLogic aanbeveling</span>
                                            </>
                                        ) : (
                                            <>
                                                <LockIcon size={12} />
                                                <span>Premium aanbeveling</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Recommendation banner - Only for premium users */}
                            {isPremium && publication.is_recommended && (
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
                                        <a
                                            href={isLoggedIn ? `/publications/detail/${publication.workspace_id}` : "/login?redirect=publications"}
                                            target="_blank"
                                            className="text-base sm:text-lg font-semibold leading-tight break-words flex-1 min-w-0 hover:underline focus:outline-none"
                                        >
                                            {publication.title}
                                        </a>

                                        {/* Time remaining badge */}
                                        <div className={`flex items-center shrink-0 gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                                            <ClockIcon size={12} />
                                            <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                                        </div>
                                    </div>

                                    {isLoggedIn ? (
                                        <a
                                            href={`/publications/detail/${publication.workspace_id}`}
                                            target="_blank"
                                            className="text-xs text-gray-500 dark:text-gray-400 hover:underline focus:outline-none"
                                        >
                                            ID: {publication.workspace_id}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: {publication.workspace_id}
                                        </span>
                                    )}
                                </div>

                                {/* Limited Description - 100 characters for non-premium, full for premium */}
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                                    {isPremium || expandedPublications[publication.workspace_id]
                                        ? publication.original_description
                                        : publication.original_description.length > 100
                                            ? `${publication.original_description.substring(0, 100)}... `
                                            : publication.original_description}

                                    {!isPremium && publication.original_description.length > 100 && (
                                        <>
                                            {!expandedPublications[publication.workspace_id] && (
                                                <button
                                                    onClick={() => toggleExpand(publication.workspace_id)}
                                                    className="text-blue-600 hover:underline focus:outline-none ml-1"
                                                >
                                                    Meer lezen
                                                </button>
                                            )}
                                            {expandedPublications[publication.workspace_id] && (
                                                <button
                                                    onClick={() => toggleExpand(publication.workspace_id)}
                                                    className="text-blue-600 hover:underline focus:outline-none ml-1"
                                                >
                                                    Minder
                                                </button>
                                            )}
                                        </>
                                    )}
                                </p>

                                {/* Basic Details grid - 2 columns for free users, 4 for premium */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    {/* Organisation - Available to all */}
                                    <div className="flex items-start sm:items-center gap-2">
                                        <BuildingIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Organisatie</span>
                                            <span className="text-gray-800 dark:text-gray-200 break-words">{publication.organisation}</span>
                                        </div>
                                    </div>

                                    {/* Sector - Available to all */}
                                    <div className="flex items-start sm:items-center gap-2">
                                        <TagIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Sector</span>
                                            <span className="text-gray-800 dark:text-gray-200 break-words">{publication.sector}</span>
                                        </div>
                                    </div>

                                    {/* CPV Code - Free users see "locked" version */}
                                    <div className="flex items-start sm:items-center gap-2">
                                        <CodeIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">CPV Code</span>
                                            {isPremium ? (
                                                <span className="text-gray-800 dark:text-gray-200 break-words">{publication.cpv_code}</span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-gray-500 dark:text-gray-400 break-words">
                                                        {publication.cpv_code.substring(0, 2)}XXXXX
                                                    </span>
                                                    <button
                                                        onClick={() => handlePremiumFeatureClick('cpvCode')}
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                    >
                                                        <LockIcon size={10} />
                                                        <span>Premium</span>
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Region - Free users see basic version */}
                                    <div className="flex items-start sm:items-center gap-2">
                                        <MapPinIcon size={14} className="text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400 block sm:inline sm:after:content-[':'] sm:after:mr-1">Regio</span>
                                            {isPremium ? (
                                                <span className="text-gray-800 dark:text-gray-200 break-words">
                                                    {publication.region?.join(", ") || "N/A"}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 break-words">
                                                    {publication.region ? publication.region[0] : "N/A"}
                                                    {publication.region && publication.region.length > 1 && (
                                                        <button
                                                            onClick={() => handlePremiumFeatureClick('region')}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-1"
                                                        >
                                                            <span>+{publication.region.length - 1} meer</span>
                                                            <LockIcon size={10} />
                                                        </button>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                {/* Date badges */}
                                <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md w-full sm:w-auto">
                                        <CalendarIcon size={14} className="shrink-0" />
                                        <span className="whitespace-nowrap">Gepubliceerd: {formatDate(publication.publication_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-md w-full sm:w-auto">
                                        <CalendarIcon size={14} className="shrink-0" />
                                        <span className="whitespace-nowrap">Deadline: {formatDate(publication.submission_deadline)}</span>
                                    </div>
                                </div>

                                {/* Action buttons - Different for free vs premium */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    {/* Save button - Works for all logged in users */}
                                    <Button
                                        onClick={() => handleSaveClick(publication.workspace_id)}
                                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                                    >
                                        <PlusIcon size={16} />
                                        <span>Opslaan</span>
                                    </Button>

                                    {/* View Details button for free users instead of AI Chat */}
                                    {!isPremium ? (
                                        <Button
                                            onClick={() => isLoggedIn
                                                ? window.open(`/publications/detail/${publication.workspace_id}`, '_blank')
                                                : handlePremiumFeatureClick('details')
                                            }
                                            className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-3 rounded-md w-full sm:w-auto"
                                        >
                                            <ExternalLinkIcon size={16} />
                                            <span>Details bekijken</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => window.open(`/publications/detail/${publication.workspace_id}?chat=true`, '_blank')}
                                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                                        >
                                            <RiChatSmile2Line className="size-5" />
                                            <span>ProcLogic AI</span>
                                        </Button>
                                    )}

                                    {/* For non-premium users, add an upgrade button */}
                                    {!isPremium && (
                                        <Button
                                            onClick={() => handlePremiumFeatureClick('ai')}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                                        >
                                            <StarIcon size={16} />
                                            <span>Upgrade voor AI</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}
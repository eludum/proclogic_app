// Expandable text component for description
function ExpandableText({ text, maxLength }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if text needs expansion
    const needsExpansion = text.length > maxLength;
    const displayText = isExpanded ? text : text.substring(0, maxLength);

    return (
        <div>
            <p className={isExpanded ? "break-words" : ""}>
                {isExpanded ? text : displayText + (needsExpansion ? '...' : '')}
            </p>
            {needsExpansion && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-astral-600 dark:text-astral-400 text-xs mt-1 flex items-center hover:underline"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={12} className="mr-1" /> Minder weergeven
                        </>
                    ) : (
                        <>
                            <ChevronDown size={12} className="mr-1" /> Meer weergeven
                        </>
                    )}
                </button>
            )}
        </div>
    );
}// PublicationCard.jsx
import { Button } from "@/components/Button";
import { getTimeRemaining, getTimeRemainingStyles } from "@/lib/publicationUtils";
import { RiChatSmile2Line } from '@remixicon/react';
import { BookmarkCheck, BookmarkPlus, BuildingIcon, CheckCircleIcon, ChevronDown, ChevronUp, ClockIcon, CodeIcon, Eye, EyeOff, Layers, MapPinIcon, StarIcon, TagIcon } from 'lucide-react';
import { useState } from 'react';

export function PublicationCard({
    publication,
    onStartChat,
    onSave,
    onUnsave,
    onMarkAsViewed,
    isSaving,
    isUnsaving
}) {
    const isRecommended = publication.is_recommended;
    const isViewed = publication.is_viewed;

    return (
        <div className={`w-full max-w-full border ${isRecommended ? 'border-astral-300 dark:border-astral-800' : 'border-slate-200 dark:border-slate-800'} rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900`}>
            {/* Header with viewed status, active status, recommendation status and time remaining */}
            <div className={`w-full p-3 flex flex-wrap justify-between items-center gap-2 ${isRecommended ? 'bg-astral-100 dark:bg-astral-900/20 border-b border-astral-300 dark:border-slate-800' : 'border-b border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Active status */}
                    <div className={`flex items-center gap-1 border ${publication.is_active ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"} px-2 py-1 rounded-full text-xs`}>
                        <CheckCircleIcon size={12} />
                        <span>{publication.is_active ? "Actief" : "Inactief"}</span>
                    </div>

                    {/* Viewed status */}
                    <div className="flex items-center border gap-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {isViewed ? (
                            <>
                                <Eye size={12} />
                                <span>Bekeken</span>
                            </>
                        ) : (
                            <>
                                <EyeOff size={12} />
                                <span>Niet bekeken</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Time remaining badge */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTimeRemainingStyles(getTimeRemaining(publication.submission_deadline).variant)}`}>
                    <ClockIcon size={12} />
                    <span>{getTimeRemaining(publication.submission_deadline).text}</span>
                </div>
            </div>

            {/* Recommendation banner (if recommended) */}
            {isRecommended && (
                <div className="w-full bg-astral-100 dark:bg-astral-900/20 px-4 py-2 border-b border-astral-300 dark:border-astral-800">
                    <div className="flex items-center gap-2">
                        <StarIcon size={22} className="text-amber-500 shrink-0" />
                        <span className="text-xs text-astral-800 dark:text-astral-200">
                            <strong>ProcLogic AI beveelt deze publicatie aan voor uw bedrijf</strong> gebaseerd op uw profiel.
                        </span>
                    </div>
                </div>
            )}

            {/* Content with padding */}
            <div className="p-4 sm:p-6 flex flex-col gap-4">
                {/* Header with title */}
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap items-start w-full">
                        <a
                            href={`/publications/detail/${publication.workspace_id}`}
                            target="_blank"
                            className="text-base sm:text-lg font-semibold leading-tight break-words flex-1 min-w-0 hover:underline focus:outline-hidden line-clamp-2"
                            onClick={() => onMarkAsViewed(publication)}
                            title={publication.title}
                        >
                            {publication.title}
                        </a>
                    </div>
                    <a
                        href={`/publications/detail/${publication.workspace_id}`}
                        target="_blank"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:underline focus:outline-hidden"
                        onClick={() => onMarkAsViewed(publication)}
                    >
                        ID: {publication.workspace_id}
                    </a>
                </div>

                {/* Description section */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    <ExpandableText text={publication.original_description} maxLength={150} />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <DetailItem
                        icon={<BuildingIcon size={16} />}
                        label="Organisatie"
                        value={publication.organisation}
                    />
                    <DetailItem
                        icon={<TagIcon size={14} />}
                        label="Sector"
                        value={publication.sector}
                    />
                    <DetailItem
                        icon={<CodeIcon size={14} />}
                        label="CPV Code"
                        value={publication.cpv_code}
                    />
                    <DetailItem
                        icon={<MapPinIcon size={14} />}
                        label="Regio"
                        value={publication.region?.join(", ") || "N/A"}
                        truncate={true}
                    />
                </div>

                {/* Lots section (if available) */}
                {renderItemList(publication.lots, "Percelen", <Layers size={14} />)}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    {publication.is_saved ? (
                        <Button
                            onClick={() => onUnsave(publication)}
                            disabled={isUnsaving}
                            variant="secondary"
                            className="flex items-center justify-center gap-2"
                        >
                            {isUnsaving ? (
                                <>
                                    <BookmarkCheck size={16} />
                                    <span>Verwijderen ...</span>
                                </>
                            ) : (
                                <>
                                    <BookmarkCheck size={16} />
                                    <span>Verwijderen</span>
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onSave(publication)}
                            disabled={isSaving}
                            variant="secondary"
                            className="flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <BookmarkPlus size={16} />
                                    <span>Opslaan ...</span>
                                </>
                            ) : (
                                <>
                                    <BookmarkPlus size={16} />
                                    <span>Opslaan</span>
                                </>
                            )}
                        </Button>
                    )}
                    <Button
                        onClick={() => onStartChat(publication)}
                        className="flex items-center justify-center gap-2 bg-astral-500 hover:bg-astral-600 text-white px-4 py-3 rounded-md w-full sm:w-auto"
                    >
                        <RiChatSmile2Line className="size-5" />
                        <span>ProcLogic AI</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Helper components
function DetailItem({ icon, label, value, truncate = false }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
                <span className="font-medium text-gray-500 dark:text-gray-400 inline after:content-[':'] after:mr-1">{label}</span>
                <span className={`text-gray-800 dark:text-gray-200 ${truncate ? 'truncate' : 'break-words'}`} title={value}>
                    {value}
                </span>
            </div>
        </div>
    );
}

function renderItemList(items, title, icon) {
    if (!items || items.length === 0) return null;

    return (
        <div className="mt-1">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 mt-0.5 sm:mt-0 shrink-0">{icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{title} ({items.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="text-xs bg-slate-50 dark:bg-slate-800 rounded p-2 truncate" title={item}>
                        {item}
                    </div>
                ))}
                {items.length > 4 && (
                    <div className="text-xs text-astral-600 dark:text-astral-400 p-2">
                        +{items.length - 4} meer
                    </div>
                )}
            </div>
        </div>
    );
}
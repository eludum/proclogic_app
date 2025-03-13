import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { BuildingIcon, Clock, Edit, ExternalLink, StickyNote } from 'lucide-react';

// Types
interface PublicationItem {
    publication_workspace_id: string;
    title: string;
    organisation: string;
    submission_deadline: string | null;
    is_active: boolean;
    notes: string | null;
    position: number;
    match_percentage?: number;
}

interface KanbanCardProps {
    publication: PublicationItem;
    columnId: number;
    onOpenNotes: () => void;
}

export default function KanbanCard({ publication, columnId, onOpenNotes }: KanbanCardProps) {
    // Set up sortable
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: `${publication.publication_workspace_id}:${columnId}`,
        data: {
            publication,
            columnId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    // Format deadline
    const formattedDeadline = publication.submission_deadline
        ? formatDistanceToNow(new Date(publication.submission_deadline), {
            addSuffix: true,
            locale: nl
        })
        : 'Geen deadline';

    // Get status badge styling
    const getStatusBadgeStyles = () => {
        if (!publication.is_active) {
            return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
        }

        if (!publication.submission_deadline) {
            return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
        }

        const deadline = new Date(publication.submission_deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        } else if (daysLeft <= 7) {
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        } else {
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        }
    };

    // Get status text
    const getStatusText = () => {
        if (!publication.is_active) {
            return 'Inactief';
        }

        if (!publication.submission_deadline) {
            return 'Geen deadline';
        }

        const deadline = new Date(publication.submission_deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            return 'Verlopen';
        } else if (daysLeft === 1) {
            return '1 dag over';
        } else {
            return `${daysLeft} dagen over`;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow mb-2 cursor-grab active:cursor-grabbing touch-manipulation"
        >
            {/* Card header with title */}
            <div className="mb-2">
                <div className="flex items-start gap-2 justify-between">
                    <a
                        href={`/publications/detail/${publication.publication_workspace_id}`}
                        target="_blank"
                        className="text-sm font-medium text-gray-800 dark:text-white hover:text-astral-600 dark:hover:text-astral-400 line-clamp-2 flex-1"
                    >
                        {publication.title}
                    </a>
                    <a
                        href={`/publications/detail/${publication.publication_workspace_id}`}
                        target="_blank"
                        className="text-gray-500 dark:text-gray-400 hover:text-astral-600 dark:hover:text-astral-400 p-1 flex-shrink-0"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Organisation */}
            <div className="flex items-center gap-1.5 mb-2">
                <BuildingIcon size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {publication.organisation}
                </span>
            </div>

            {/* Status and deadline */}
            <div className="flex items-center justify-between mb-2">
                <div className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusBadgeStyles()}`}>
                    <Clock size={10} />
                    <span>{getStatusText()}</span>
                </div>
                {publication.match_percentage && (
                    <div className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Match: {Math.round(publication.match_percentage)}%
                    </div>
                )}
            </div>

            {/* Notes indicator */}
            {publication.notes && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    <div className="flex items-center gap-1 mb-1">
                        <StickyNote size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Notities:</span>
                    </div>
                    {publication.notes}
                </div>
            )}

            {/* Actions */}
            <div className="mt-2 flex justify-end">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onOpenNotes();
                    }}
                    className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-astral-600 dark:hover:text-astral-400"
                >
                    <Edit size={12} />
                    <span>Notities</span>
                </button>
            </div>
        </div>
    );
}
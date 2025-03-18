import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import KanbanCard from './KanbanCard';
import PublicationNotesDialog from './PublicationNotesDialog';

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

interface ColumnProps {
    column: {
        id: number;
        name: string;
        color: string;
        position: number;
        is_default: boolean;
        publications: PublicationItem[];
    };
    onEditStatus: () => void;
    onUpdateNotes: (publicationId: string, statusId: number, notes: string) => Promise<void>;
}

export default function KanbanColumn({ column, onEditStatus, onUpdateNotes }: ColumnProps) {
    // State for notes dialog
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);

    // Set up droppable area - using column ID as the droppable ID
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${column.id}`,
    });

    // Get publication IDs for the sortable context
    const publicationIds = column.publications.map(
        pub => `${pub.publication_workspace_id}:${column.id}`
    );

    // Handle opening notes dialog
    const handleOpenNotes = (publication: PublicationItem) => {
        setSelectedPublication(publication);
        setNotesDialogOpen(true);
    };

    // Handle saving notes
    const handleSaveNotes = async (notes: string) => {
        if (selectedPublication) {
            await onUpdateNotes(
                selectedPublication.publication_workspace_id,
                column.id,
                notes
            );
            setNotesDialogOpen(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-[18rem] max-w-[18rem]">
            {/* Column header */}
            <div
                className="p-3 flex justify-between items-center rounded-t-lg"
                style={{ backgroundColor: column.color + '20' }} // Use column color with transparency
            >
                <div className="flex items-center">
                    <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: column.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                        {column.name}
                    </h3>
                    <div className="ml-2 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300">
                        {column.publications.length}
                    </div>
                </div>

                <button
                    onClick={onEditStatus}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                    title="Bewerk status"
                >
                    <Edit size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Droppable area for cards */}
            <div
                ref={setNodeRef}
                className={`p-2 flex-grow overflow-y-auto max-h-[calc(100vh-12rem)] ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
            >
                {column.publications.length === 0 ? (
                    <div className="text-center py-6 px-2 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        Sleep een aanbesteding naar hier
                    </div>
                ) : (
                    <SortableContext
                        items={publicationIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {column.publications
                            .sort((a, b) => a.position - b.position)
                            .map((publication) => (
                                <KanbanCard
                                    key={publication.publication_workspace_id}
                                    publication={publication}
                                    columnId={column.id}
                                    onOpenNotes={() => handleOpenNotes(publication)}
                                />
                            ))
                        }
                    </SortableContext>
                )}
            </div>

            {/* Notes dialog */}
            <PublicationNotesDialog
                isOpen={notesDialogOpen}
                onClose={() => setNotesDialogOpen(false)}
                publication={selectedPublication}
                onSave={handleSaveNotes}
            />
        </div>
    );
}
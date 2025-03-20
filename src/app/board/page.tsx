// Updated board/page.tsx with layout fixes to prevent content from scrolling behind sidebar

"use client"

import { siteConfig } from "@/app/siteConfig";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import KanbanCard from './_components/KanbanCard';
import KanbanColumn from './_components/KanbanColumn';
import KanbanHeader from './_components/KanbanHeader';
import StatusDialog from './_components/StatusDialog';

const API_BASE_URL = siteConfig.api_base_url;

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

interface StatusColumn {
    id: number;
    name: string;
    color: string;
    position: number;
    is_default: boolean;
    publications: PublicationItem[];
}

interface KanbanData {
    columns: StatusColumn[];
}

export default function KanbanBoardPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [kanbanData, setKanbanData] = useState<KanbanData>({ columns: [] });
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [editingStatus, setEditingStatus] = useState<StatusColumn | null>(null);
    const [activePublication, setActivePublication] = useState<PublicationItem | null>(null);
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

    // Configure sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px of movement required before activating
            },
        })
    );

    // Fetch kanban board data
    const fetchKanbanBoard = async () => {
        setIsLoading(true);

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/kanban/board`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch kanban board: ${response.status}`);
            }

            const data = await response.json();
            setKanbanData(data);
        } catch (error) {
            console.error('Error fetching kanban board:', error);
            toast({
                title: "Fout bij laden",
                description: "Het Kanban bord kon niet worden geladen. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on initial render
    useEffect(() => {
        fetchKanbanBoard();
    }, []);

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const [publicationId, columnId] = active.id.toString().split(':');

        // Save the active column ID
        setActiveColumnId(columnId);

        // Find the active publication
        const column = kanbanData.columns.find(col => col.id.toString() === columnId);
        if (column) {
            const publication = column.publications.find(pub =>
                pub.publication_workspace_id === publicationId
            );
            if (publication) {
                setActivePublication(publication);
            }
        }
    };

    // Handle drag over
    const handleDragOver = (event: DragOverEvent) => {
        // In this implementation, we don't modify state during dragOver
        // This prevents the card from snapping to intermediate columns
    };

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Get the publication and original column IDs
        const [activePublicationId, sourceColumnId] = active.id.toString().split(':');

        // Reset state
        setActivePublication(null);
        setActiveColumnId(null);

        // Return if no drop target
        if (!over) return;

        let targetColumnId;
        let overPublicationId;

        // Parse the target ID
        if (over.id.toString().includes('column:')) {
            // Dropped directly on a column
            targetColumnId = over.id.toString().replace('column:', '');
            overPublicationId = null;
        } else {
            // Dropped on another publication card
            [overPublicationId, targetColumnId] = over.id.toString().split(':');
        }

        // Do nothing if dropped in the same column on the same publication
        if (sourceColumnId === targetColumnId && activePublicationId === overPublicationId) {
            return;
        }

        // Find the columns
        const sourceColumn = kanbanData.columns.find(col => col.id.toString() === sourceColumnId);
        const targetColumn = kanbanData.columns.find(col => col.id.toString() === targetColumnId);

        if (!sourceColumn || !targetColumn) return;

        // Calculate positions and update state
        // Different behavior based on whether it's same-column or cross-column
        if (sourceColumnId === targetColumnId) {
            // Same column reordering
            const oldIndex = sourceColumn.publications.findIndex(
                p => p.publication_workspace_id === activePublicationId
            );

            const newIndex = overPublicationId ?
                sourceColumn.publications.findIndex(p => p.publication_workspace_id === overPublicationId) :
                sourceColumn.publications.length;

            if (oldIndex === newIndex) return;

            // Update state with reordered publications
            setKanbanData(prev => {
                const newColumns = [...prev.columns];
                const columnIndex = newColumns.findIndex(col => col.id.toString() === sourceColumnId);

                // Reorder publications in this column
                newColumns[columnIndex].publications = arrayMove(
                    newColumns[columnIndex].publications,
                    oldIndex,
                    newIndex
                );

                // Update positions
                newColumns[columnIndex].publications.forEach((pub, index) => {
                    pub.position = index;
                });

                return { columns: newColumns };
            });

            // Send API update for the position change
            await updatePublicationPosition(
                activePublicationId,
                parseInt(targetColumnId),
                overPublicationId ?
                    targetColumn.publications.findIndex(p => p.publication_workspace_id === overPublicationId) :
                    targetColumn.publications.length
            );

        } else {
            // Moving between columns
            // First, update our local state
            setKanbanData(prev => {
                const newColumns = [...prev.columns];

                // Find indexes
                const sourceColumnIndex = newColumns.findIndex(col => col.id.toString() === sourceColumnId);
                const targetColumnIndex = newColumns.findIndex(col => col.id.toString() === targetColumnId);
                const publicationIndex = newColumns[sourceColumnIndex].publications.findIndex(
                    p => p.publication_workspace_id === activePublicationId
                );

                if (publicationIndex === -1) return prev;

                // Remove from source column
                const [publication] = newColumns[sourceColumnIndex].publications.splice(publicationIndex, 1);

                // Where to insert in target column
                let insertIndex = newColumns[targetColumnIndex].publications.length;

                if (overPublicationId) {
                    const overIndex = newColumns[targetColumnIndex].publications.findIndex(
                        p => p.publication_workspace_id === overPublicationId
                    );

                    if (overIndex !== -1) {
                        insertIndex = overIndex;
                    }
                }

                // Add to target column
                newColumns[targetColumnIndex].publications.splice(insertIndex, 0, {
                    ...publication,
                    position: insertIndex
                });

                // Update positions in target column
                newColumns[targetColumnIndex].publications.forEach((pub, index) => {
                    pub.position = index;
                });

                return { columns: newColumns };
            });

            // Send API update for the column and position change
            await updatePublicationPosition(
                activePublicationId,
                parseInt(targetColumnId),
                overPublicationId ?
                    targetColumn.publications.findIndex(p => p.publication_workspace_id === overPublicationId) :
                    targetColumn.publications.length
            );
        }
    };

    // Helper function to update publication position via API
    const updatePublicationPosition = async (
        publicationId: string,
        newStatusId: number,
        newPosition: number
    ) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/kanban/move`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    publication_workspace_id: publicationId,
                    new_status_id: newStatusId,
                    new_position: newPosition
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update publication position: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating publication position:', error);
            toast({
                title: "Fout bij opslaan",
                description: "De wijziging kon niet worden opgeslagen. De weergave wordt vernieuwd.",
                variant: "error"
            });

            // Refresh data to ensure consistency
            fetchKanbanBoard();
        }
    };

    // Create a new status
    const handleCreateStatus = async (name: string, color: string) => {
        try {
            const token = await getToken();

            // Determine next position
            const position = kanbanData.columns.length;

            const response = await fetch(`${API_BASE_URL}/kanban/statuses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    color,
                    position,
                    is_default: false
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create status: ${response.status}`);
            }

            // Refresh board data
            fetchKanbanBoard();

            toast({
                title: "Status toegevoegd",
                description: `De status "${name}" is toegevoegd aan het bord.`,
                variant: "success"
            });
        } catch (error) {
            console.error('Error creating status:', error);
            toast({
                title: "Fout bij aanmaken",
                description: "De status kon niet worden aangemaakt.",
                variant: "error"
            });
        }
    };

    // Update an existing status
    const handleUpdateStatus = async (id: number, name: string, color: string) => {
        try {
            const token = await getToken();

            const response = await fetch(`${API_BASE_URL}/kanban/statuses/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    color
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update status: ${response.status}`);
            }

            // Refresh board data
            fetchKanbanBoard();

            toast({
                title: "Status bijgewerkt",
                description: `De status "${name}" is bijgewerkt.`,
                variant: "success"
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Fout bij bijwerken",
                description: "De status kon niet worden bijgewerkt.",
                variant: "error"
            });
        }
    };

    // Delete a status
    const handleDeleteStatus = async (id: number) => {
        try {
            const token = await getToken();

            const response = await fetch(`${API_BASE_URL}/kanban/statuses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete status: ${response.status}`);
            }

            // Refresh board data
            fetchKanbanBoard();

            toast({
                title: "Status verwijderd",
                description: "De status is verwijderd van het bord.",
                variant: "success"
            });
        } catch (error) {
            console.error('Error deleting status:', error);
            toast({
                title: "Fout bij verwijderen",
                description: "De status kon niet worden verwijderd. Controleer of er nog een andere status beschikbaar is.",
                variant: "error"
            });
        }
    };

    // Update publication notes
    const handleUpdatePublicationNotes = async (publicationId: string, statusId: number, notes: string) => {
        try {
            const token = await getToken();

            const response = await fetch(`${API_BASE_URL}/kanban/publications/${publicationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update notes: ${response.status}`);
            }

            // Update local state
            setKanbanData(prev => {
                const newColumns = [...prev.columns];
                const columnIndex = newColumns.findIndex(col => col.id === statusId);

                if (columnIndex !== -1) {
                    const publicationIndex = newColumns[columnIndex].publications.findIndex(
                        pub => pub.publication_workspace_id === publicationId
                    );

                    if (publicationIndex !== -1) {
                        newColumns[columnIndex].publications[publicationIndex].notes = notes;
                    }
                }

                return { columns: newColumns };
            });

            toast({
                title: "Notities bijgewerkt",
                description: "De notities zijn opgeslagen.",
                variant: "success"
            });
        } catch (error) {
            console.error('Error updating notes:', error);
            toast({
                title: "Fout bij opslaan",
                description: "De notities konden niet worden opgeslagen.",
                variant: "error"
            });
        }
    };

    // Open status dialog for editing
    const openEditStatusDialog = (status: StatusColumn) => {
        setEditingStatus(status);
        setShowStatusDialog(true);
    };

    // Open status dialog for creating new status
    const openCreateStatusDialog = () => {
        setEditingStatus(null);
        setShowStatusDialog(true);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <Toaster />

            {/* Header with title and add column button */}
            <KanbanHeader
                onAddStatus={openCreateStatusDialog}
            />

            {/* Status dialog for creating/editing statuses */}
            <StatusDialog
                isOpen={showStatusDialog}
                onClose={() => setShowStatusDialog(false)}
                status={editingStatus}
                onCreateStatus={handleCreateStatus}
                onUpdateStatus={handleUpdateStatus}
                onDeleteStatus={handleDeleteStatus}
            />

            {/* Main kanban board */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader loadingtext="Kanban bord laden..." size={32} />
                </div>
            ) : (
                <div className="flex-grow w-full overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="w-full h-full overflow-x-auto overflow-y-auto">
                            <div className="p-4 pb-6 inline-flex gap-4 min-w-max">
                                {kanbanData.columns
                                    .sort((a, b) => a.position - b.position)
                                    .map(column => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            onEditStatus={() => openEditStatusDialog(column)}
                                            onUpdateNotes={handleUpdatePublicationNotes}
                                        />
                                    ))}
                            </div>
                        </div>

                        {/* Drag overlay - what appears when dragging */}
                        <DragOverlay>
                            {activePublication && (
                                <div className="opacity-70">
                                    <KanbanCard
                                        publication={activePublication}
                                        columnId={parseInt(activeColumnId || "0")}
                                        onOpenNotes={() => { }}
                                    />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}
        </div>
    );
}
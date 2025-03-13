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
import StatusDialog from './_components/StatusDialog.tsx';

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

    // Handle drag over - when dragging over different columns
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const [activePublicationId, activeColumnId] = active.id.toString().split(':');
        const [, overColumnId] = over.id.toString().split(':');

        // Return if not dragging between different columns
        if (activeColumnId === overColumnId) return;

        setKanbanData(prev => {
            const activeColumn = prev.columns.find(col => col.id.toString() === activeColumnId);
            const overColumn = prev.columns.find(col => col.id.toString() === overColumnId);

            if (!activeColumn || !overColumn) return prev;

            // Find the publication to move
            const publicationIndex = activeColumn.publications.findIndex(
                p => p.publication_workspace_id === activePublicationId
            );

            if (publicationIndex === -1) return prev;

            // Create new state
            const newColumns = [...prev.columns];
            const activeColumnIndex = newColumns.findIndex(col => col.id.toString() === activeColumnId);
            const overColumnIndex = newColumns.findIndex(col => col.id.toString() === overColumnId);

            // Remove from source column
            const [publication] = newColumns[activeColumnIndex].publications.splice(publicationIndex, 1);

            // Add to destination column
            newColumns[overColumnIndex].publications.push({
                ...publication,
                position: newColumns[overColumnIndex].publications.length
            });

            return { columns: newColumns };
        });
    };

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Reset active publication
        setActivePublication(null);

        // Return if no drop target
        if (!over) return;

        const [activePublicationId, activeColumnId] = active.id.toString().split(':');
        const [overPublicationId, overColumnId] = over.id.toString().split(':');

        // Find columns
        const activeColumn = kanbanData.columns.find(col => col.id.toString() === activeColumnId);
        const overColumn = kanbanData.columns.find(col => col.id.toString() === overColumnId);

        if (!activeColumn || !overColumn) return;

        // If dragging in the same column, reorder
        if (activeColumnId === overColumnId) {
            const oldIndex = activeColumn.publications.findIndex(
                p => p.publication_workspace_id === activePublicationId
            );
            const newIndex = activeColumn.publications.findIndex(
                p => p.publication_workspace_id === overPublicationId
            );

            if (oldIndex === newIndex) return;

            // Create new state with reordered publications
            setKanbanData(prev => {
                const newColumns = [...prev.columns];
                const columnIndex = newColumns.findIndex(col => col.id.toString() === activeColumnId);

                // Reorder publications
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

            // Send update to API for position change
            try {
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/kanban/move`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publication_workspace_id: activePublicationId,
                        new_status_id: parseInt(activeColumnId),
                        new_position: overColumn.publications.findIndex(
                            p => p.publication_workspace_id === overPublicationId
                        )
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
        } else {
            // If already moved between columns in dragOver event, just update the API
            try {
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/kanban/move`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publication_workspace_id: activePublicationId,
                        new_status_id: parseInt(overColumnId),
                        new_position: overColumn.publications.length - 1 // Add to the end
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
        <section aria-label="Kanban Board">
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
                    <Loader loadingtext="Kanban bord laden..." />
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="p-4 flex overflow-x-auto pb-6">
                        <div className="flex gap-4">
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
                                    onOpenNotes={() => { }}
                                />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            )}
        </section>
    );
}
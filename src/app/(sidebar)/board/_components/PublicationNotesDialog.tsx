import { Button } from '@/components/Button';
import { StickyNote, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface PublicationNotesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    publication: PublicationItem | null;
    onSave: (notes: string) => Promise<void>;
}

export default function PublicationNotesDialog({
    isOpen,
    onClose,
    publication,
    onSave
}: PublicationNotesDialogProps) {
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Set initial notes when dialog opens
    useEffect(() => {
        if (isOpen && publication) {
            setNotes(publication.notes || '');
        }
    }, [isOpen, publication]);

    // Handle save
    const handleSave = async () => {
        if (!publication) return;

        setIsLoading(true);

        try {
            await onSave(notes);
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !publication) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="text-astral-600 dark:text-astral-400" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notities
                    </h2>
                </div>

                <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
                        {publication.title}
                    </h3>
                </div>

                <div className="mb-5">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notities voor deze aanbesteding
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-astral-500 dark:bg-gray-800 dark:text-white resize-none"
                        placeholder="Voeg hier je notities toe..."
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        Annuleren
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Opslaan...' : 'Opslaan'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
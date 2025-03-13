import { Button } from '@/components/Button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status: {
        id: number;
        name: string;
        color: string;
        position: number;
        is_default: boolean;
    } | null;
    onCreateStatus: (name: string, color: string) => Promise<void>;
    onUpdateStatus: (id: number, name: string, color: string) => Promise<void>;
    onDeleteStatus: (id: number) => Promise<void>;
}

export default function StatusDialog({
    isOpen,
    onClose,
    status,
    onCreateStatus,
    onUpdateStatus,
    onDeleteStatus
}: StatusDialogProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3883a4'); // Default color
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset form when dialog opens or status changes
    useEffect(() => {
        if (isOpen) {
            if (status) {
                setName(status.name);
                setColor(status.color);
            } else {
                setName('');
                setColor('#3883a4');
            }
            setShowDeleteConfirm(false);
        }
    }, [isOpen, status]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return; // Don't submit if name is empty
        }

        setIsLoading(true);

        try {
            if (status) {
                await onUpdateStatus(status.id, name, color);
            } else {
                await onCreateStatus(name, color);
            }
            onClose();
        } catch (error) {
            console.error('Error saving status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!status) return;

        setIsLoading(true);

        try {
            await onDeleteStatus(status.id);
            onClose();
        } catch (error) {
            console.error('Error deleting status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Predefined color options
    const colorOptions = [
        { name: 'Blauw', value: '#3883a4' },
        { name: 'Licht Blauw', value: '#52b7c2' },
        { name: 'Groen', value: '#00cc66' },
        { name: 'Lime', value: '#b7bf10' },
        { name: 'Oranje', value: '#ff9900' },
        { name: 'Rood', value: '#ff6666' },
        { name: 'Paars', value: '#9966cc' },
        { name: 'Grijs', value: '#6b7280' },
    ];

    if (!isOpen) return null;

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

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {status ? 'Status bewerken' : 'Nieuwe status'}
                </h2>

                {showDeleteConfirm ? (
                    <div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="font-medium text-red-700 dark:text-red-400">
                                        Weet je zeker dat je "{status?.name}" wilt verwijderen?
                                    </h3>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                        Aanbestedingen in deze status worden naar een andere status verplaatst.
                                        Deze actie kan niet ongedaan worden gemaakt.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                variant="secondary"
                                disabled={isLoading}
                            >
                                Annuleren
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Bezig...' : 'Verwijderen'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Name input */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Naam
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-astral-500 dark:bg-gray-800 dark:text-white"
                                placeholder="Voer status naam in"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Color selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kleur
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setColor(option.value)}
                                        className={`w-full aspect-square rounded-full border-2 ${color === option.value
                                                ? 'border-gray-900 dark:border-white'
                                                : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: option.value }}
                                        title={option.name}
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Voorbeeld
                            </label>
                            <div
                                className="p-3 flex items-center rounded-lg"
                                style={{ backgroundColor: color + '20' }} // Using color with transparency
                            >
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: color }}
                                ></div>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                    {name || 'Status naam'}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between">
                            {status && !status.is_default ? (
                                <Button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    disabled={isLoading}
                                >
                                    <Trash2 size={16} className="mr-1" />
                                    Verwijderen
                                </Button>
                            ) : (
                                <div></div> /* Empty div for spacing */
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    variant="secondary"
                                    disabled={isLoading}
                                >
                                    Annuleren
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !name.trim()}
                                >
                                    {isLoading ? 'Bezig...' : (status ? 'Opslaan' : 'Toevoegen')}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
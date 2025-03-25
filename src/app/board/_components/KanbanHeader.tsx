import { Button } from '@/components/Button';
import { PlusIcon } from 'lucide-react';

interface KanbanHeaderProps {
    onAddStatus: () => void;
}

export default function KanbanHeader({ onAddStatus }: KanbanHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Overzichtsbord
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sleep aanbestedingen tussen de verschillende statussen om uw workflow te organiseren
                </p>
            </div>

            <div className="flex flex-shrink-0">
                <Button
                    onClick={onAddStatus}
                    className="flex items-center gap-2 bg-astral-600 hover:bg-astral-700 text-white"
                >
                    <PlusIcon size={16} />
                    <span>Nieuwe Status</span>
                </Button>
            </div>
        </div>
    );
}
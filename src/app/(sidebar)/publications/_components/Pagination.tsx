import { Button } from "@/components/Button";
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

// Define the prop types for the Pagination component
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange, isLoading }: PaginationProps) {
    // Generate page numbers for pagination
    const generatePageNumbers = (): (number | string)[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pageNumbers = generatePageNumbers();

    return (
        <>
            <div className="flex justify-center mt-8 mb-4">
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className="flex items-center justify-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                        <ChevronLeftIcon size={18} />
                    </Button>

                    {pageNumbers.map((pageNum, index) => (
                        <Button
                            key={index}
                            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
                            disabled={pageNum === '...' || pageNum === currentPage || isLoading}
                            className={`px-4 py-2 rounded-md ${pageNum === currentPage
                                ? 'bg-astral-500 text-white dark:bg-astral-600'
                                : pageNum === '...'
                                    ? 'bg-transparent text-gray-500 dark:text-gray-400 cursor-default'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {pageNum}
                        </Button>
                    ))}

                    <Button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                        className="flex items-center justify-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                        <ChevronRightIcon size={18} />
                    </Button>
                </div>
            </div>

            {/* Page info */}
            {isLoading ? (
                null
            ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 mb-2">
                    Pagina {currentPage} van {totalPages} &middot; Totaal {totalItems}
                </div>
            )}
        </>
    );
}

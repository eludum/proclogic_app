"use client"

interface PublicationSkeletonProps {
    count?: number;
}

export function PublicationSkeleton({ count = 10 }: PublicationSkeletonProps) {
    return (
        <div className="w-full space-y-6">
            {/* Filter skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6">
                <div className="space-y-4">
                    {/* Search bar skeleton */}
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>

                    {/* Filter buttons skeleton */}
                    <div className="flex flex-wrap gap-2">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results count skeleton */}
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>

            {/* Publication cards skeleton */}
            <div className="space-y-6">
                {Array(count).fill(0).map((_, index) => (
                    <PublicationCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}

function PublicationCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6">
            <div className="space-y-4">
                {/* Header with title and badges */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-3/4"></div>
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
                            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                    </div>
                </div>

                {/* Organization and metadata */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-2/3"></div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
                </div>
            </div>
        </div>
    );
}
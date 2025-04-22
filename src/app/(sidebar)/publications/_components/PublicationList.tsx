"use client"
import { siteConfig } from "@/app/siteConfig";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatComponent from "./ChatComponent";
import FilterCard from "./FilterCard";
import { Pagination } from "./Pagination";
import { PublicationCard } from "./PublicationCard";

const API_BASE_URL = siteConfig.api_base_url;

// Define types for our component
interface Publication {
    workspace_id: string;
    title: string;
    original_description: string;
    is_active: boolean;
    submission_deadline?: string | Date;
    organisation: string;
    sector: string;
    cpv_code: string;
    region?: string[];
    is_recommended?: boolean;
    is_viewed?: boolean;
    is_saved?: boolean;
    match_percentage?: number;
    publication_in_your_sector?: boolean;
    publication_in_your_region?: boolean;
    [key: string]: any; // For any additional properties
}

interface PaginationState {
    page: number;
    size: number;
    total: number;
    pages: number;
}

interface InitialPublications {
    items: Publication[];
    page: number;
    size: number;
    total: number;
    pages: number;
}

interface FilterState {
    searchTerm: string;
    activeFilters: {
        recommended: boolean;
        viewed: boolean;
        saved: boolean;
        active: boolean;
        [key: string]: boolean;
    };
    sectorFilters: string[];
    regionFilters: string[];
    dateFilter: string;
    cpvCodeFilter: string;
}

interface PublicationListProps {
    initialPublications?: InitialPublications;
    isSearchPage?: boolean;
    isSavedPage?: boolean;
    isOverviewPage?: boolean;
}

export default function PublicationList({
    initialPublications,
    isSearchPage = false,
    isSavedPage = false,
    isOverviewPage = false
}: PublicationListProps) {
    // UI states
    const [activeChatPublication, setActiveChatPublication] = useState<Publication | null>(null);
    const [savingPublications, setSavingPublications] = useState<Record<string, boolean>>({});
    const [unsavingPublications, setUnsavingPublications] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Publications data
    const [publications, setPublications] = useState<Publication[]>(initialPublications?.items || []);
    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPublications?.page || 1,
        size: initialPublications?.size || 10,
        total: initialPublications?.total || 0,
        pages: initialPublications?.pages || 0
    });

    // Current filters state
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        activeFilters: {
            recommended: isOverviewPage, // Default true only on overview page
            viewed: false,              // Default false on all pages
            saved: isSavedPage,         // Default true only on saved page
            active: true                // Default true on all pages
        },
        sectorFilters: [],
        regionFilters: [],
        dateFilter: "",
        cpvCodeFilter: ""
    });

    // Track if this is the initial load
    const isInitialLoad = useRef<boolean>(true);
    // Track current API request to cancel if another is made
    const currentRequestController = useRef<AbortController | null>(null);

    const { getToken } = useAuth();
    const { toast } = useToast();

    // Make loadPublications a stable function reference using useCallback
    const loadPublications = useCallback(async (page = 1, newFilters = filters) => {
        // Skip loading on initial render since we already have server-side data
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        setIsLoading(true);

        // Cancel any in-flight request
        if (currentRequestController.current) {
            currentRequestController.current.abort();
        }

        // Create a new AbortController for this request
        currentRequestController.current = new AbortController();
        const signal = currentRequestController.current.signal;

        try {
            const token = await getToken();
            const params = new URLSearchParams();

            // Add pagination
            params.append('page', page.toString());
            params.append('size', pagination.size.toString());

            // Add search term if present
            if (newFilters.searchTerm) {
                params.append('search_term', newFilters.searchTerm);
            }

            // Add boolean filters
            if (newFilters.activeFilters.active !== undefined) {
                params.append('active', newFilters.activeFilters.active.toString());
            }
            if (newFilters.activeFilters.recommended) {
                params.append('recommended', 'true');
            }
            if (newFilters.activeFilters.viewed) {
                params.append('viewed', 'true');
            }
            if (newFilters.activeFilters.saved) {
                params.append('saved', 'true');
            }

            // Add array filters
            newFilters.sectorFilters.forEach(sector => {
                params.append('sector', sector);
            });

            newFilters.regionFilters.forEach(region => {
                params.append('region', region);
            });

            // Add date filter
            if (newFilters.dateFilter) {
                const today = new Date();
                let dateFrom: Date | undefined;

                if (newFilters.dateFilter === "7d") {
                    dateFrom = new Date(today);
                    dateFrom.setDate(today.getDate() - 7);
                } else if (newFilters.dateFilter === "30d") {
                    dateFrom = new Date(today);
                    dateFrom.setDate(today.getDate() - 30);
                } else if (newFilters.dateFilter === "90d") {
                    dateFrom = new Date(today);
                    dateFrom.setDate(today.getDate() - 90);
                }

                if (dateFrom) {
                    params.append('date_from', dateFrom.toISOString().split('T')[0]);
                }
            }

            // Add CPV code filter
            if (newFilters.cpvCodeFilter) {
                params.append('cpv_code', newFilters.cpvCodeFilter);
            }

            const response = await fetch(`${API_BASE_URL}/publications/?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal // Pass the abort signal
            });

            if (response.ok) {
                const data = await response.json();
                setPublications(data.items || []);
                setPagination({
                    page: data.page || 1,
                    size: data.size || 10,
                    total: data.total || 0,
                    pages: data.pages || 0
                });
            } else {
                // Only report errors if the request wasn't aborted
                if (!signal.aborted) {
                    console.error('Failed to fetch publications:', await response.text());
                    toast({
                        title: "Fout bij laden",
                        description: "De aanbestedingen konden niet worden geladen. Probeer het later opnieuw.",
                        variant: "error"
                    });
                }
            }
        } catch (error) {
            // Only report errors if the request wasn't aborted
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error fetching publications:', error);
                toast({
                    title: "Fout bij laden",
                    description: "Er is een fout opgetreden bij het laden van aanbestedingen.",
                    variant: "error"
                });
            }
        } finally {
            // Only update loading state if the request wasn't aborted
            if (currentRequestController.current && !currentRequestController.current.signal.aborted) {
                setIsLoading(false);
                currentRequestController.current = null;
            }
        }
    }, [filters, pagination.size, getToken, toast]);

    // Handle filter changes with debounce
    const handleFiltersChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);
        loadPublications(1, newFilters);
    }, [loadPublications]);

    // Handle page change
    const handlePageChange = useCallback((newPage: number) => {
        loadPublications(newPage);
    }, [loadPublications]);

    // Start a chat with a publication
    const startChat = (publication: Publication) => {
        setActiveChatPublication(publication);
    };

    // Save a publication
    const savePublication = async (publication: Publication) => {
        setSavingPublications(prev => ({ ...prev, [publication.workspace_id]: true }));

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublications(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: true }
                            : pub
                    )
                );

                toast({
                    title: "Opgeslagen!",
                    description: "Aanbesteding is opgeslagen in jouw lijst.",
                    variant: "success"
                });

                // Reload if "saved" filter is active
                if (filters.activeFilters.saved) {
                    loadPublications(pagination.page);
                }
            } else {
                console.error('Failed to save publication:', await response.text());
                toast({
                    title: "Fout bij opslaan",
                    description: "De aanbesteding kon niet worden opgeslagen. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error saving publication:', error);
            toast({
                title: "Fout bij opslaan",
                description: "Er is een fout opgetreden bij het opslaan van de aanbesteding.",
                variant: "error"
            });
        } finally {
            setSavingPublications(prev => ({ ...prev, [publication.workspace_id]: false }));
        }
    };

    // Unsave a publication
    const unsavePublication = async (publication: Publication) => {
        setUnsavingPublications(prev => ({ ...prev, [publication.workspace_id]: true }));

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/unsave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublications(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: false }
                            : pub
                    )
                );

                toast({
                    title: "Verwijderd",
                    description: "Aanbesteding is verwijderd uit jouw lijst.",
                    variant: "info"
                });

                // Reload if on saved page or "saved" filter is active
                if (filters.activeFilters.saved || isSavedPage) {
                    loadPublications(pagination.page);
                }
            } else {
                console.error('Failed to unsave publication:', await response.text());
                toast({
                    title: "Fout bij verwijderen",
                    description: "De aanbesteding kon niet worden verwijderd. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error unsaving publication:', error);
            toast({
                title: "Fout bij verwijderen",
                description: "Er is een fout opgetreden bij het verwijderen van de aanbesteding.",
                variant: "error"
            });
        } finally {
            setUnsavingPublications(prev => ({ ...prev, [publication.workspace_id]: false }));
        }
    };

    // Mark publication as viewed
    const markAsViewed = async (publication: Publication) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/publications/publication/${publication.workspace_id}/viewed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update publication in the list
                setPublications(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_viewed: true }
                            : pub
                    )
                );

                // Reload if "viewed" filter is active
                if (filters.activeFilters.viewed) {
                    loadPublications(pagination.page);
                }
            }
        } catch (error) {
            console.error('Error marking publication as viewed:', error);
        }
    };

    // Sort publications to show recommended ones first
    const sortedPublications = [...publications].sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        return 0;
    });

    // Clean up any pending requests on unmount
    useEffect(() => {
        return () => {
            if (currentRequestController.current) {
                currentRequestController.current.abort();
            }
        };
    }, []);

    return (
        <>
            <Toaster />

            {/* Filter Component */}
            <FilterCard
                isSearchPage={isSearchPage}
                isSavedPage={isSavedPage}
                isOverviewPage={isOverviewPage}
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
            />

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ?
                    "Aanbestedingen laden..." : (
                        <>
                            {`${pagination.total} aanbestedingen gevonden${isSearchPage && filters.searchTerm ? ` voor "${filters.searchTerm}"` : ''}`}
                        </>
                    )
                }
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <Loader loadingtext={"Laden..."} size={32} />
                ) : sortedPublications.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Geen aanbestedingen gevonden</p>
                    </div>
                ) : (
                    <>
                        {sortedPublications.map((publication, index) => (
                            <PublicationCard
                                key={publication.workspace_id || index}
                                publication={publication}
                                onStartChat={startChat}
                                onSave={savePublication}
                                onUnsave={unsavePublication}
                                onMarkAsViewed={markAsViewed}
                                isSaving={savingPublications[publication.workspace_id]}
                                isUnsaving={unsavingPublications[publication.workspace_id]}
                            />
                        ))}

                        {/* Pagination Controls */}
                        {pagination.pages > 1 && (
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                totalItems={pagination.total}
                                onPageChange={handlePageChange}
                                isLoading={isLoading}
                            />
                        )}
                    </>
                )}

                {/* Chat dialog */}
                {activeChatPublication && (
                    <ChatComponent
                        publicationId={activeChatPublication.workspace_id}
                        onClose={() => setActiveChatPublication(null)}
                    />
                )}
            </div>
        </>
    );
}
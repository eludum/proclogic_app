// src/app/publications/_components/PublicationList.tsx
"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { BookmarkCheck, BookmarkPlus, CheckCircleIcon, Eye, Filter, SearchIcon, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";
import { Pagination } from "./Pagination";
import { PublicationCard } from "./PublicationCard";

const API_BASE_URL = siteConfig.api_base_url;

export default function PublicationList({ initialPublications, isSearchPage = false }) {
    // State for publications data
    const [activeChatPublication, setActiveChatPublication] = useState(null);
    const [savingPublications, setSavingPublications] = useState({});
    const [unsavingPublications, setUnsavingPublications] = useState({});
    const [publicationsList, setPublicationsList] = useState(initialPublications.items || []);
    const [pagination, setPagination] = useState({
        page: initialPublications.page || 1,
        size: initialPublications.size || 10,
        total: initialPublications.total || 0,
        pages: initialPublications.pages || 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        recommended: true, // Set recommended filter to true by default
        viewed: false,
        saved: false,
        active: true // Active filter on by default
    });
    const [showFilters, setShowFilters] = useState(true);

    const { getToken } = useAuth();
    const { toast } = useToast();

    // Fetch publications with filters
    const fetchPublications = async (page = 1) => {
        setIsLoading(true);
        try {
            const token = await getToken();

            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.size.toString(),
                active: activeFilters.active.toString()
            });

            // Add optional filters
            if (activeFilters.recommended) params.append('recommended', 'true');
            if (activeFilters.viewed) params.append('viewed', 'true');
            if (activeFilters.saved) params.append('saved', 'true');
            if (searchTerm.trim()) params.append('search_term', searchTerm.trim());

            const response = await fetch(`${API_BASE_URL}/publications/?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPublicationsList(data.items || []);
                setPagination({
                    page: data.page || 1,
                    size: data.size || 10,
                    total: data.total || 0,
                    pages: data.pages || 0
                });
            } else {
                console.error('Failed to fetch publications:', await response.text());
                toast({
                    title: "Fout bij laden",
                    description: "De aanbestedingen konden niet worden geladen. Probeer het later opnieuw.",
                    variant: "error"
                });
            }
        } catch (error) {
            console.error('Error fetching publications:', error);
            toast({
                title: "Fout bij laden",
                description: "Er is een fout opgetreden bij het laden van aanbestedingen.",
                variant: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch publications when filters change
    useEffect(() => {
        fetchPublications(1); // Reset to page 1 when filters change
    }, [searchTerm, activeFilters]);

    // Reset filters
    const resetFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            recommended: true,  // Keep recommended filter enabled by default
            viewed: false,
            saved: false,
            active: true  // Keep active filter enabled by default
        });
    };

    // Toggle a filter
    const toggleFilter = (filter) => {
        setActiveFilters(prev => ({
            ...prev,
            [filter]: !prev[filter]
        }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchPublications(newPage);
        }
    };

    // Start a chat with a publication
    const startChat = (publication) => {
        setActiveChatPublication(publication);
    };

    // Save a publication
    const savePublication = async (publication) => {
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
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: true }
                            : pub
                    )
                );

                toast({
                    title: "Opgeslagen!",
                    description: "Aanbesteding is opgeslagen in uw lijst.",
                    variant: "success"
                });

                // Refresh the list if "saved" filter is active
                if (activeFilters.saved) {
                    fetchPublications(pagination.page);
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
    const unsavePublication = async (publication) => {
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
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_saved: false }
                            : pub
                    )
                );

                toast({
                    title: "Verwijderd",
                    description: "Aanbesteding is verwijderd uit uw lijst.",
                    variant: "info"
                });

                // Refresh the list if "saved" filter is active
                if (activeFilters.saved) {
                    fetchPublications(pagination.page);
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
    const markAsViewed = async (publication) => {
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
                setPublicationsList(prev =>
                    prev.map(pub =>
                        pub.workspace_id === publication.workspace_id
                            ? { ...pub, is_viewed: true }
                            : pub
                    )
                );

                // Refresh the list if "viewed" filter is active
                if (activeFilters.viewed) {
                    fetchPublications(pagination.page);
                }
            }
        } catch (error) {
            console.error('Error marking publication as viewed:', error);
        }
    };

    // Sort publications to show recommended ones first
    const sortedPublications = [...publicationsList].sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        return 0;
    });

    return (
        <>
            <Toaster />

            {/* Search and filter bar */}
            <div className="mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search input - Always show */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 py-2 pr-3 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white 
                            focus:outline-hidden focus:ring-2 focus:ring-astral-500 focus:border-transparent"
                            placeholder="Zoek in titel, beschrijving, organisatie..."
                        />
                    </div>

                    {/* Filter toggle button */}
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 ${showFilters ? 'bg-astral-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                    >
                        <Filter size={16} />
                        <span>{showFilters ? "Verberg filters" : "Toon filters"}</span>
                        {Object.values(activeFilters).some(f => f) && (
                            <span className="bg-white text-astral-600 text-xs px-1.5 py-0.5 rounded-full">
                                {Object.values(activeFilters).filter(Boolean).length}
                            </span>
                        )}
                    </Button>

                    {/* Reset filters button - only show if filters are active */}
                    {(searchTerm || Object.values(activeFilters).some(f => f && f !== activeFilters.active)) && (
                        <Button
                            onClick={resetFilters}
                            variant="secondary"
                            className="text-sm"
                        >
                            Reset filters
                        </Button>
                    )}
                </div>

                {/* Filter options - conditionally rendered */}
                {showFilters && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <Button
                            onClick={() => toggleFilter('active')}
                            variant={activeFilters.active ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <CheckCircleIcon size={14} />
                            <span>Alleen actieve</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('recommended')}
                            variant={activeFilters.recommended ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Star size={14} className={activeFilters.recommended ? "text-amber-300" : ""} />
                            <span>Aanbevolen</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('viewed')}
                            variant={activeFilters.viewed ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <Eye size={14} />
                            <span>Bekeken</span>
                        </Button>
                        <Button
                            onClick={() => toggleFilter('saved')}
                            variant={activeFilters.saved ? "default" : "secondary"}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            {activeFilters.saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                            <span>Opgeslagen</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isLoading ?
                    "Aanbestedingen laden..." : (
                        <>
                            {`${pagination.total} aanbestedingen gevonden${searchTerm ? ` voor "${searchTerm}"` : ''}`}

                            {(Object.entries(activeFilters).some(([key, value]) => value && key !== 'active') ||
                                (activeFilters.active && Object.values(activeFilters).filter(Boolean).length === 1)) && (
                                    <span> (Gefilterd op: {Object.entries(activeFilters)
                                        .filter(([key, value]) => value)
                                        .map(([key]) =>
                                            key === 'recommended' ? 'aanbevolen' :
                                                key === 'viewed' ? 'bekeken' :
                                                    key === 'saved' ? 'opgeslagen' :
                                                        key === 'active' ? 'alleen actieve' : ''
                                        )
                                        .filter(text => text) // Remove any empty strings
                                        .join(', ')})
                                    </span>
                                )}
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
                        {(searchTerm || Object.values(activeFilters).some(f => f && f !== activeFilters.active)) && (
                            <Button
                                onClick={resetFilters}
                                variant="secondary"
                                className="mt-2"
                            >
                                Filters wissen
                            </Button>
                        )}
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
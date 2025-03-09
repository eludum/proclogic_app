"use client"

import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Publication } from "@/data/publicationSchema";
import { useAuth } from "@clerk/nextjs";
import {
    AlertCircle, ArrowUpRight,
    BarChart,
    Building2, Calendar,
    Clock,
    ExternalLink,
    ListFilter,
    PieChart,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicationList from "../publications/_components/PublicationList";

const API_BASE_URL = siteConfig.api_base_url;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [publications, setPublications] = useState<Publication[]>([]);
    const [recommendedPublications, setRecommendedPublications] = useState<Publication[]>([]);
    const [savedPublications, setSavedPublications] = useState<Publication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();

                // Fetch all publications TODO: server side component
                const allResponse = await fetch(`${API_BASE_URL}/publications/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Fetch recommended publications
                const recommendedResponse = await fetch(`${API_BASE_URL}/publications/recommended/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Fetch saved publications
                const savedResponse = await fetch(`${API_BASE_URL}/publications/saved/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!allResponse.ok || !recommendedResponse.ok || !savedResponse.ok) {
                    throw new Error(`API error: ${allResponse.status}`);
                }

                const allData = await allResponse.json();
                const recommendedData = await recommendedResponse.json();
                const savedData = await savedResponse.json();

                setPublications(allData);
                setRecommendedPublications(recommendedData);
                setSavedPublications(savedData);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching publications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [getToken]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPublications = () => {
        let currentList = [];

        switch (activeTab) {
            case 'recommended':
                currentList = recommendedPublications;
                break;
            case 'saved':
                currentList = savedPublications;
                break;
            default:
                currentList = publications;
        }

        if (!searchTerm) return currentList;

        return currentList.filter(pub =>
            pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.organisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.cpv_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pub.original_description && pub.original_description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    // Calculate stats
    const stats = {
        total: publications.length,
        recommended: recommendedPublications.length,
        saved: savedPublications.length,
        active: publications.filter(pub => pub.is_active === true).length
    };

    // Get publications due in the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = publications.filter(pub => {
        if (!pub.submission_deadline || !pub.is_active) return false;
        const deadline = new Date(pub.submission_deadline);
        return deadline >= today && deadline <= nextWeek;
    });

    return (
        <div className="w-full px-6 py-6">
            {/* Hero banner */}
            <div className="bg-blue-600 text-white rounded-lg shadow-lg mb-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">ProcLogic Dashboard</h1>
                        <p className="text-blue-100">Ontdek en beheer aanbestedingsmogelijkheden met ProcLogic AI</p>
                    </div>
                    <Button
                        className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md font-medium"
                        onClick={() => window.open('/search', '_blank')}
                    >
                        <Search size={18} />
                        <span>Geavanceerd zoeken</span>
                    </Button>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Totaal aanbestedingen</p>
                            {isLoading ? (
                                <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</h3>
                            )}
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                            <ListFilter className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aanbevolen voor u</p>
                            {isLoading ? (
                                <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.recommended}</h3>
                            )}
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                            <ArrowUpRight className="text-amber-600 dark:text-amber-400" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Opgeslagen</p>
                            {isLoading ? (
                                <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.saved}</h3>
                            )}
                        </div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                            <Building2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Actieve aanbestedingen</p>
                            {isLoading ? (
                                <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.active}</h3>
                            )}
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                            <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-column layout for desktop */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content - Publications */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        {/* Header with tabs and search */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setActiveTab('all')}
                                        className={`px-4 py-2 text-sm ${activeTab === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        Alle aanbestedingen
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab('recommended')}
                                        className={`px-4 py-2 text-sm ${activeTab === 'recommended'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        Aanbevolen ({stats.recommended})
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab('saved')}
                                        className={`px-4 py-2 text-sm ${activeTab === 'saved'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        Opgeslagen ({stats.saved})
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Zoeken..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content area */}
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">Aanbestedingen laden...</p>
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center">
                                    <AlertCircle size={48} className="mx-auto text-red-500 mb-2" />
                                    <p className="text-red-500">Error: {error}</p>
                                </div>
                            ) : filteredPublications().length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-500 dark:text-slate-400">Geen aanbestedingen gevonden</p>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <PublicationList
                                        publications={filteredPublications()}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Upcoming deadlines */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Aankomende deadlines</h3>
                            <Calendar size={18} className="text-slate-400" />
                        </div>

                        {upcomingDeadlines.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Geen aankomende deadlines deze week</p>
                        ) : (
                            <ul className="space-y-3">
                                {upcomingDeadlines.slice(0, 5).map((pub, index) => (
                                    <li key={index} className="border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0">
                                        <a
                                            href={`/publications/detail/${pub.workspace_id}`}
                                            className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded p-2 -mx-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-1">{pub.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{pub.organisation}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                    <Clock size={12} />
                                                    <span>{new Date(pub.submission_deadline).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {upcomingDeadlines.length > 5 && (
                            <a
                                href="/publications/upcoming"
                                className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline"
                            >
                                <span>Alle deadlines bekijken</span>
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>

                    {/* Quick stats / charts */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Sector verdeling</h3>
                            <BarChart size={18} className="text-slate-400" />
                        </div>

                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center space-y-3">
                                <PieChart size={100} className="mx-auto text-slate-400 dark:text-slate-500" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Sector verdeling van alle aanbestedingen
                                </p>
                                <Button
                                    className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1"
                                >
                                    Statistieken bekijken
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
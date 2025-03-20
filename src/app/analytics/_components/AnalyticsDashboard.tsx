"use client";

import { Toaster } from '@/components/Toaster';
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from 'react';

import AnalyticsSummary from './AnalyticsSummary';
import CompetitorAnalysis from './CompetitorAnalysis';
import ExportPanel from './ExportPanel';
import FilterPanel from './FilterPanel';

interface AnalyticsDashboardProps {
    initialData?: {
        years?: number[];
        companySectors?: { name: string; cpvCodes?: string[] }[];
        totalValue?: number;
        sectorData?: Array<any>;
    };
    error: string | null;
    apiBaseUrl: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    initialData = {},
    error: initialError,
    apiBaseUrl
}) => {
    const { getToken } = useAuth();
    const { toast } = useToast();

    // State for filters
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [timeframe, setTimeframe] = useState('monthly');
    const [selectedSector, setSelectedSector] = useState('all');
    const [availableYears, setAvailableYears] = useState<number[]>(initialData?.years || []);
    const [companySectors, setCompanySectors] = useState(initialData?.companySectors || []);

    // State for data
    const [dashboardData, setDashboardData] = useState({
        totalValue: initialData?.totalValue || 0,
        sectorData: initialData?.sectorData || [],
        winnerData: [],
        organisationData: [],
        timeSeriesData: [],
        regionalData: []
    });

    // State for loading and error
    const [isLoading, setIsLoading] = useState({
        total: false,
        sectors: false,
        winners: false,
        organisations: false,
        timeSeries: false,
        valueRanges: false,
        regional: false
    });

    const [errors, setErrors] = useState<{
        total: string | null;
        sectors: string | null;
        winners: string | null;
        organisations: string | null;
        timeSeries: string | null;
        valueRanges: string | null;
        regional: string | null;
    }>({
        total: initialError,
        sectors: initialError,
        winners: null,
        organisations: null,
        timeSeries: null,
        valueRanges: null,
        regional: null
    });

    // Helper function to fetch data from API
    const fetchData = useCallback(async (endpoint: string, params: Record<string, any> = {}) => {
        try {
            // Build query string from params
            const queryString = Object.keys(params)
                .filter(key => params[key] !== null && params[key] !== undefined)
                .map(key => {
                    if (Array.isArray(params[key])) {
                        return params[key].map((value: string) =>
                            `${key}=${encodeURIComponent(value)}`).join('&');
                    }
                    return `${key}=${encodeURIComponent(params[key])}`;
                })
                .join('&');

            const url = `${apiBaseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

            // Get auth token
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication token not available");
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${endpoint}:`, error);
            throw error;
        }
    }, [apiBaseUrl, getToken]);

    // Load data when filters change
    useEffect(() => {
        const loadData = async () => {
            // Sector filtering params
            const sectorParams: { sector?: string[] } = {};
            if (selectedSector !== 'all') {
                // Find the selected sector in the company sectors
                const sector = companySectors.find(s => s.name === selectedSector);
                if (sector && sector.cpvCodes) {
                    // Apply CPV code filter - assuming backend supports this filter
                    sectorParams.sector = sector.cpvCodes;
                }
            }

            // Total value
            setIsLoading(prev => ({ ...prev, total: true }));
            try {
                const totalValueData = await fetchData('/analytics/total-value', {
                    year: selectedYear ?? 0,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, totalValue: totalValueData.total_value }));
                setErrors(prev => ({ ...prev, total: null }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setErrors(prev => ({ ...prev, total: errorMessage }));
                toast({
                    title: "Fout bij laden",
                    description: "De totale waarde kon niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, total: false }));
            }

            // Sectors
            setIsLoading(prev => ({ ...prev, sectors: true }));
            try {
                const sectorsData = await fetchData('/analytics/by-sector', {
                    year: selectedYear ?? 0,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, sectorData: sectorsData }));
                setErrors(prev => ({ ...prev, sectors: null }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setErrors(prev => ({ ...prev, sectors: errorMessage }));
                toast({
                    title: "Fout bij laden",
                    description: "De sectorgegevens konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, sectors: false }));
            }

            // Winners (competitors)
            setIsLoading(prev => ({ ...prev, winners: true }));
            try {
                const winnersData = await fetchData('/analytics/by-winner', {
                    year: selectedYear,
                    limit: 15,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, winnerData: winnersData }));
                setErrors(prev => ({ ...prev, winners: null }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setErrors(prev => ({ ...prev, winners: errorMessage }));
                toast({
                    title: "Fout bij laden",
                    description: "De gegevens over concurrenten konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, winners: false }));
            }

        };

        loadData();
    }, [selectedYear, timeframe, selectedSector, fetchData, toast, companySectors]);

    return (
        <>
            <Toaster />

            <div className="w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs bg-white dark:bg-slate-900 p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {selectedSector === 'all' ? 'Marktanalyse Aanbestedingen' : `Marktanalyse: ${selectedSector}`}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Krijg inzicht in gunningen, trends en concurrentie in uw markt
                    </p>
                </div>

                <FilterPanel
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    timeframe={timeframe}
                    setTimeframe={setTimeframe}
                    selectedSector={selectedSector}
                    setSelectedSector={setSelectedSector}
                    availableYears={availableYears}
                    companySectors={companySectors}
                    isLoading={Object.values(isLoading).some(state => state)}
                />

                <AnalyticsSummary
                    totalValue={dashboardData.totalValue}
                    sectorData={dashboardData.sectorData}
                    isLoading={isLoading.total || isLoading.sectors}
                    error={errors.total || errors.sectors}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <CompetitorAnalysis
                        data={dashboardData.winnerData}
                        isLoading={isLoading.winners}
                        error={errors.winners}
                        className="xl:col-span-2"

                    />
                </div>

                <ExportPanel
                    dashboardData={dashboardData}
                    filters={{
                        year: selectedYear,
                        timeframe: timeframe,
                        sector: selectedSector
                    }}
                    isLoading={Object.values(isLoading).some(state => state)}
                />
            </div>
        </>
    );
};

export default AnalyticsDashboard;
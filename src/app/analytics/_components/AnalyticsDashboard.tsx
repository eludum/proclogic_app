"use client";

import { Toaster } from '@/components/Toaster';
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from 'react';

// Component imports
import AnalyticsSummary from './AnalyticsSummary';
import CompetitorAnalysis from './CompetitorAnalysis';
import ExportPanel from './ExportPanel';
import FilterPanel from './FilterPanel';
import RegionalAnalysis from './RegionalAnalysis';
import SectorComparisonChart from './SectorComparisonChart';
import TimeSeriesChart from './TimeSeriesChart';
import ValueDistributionChart from './ValueDistributionChart';

const AnalyticsDashboard = ({ initialData, error: initialError, apiBaseUrl }) => {
    const { getToken } = useAuth();
    const { toast } = useToast();

    // State for filters
    const [selectedYear, setSelectedYear] = useState(null);
    const [timeframe, setTimeframe] = useState('monthly');
    const [selectedSector, setSelectedSector] = useState('all');
    const [availableYears, setAvailableYears] = useState(initialData?.years || []);
    const [companySectors, setCompanySectors] = useState(initialData?.companySectors || []);

    // State for data
    const [dashboardData, setDashboardData] = useState({
        totalValue: initialData?.totalValue || 0,
        sectorData: initialData?.sectorData || [],
        winnerData: [],
        organisationData: [],
        timeSeriesData: [],
        valueRangesData: [],
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
    const [errors, setErrors] = useState({
        total: initialError,
        sectors: initialError,
        winners: null,
        organisations: null,
        timeSeries: null,
        valueRanges: null,
        regional: null
    });

    // Helper function to fetch data from API
    const fetchData = async (endpoint, params = {}) => {
        try {
            // Build query string from params
            const queryString = Object.keys(params)
                .filter(key => params[key] !== null && params[key] !== undefined)
                .map(key => {
                    if (Array.isArray(params[key])) {
                        return params[key].map(value => `${key}=${encodeURIComponent(value)}`).join('&');
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
    };

    // Load data when filters change
    useEffect(() => {
        const loadData = async () => {
            // Sector filtering params
            const sectorParams = {};
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
                    year: selectedYear,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, totalValue: totalValueData.total_value }));
                setErrors(prev => ({ ...prev, total: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, total: error.message }));
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
                    year: selectedYear,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, sectorData: sectorsData }));
                setErrors(prev => ({ ...prev, sectors: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, sectors: error.message }));
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
                setErrors(prev => ({ ...prev, winners: error.message }));
                toast({
                    title: "Fout bij laden",
                    description: "De gegevens over concurrenten konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, winners: false }));
            }

            // Organisations
            setIsLoading(prev => ({ ...prev, organisations: true }));
            try {
                const organisationsData = await fetchData('/analytics/by-organisation', {
                    year: selectedYear,
                    limit: 10,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, organisationData: organisationsData }));
                setErrors(prev => ({ ...prev, organisations: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, organisations: error.message }));
                toast({
                    title: "Fout bij laden",
                    description: "De organisatiegegevens konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, organisations: false }));
            }

            // Time series
            setIsLoading(prev => ({ ...prev, timeSeries: true }));
            try {
                const years = selectedYear ? [selectedYear] : null;
                const timeSeriesData = await fetchData('/analytics/time-series', {
                    timeframe: timeframe,
                    years: years,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, timeSeriesData: timeSeriesData }));
                setErrors(prev => ({ ...prev, timeSeries: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, timeSeries: error.message }));
                toast({
                    title: "Fout bij laden",
                    description: "De tijdreeksgegevens konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, timeSeries: false }));
            }

            // Value ranges
            setIsLoading(prev => ({ ...prev, valueRanges: true }));
            try {
                const valueRangesData = await fetchData('/analytics/value-ranges', {
                    year: selectedYear,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, valueRangesData: valueRangesData }));
                setErrors(prev => ({ ...prev, valueRanges: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, valueRanges: error.message }));
                toast({
                    title: "Fout bij laden",
                    description: "De gegevens over waarderanges konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, valueRanges: false }));
            }

            // Regional data (nuts codes)
            setIsLoading(prev => ({ ...prev, regional: true }));
            try {
                // This would need a new backend endpoint
                const regionalData = await fetchData('/analytics/by-region', {
                    year: selectedYear,
                    ...sectorParams
                });
                setDashboardData(prev => ({ ...prev, regionalData: regionalData }));
                setErrors(prev => ({ ...prev, regional: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, regional: error.message }));
                // Don't show toast for this as it might be a new endpoint not yet implemented
                console.warn("Regional data endpoint might not be implemented yet:", error);
            } finally {
                setIsLoading(prev => ({ ...prev, regional: false }));
            }
        };

        loadData();
    }, [selectedYear, timeframe, selectedSector, apiBaseUrl, getToken, toast]);

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
                    <TimeSeriesChart
                        data={dashboardData.timeSeriesData}
                        isLoading={isLoading.timeSeries}
                        error={errors.timeSeries}
                        className="xl:col-span-2"
                    />

                    <SectorComparisonChart
                        data={dashboardData.sectorData}
                        isLoading={isLoading.sectors}
                        error={errors.sectors}
                    />

                    <CompetitorAnalysis
                        data={dashboardData.winnerData}
                        isLoading={isLoading.winners}
                        error={errors.winners}
                    />

                    <ValueDistributionChart
                        data={dashboardData.valueRangesData}
                        isLoading={isLoading.valueRanges}
                        error={errors.valueRanges}
                    />

                    <RegionalAnalysis
                        data={dashboardData.regionalData || []}
                        isLoading={isLoading.regional}
                        error={errors.regional}
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
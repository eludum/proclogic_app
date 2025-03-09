"use client";

import { Toaster } from '@/components/Toaster';
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { BarChart2Icon, BuildingIcon, CalendarIcon, DownloadIcon, PieChartIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Color palette for visualizations
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1'];

// Format large numbers for display with euro symbol
const formatValue = (value) => {
    if (!value && value !== 0) return 'N/A';

    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(1)}K`;
    }
    return `€${value}`;
};

// Format percentage values
const formatPercent = (value) => {
    if (!value && value !== 0) return 'N/A';
    return `${value.toFixed(1)}%`;
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, valuePrefix = "€" }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-sm shadow-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {valuePrefix === '%' ? formatPercent(entry.value) : formatValue(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Loading spinner component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <p className="text-red-700 dark:text-red-300">{message}</p>
    </div>
);

// Card component for charts
const ChartCard = ({ title, description, children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

// Summary card component
const SummaryCard = ({ title, value, icon, colorClass = "text-blue-600 dark:text-blue-400" }) => {
    const IconComponent = icon;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                {IconComponent && <IconComponent className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
            </div>
            <p className={`text-2xl font-bold ${colorClass} mt-2`}>{value}</p>
        </div>
    );
};

const AnalyticsDashboard = ({ initialData, error: initialError, apiBaseUrl }) => {
    const { getToken } = useAuth();
    const { toast } = useToast();

    // State for filters
    const [selectedYear, setSelectedYear] = useState(null);
    const [timeframe, setTimeframe] = useState('monthly');
    const [availableYears, setAvailableYears] = useState(initialData?.years || [2023, 2024]);

    // State for data
    const [totalValue, setTotalValue] = useState(initialData?.totalValue || 0);
    const [sectorData, setSectorData] = useState(initialData?.sectorData || []);
    const [winnerData, setWinnerData] = useState([]);
    const [organisationData, setOrganisationData] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [valueRangesData, setValueRangesData] = useState([]);

    // State for loading and error
    const [isLoading, setIsLoading] = useState({
        total: false,
        sectors: false,
        winners: false,
        organisations: false,
        timeSeries: false,
        valueRanges: false
    });
    const [errors, setErrors] = useState({
        total: initialError,
        sectors: initialError,
        winners: null,
        organisations: null,
        timeSeries: null,
        valueRanges: null
    });

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
            // Total value - only fetch if not provided in initialData or if filters changed
            if (!initialData?.totalValue || selectedYear) {
                setIsLoading(prev => ({ ...prev, total: true }));
                try {
                    const totalValueData = await fetchData('/analytics/total-value', { year: selectedYear });
                    setTotalValue(totalValueData.total_value);
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
            }

            // Sectors - only fetch if not provided in initialData or if filters changed
            if (!initialData?.sectorData.length || selectedYear) {
                setIsLoading(prev => ({ ...prev, sectors: true }));
                try {
                    const sectorsData = await fetchData('/analytics/by-sector', { year: selectedYear });
                    setSectorData(sectorsData);
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
            }

            // Winners
            setIsLoading(prev => ({ ...prev, winners: true }));
            try {
                const winnersData = await fetchData('/analytics/by-winner', { year: selectedYear, limit: 10 });
                setWinnerData(winnersData);
                setErrors(prev => ({ ...prev, winners: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, winners: error.message }));
                toast({
                    title: "Fout bij laden",
                    description: "De gegevens over winnende bedrijven konden niet worden geladen.",
                    variant: "error"
                });
            } finally {
                setIsLoading(prev => ({ ...prev, winners: false }));
            }

            // Organisations
            setIsLoading(prev => ({ ...prev, organisations: true }));
            try {
                const organisationsData = await fetchData('/analytics/by-organisation', { year: selectedYear, limit: 10 });
                setOrganisationData(organisationsData);
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
                const years = selectedYear ? [selectedYear] : availableYears;
                const timeSeriesData = await fetchData('/analytics/time-series', {
                    timeframe: timeframe,
                    years: years
                });
                setTimeSeriesData(timeSeriesData);
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
                const valueRangesData = await fetchData('/analytics/value-ranges', { year: selectedYear });
                setValueRangesData(valueRangesData);
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
        };

        loadData();
    }, [selectedYear, timeframe, apiBaseUrl, getToken, toast, initialData]);

    // Calculate total counts and average values
    const totalCount = sectorData.reduce((acc, item) => acc + item.count, 0);
    const avgValue = totalCount ? totalValue / totalCount : 0;
    const topSector = sectorData.length > 0 ? sectorData[0].sector : "N/A";

    const isAllLoading = Object.values(isLoading).some(state => state);

    // Function to export data
    const exportData = (format) => {
        // Create export data
        let content = '';
        let filename = `aanbestedingen-export-${new Date().toISOString().split('T')[0]}.${format}`;
        let fileType = format === 'csv' ? 'text/csv' : 'application/json';

        if (format === 'csv') {
            // Create CSV header
            content = 'Sector,Aantal,TotaleWaarde\n';

            // Add data rows
            sectorData.forEach(item => {
                content += `"${item.sector}",${item.count},${item.total_value}\n`;
            });
        } else {
            // JSON format
            const exportObj = {
                filters: {
                    year: selectedYear,
                    timeframe: timeframe
                },
                summary: {
                    totalValue,
                    totalCount,
                    avgValue,
                    topSector
                },
                sectors: sectorData,
                winners: winnerData,
                organisations: organisationData,
                timeSeries: timeSeriesData,
                valueRanges: valueRangesData
            };

            content = JSON.stringify(exportObj, null, 2);
        }

        // Create a blob and download link
        const blob = new Blob([content], { type: fileType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Export geslaagd",
            description: `Gegevens geëxporteerd als ${format.toUpperCase()}`,
            variant: "success"
        });
    };

    return (
        <>
            <Toaster />

            <div className="w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs bg-white dark:bg-slate-900 p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Analyse van Aanbestedingen</h1>
                    <p className="text-gray-600 dark:text-gray-400">Krijg inzicht in gegunde aanbestedingen en trends</p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Filter op jaar
                            </label>
                            <select
                                id="yearFilter"
                                value={selectedYear || ''}
                                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                disabled={isAllLoading}
                            >
                                <option value="">Alle jaren</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto">
                            <label htmlFor="timeframeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tijdsperiode
                            </label>
                            <select
                                id="timeframeFilter"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                disabled={isAllLoading}
                            >
                                <option value="monthly">Maandelijks</option>
                                <option value="quarterly">Per kwartaal</option>
                                <option value="yearly">Jaarlijks</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <SummaryCard
                        title="Totale waarde"
                        value={formatValue(totalValue)}
                        icon={PieChartIcon}
                        colorClass="text-blue-600 dark:text-blue-400"
                    />

                    <SummaryCard
                        title="Aantal gunningen"
                        value={totalCount}
                        icon={BarChart2Icon}
                        colorClass="text-emerald-600 dark:text-emerald-400"
                    />

                    <SummaryCard
                        title="Gemiddelde waarde"
                        value={formatValue(avgValue)}
                        icon={CalendarIcon}
                        colorClass="text-amber-600 dark:text-amber-400"
                    />

                    <SummaryCard
                        title="Topsector"
                        value={topSector}
                        icon={BuildingIcon}
                        colorClass="text-purple-600 dark:text-purple-400"
                    />
                </div>

                {/* Main charts grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Time Series Chart */}
                    <ChartCard
                        title="Gunningswaarde over tijd"
                        description="Volg hoe gunningswaarden zijn veranderd over tijd"
                        className="xl:col-span-2"
                    >
                        {isLoading.timeSeries ? (
                            <LoadingSpinner />
                        ) : errors.timeSeries ? (
                            <ErrorMessage message={errors.timeSeries} />
                        ) : timeSeriesData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">

                                    <LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="period"
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            tickFormatter={formatValue}
                                            stroke="#9ca3af"
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#82ca9d"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total_value"
                                            name="Totale waarde"
                                            stroke="#0088FE"
                                            activeDot={{ r: 8 }}
                                            strokeWidth={2}
                                            yAxisId="left"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            name="Aantal"
                                            stroke="#82ca9d"
                                            yAxisId="right"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>

                    {/* Sector Chart */}
                    <ChartCard
                        title="Gunningen per sector"
                        description="Verdeling van gunningen over verschillende sectoren"
                    >
                        {isLoading.sectors ? (
                            <LoadingSpinner />
                        ) : errors.sectors ? (
                            <ErrorMessage message={errors.sectors} />
                        ) : sectorData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={sectorData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tickFormatter={formatValue} stroke="#9ca3af" />
                                        <YAxis
                                            dataKey="sector"
                                            type="category"
                                            width={120}
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="total_value" name="Totale waarde" fill="#0088FE" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>

                    {/* Winners Chart */}
                    <ChartCard
                        title="Winnende bedrijven"
                        description="Bedrijven met de hoogste totale gunningswaarden"
                    >
                        {isLoading.winners ? (
                            <LoadingSpinner />
                        ) : errors.winners ? (
                            <ErrorMessage message={errors.winners} />
                        ) : winnerData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={winnerData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tickFormatter={formatValue} stroke="#9ca3af" />
                                        <YAxis
                                            dataKey="winner"
                                            type="category"
                                            width={120}
                                            tick={{ fontSize: 11 }}
                                            stroke="#9ca3af"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="total_value" name="Totale waarde" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>

                    {/* Organizations Chart */}
                    <ChartCard
                        title="Gunnende organisaties"
                        description="Organisaties die de meeste contracten naar waarde hebben gegund"
                    >
                        {isLoading.organisations ? (
                            <LoadingSpinner />
                        ) : errors.organisations ? (
                            <ErrorMessage message={errors.organisations} />
                        ) : organisationData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={organisationData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tickFormatter={formatValue} stroke="#9ca3af" />
                                        <YAxis
                                            dataKey="organisation"
                                            type="category"
                                            width={120}
                                            tick={{ fontSize: 11 }}
                                            stroke="#9ca3af"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="total_value" name="Totale waarde" fill="#FFBB28" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>

                    {/* Value Ranges Chart */}
                    <ChartCard
                        title="Gunningen per waarderange"
                        description="Verdeling van contracten over verschillende waarderanges"
                    >
                        {isLoading.valueRanges ? (
                            <LoadingSpinner />
                        ) : errors.valueRanges ? (
                            <ErrorMessage message={errors.valueRanges} />
                        ) : valueRangesData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={valueRangesData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="label"
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            orientation="left"
                                            stroke="#9ca3af"
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tickFormatter={formatValue}
                                            stroke="#9ca3af"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="count" name="Aantal gunningen" fill="#8884D8" />
                                        <Bar yAxisId="right" dataKey="total_value" name="Totale waarde" fill="#82CA9D" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>

                    {/* Distribution Pie Chart */}
                    <ChartCard
                        title="Verdeling gunningswaarde"
                        description="Aandeel van de totale gunningswaarde per sector"
                    >
                        {isLoading.sectors ? (
                            <LoadingSpinner />
                        ) : errors.sectors ? (
                            <ErrorMessage message={errors.sectors} />
                        ) : sectorData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sectorData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="total_value"
                                            nameKey="sector"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        >
                                            {sectorData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Geen gegevens beschikbaar
                            </div>
                        )}
                    </ChartCard>
                </div>

                {/* Download section */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        Exporteer gegevens
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download de analysegegevens voor verder gebruik
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-sm"
                            onClick={() => exportData('csv')}
                            disabled={isAllLoading}
                        >
                            <DownloadIcon size={16} />
                            <span>Exporteren als CSV</span>
                        </button>
                        <button
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-sm"
                            onClick={() => exportData('json')}
                            disabled={isAllLoading}
                        >
                            <DownloadIcon size={16} />
                            <span>Exporteren als JSON</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnalyticsDashboard;
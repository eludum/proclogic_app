"use client";

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartContainer, CustomTooltip, EmptyState, ErrorMessage, LoadingSpinner } from './CommonComponents';

interface CompetitorData {
    winner: string;
    count: number;
    total_value: number;
    sectors?: string[];
}

interface CompetitorAnalysisProps {
    data: CompetitorData[];
    isLoading: boolean;
    error: string | null;
    className?: string;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ data, isLoading, error, className = "" }) => {
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

    if (isLoading) {
        return <LoadingSpinner message="Concurrentiegegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!data || data.length === 0) {
        return <EmptyState message="Geen concurrentiegegevens beschikbaar" />;
    }

    // Limit to top 8 winners for chart view
    const displayData = data.slice(0, 10);

    const toggleViewMode = () => {
        setViewMode(viewMode === 'table' ? 'chart' : 'table');
    };

    // Format currency for display
    const formatCurrency = (value: string | number | bigint) => {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(typeof value === 'string' ? parseFloat(value) : value);
    };

    return (
        <ChartCard
            title="Analyse van de concurrentie"
            description={
                <div className="flex justify-between items-center">
                    <span>Ontdek wie de winnende bedrijven zijn in je sector.</span>
                    <button
                        onClick={toggleViewMode}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {viewMode === 'table' ? 'Tabelweergave' : 'Grafiekweergave'}
                    </button>
                </div>
            }
            className={className}
        >
            {viewMode === 'table' ? (
                <ChartContainer height={350}>
                    <BarChart
                        data={displayData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => {
                                if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
                                return `€${value}`;
                            }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            dataKey="winner"
                            type="category"
                            width={120}
                            tick={{ fontSize: 11 }}
                            stroke="#9ca3af"
                        />
                        <Legend />
                        <Bar dataKey="total_value" name="Totale gunningswaarde" fill="#00C49F" radius={[0, 4, 4, 0]} />
                        <CustomTooltip active={undefined} payload={undefined} label={undefined} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Bedrijf
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aantal gunningen
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Totale waarde
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Sectoren
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {data.map((competitor, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {competitor.winner}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {competitor.count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(competitor.total_value)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-wrap gap-1">
                                            {competitor.sectors && competitor.sectors.map((sector, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {sector}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ChartCard>
    );
};

export default CompetitorAnalysis;
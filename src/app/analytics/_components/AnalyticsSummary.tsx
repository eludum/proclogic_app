"use client";

import { BarChart2Icon, BuildingIcon, CalendarIcon, PieChartIcon } from 'lucide-react';
import { ErrorMessage, LoadingSpinner } from './CommonComponents';

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

const AnalyticsSummary = ({ totalValue, sectorData, isLoading, error }) => {
    if (isLoading) {
        return <LoadingSpinner message="Samenvattingsgegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // Calculate summary metrics
    const totalCount = sectorData ? sectorData.reduce((acc, item) => acc + item.count, 0) : 0;
    const avgValue = totalCount ? totalValue / totalCount : 0;
    const topSector = sectorData && sectorData.length > 0 ? sectorData[0].sector : "N/A";

    return (
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
    );
};

export default AnalyticsSummary;
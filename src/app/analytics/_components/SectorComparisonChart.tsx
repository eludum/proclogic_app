"use client";

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartContainer, CustomTooltip, EmptyState, ErrorMessage, LoadingSpinner } from './CommonComponents';

const SectorComparisonChart = ({ data, isLoading, error }) => {
    if (isLoading) {
        return <LoadingSpinner message="Sectorgegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!data || data.length === 0) {
        return <EmptyState message="Geen sectorgegevens beschikbaar" />;
    }

    // Limit to top 8 sectors for better readability in the chart
    const displayData = data.slice(0, 8);

    return (
        <ChartCard
            title="Gunningen per sector"
            description="Verdeling van gunningen over verschillende sectoren"
        >
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
                        dataKey="sector"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                    />
                    <Legend />
                    <Bar dataKey="total_value" name="Totale waarde" fill="#0088FE" radius={[0, 4, 4, 0]} />
                    <CustomTooltip />
                </BarChart>
            </ChartContainer>
        </ChartCard>
    );
};

export default SectorComparisonChart;
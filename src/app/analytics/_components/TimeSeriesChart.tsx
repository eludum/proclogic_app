"use client";

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartContainer, CustomTooltip, EmptyState, ErrorMessage, LoadingSpinner } from './CommonComponents';

const TimeSeriesChart = ({ data, isLoading, error, className = "" }) => {
    if (isLoading) {
        return <LoadingSpinner message="Tijdreeksgegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!data || data.length === 0) {
        return <EmptyState message="Geen tijdreeksgegevens beschikbaar" />;
    }

    return (
        <ChartCard
            title="Gunningswaarde over tijd"
            description="Volg hoe gunningswaarden en aantallen zijn veranderd over tijd"
            className={className}
        >
            <ChartContainer height={350}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
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
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
                            return `€${value}`;
                        }}
                        stroke="#9ca3af"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="total_value"
                        name="Totale waarde"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        yAxisId="left"
                        dot={{ strokeWidth: 2 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        name="Aantal gunningen"
                        stroke="#82ca9d"
                        yAxisId="right"
                        strokeWidth={2}
                        dot={{ strokeWidth: 2 }}
                    />
                    <CustomTooltip />
                </LineChart>
            </ChartContainer>
        </ChartCard>
    );
};

export default TimeSeriesChart;
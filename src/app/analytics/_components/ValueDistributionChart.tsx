"use client";

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import { ChartCard, ChartContainer, CustomTooltip, EmptyState, ErrorMessage, LoadingSpinner } from './CommonComponents';

const ValueDistributionChart = ({ data, isLoading, error }) => {
    if (isLoading) {
        return <LoadingSpinner message="Waarderangegegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!data || data.length === 0) {
        return <EmptyState message="Geen waarderangegegevens beschikbaar" />;
    }

    return (
        <ChartCard
            title="Gunningen per waarderange"
            description="Verdeling van contracten over verschillende waarderanges"
        >
            <ChartContainer height={350}>
                <BarChart
                    data={data}
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
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
                            return `€${value}`;
                        }}
                        stroke="#82ca9d"
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Aantal gunningen" fill="#8884D8" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="total_value" name="Totale waarde" fill="#82CA9D" radius={[4, 4, 0, 0]} />
                    <CustomTooltip />
                </BarChart>
            </ChartContainer>
        </ChartCard>
    );
};

export default ValueDistributionChart;
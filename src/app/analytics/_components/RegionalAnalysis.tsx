"use client";

import { useState } from 'react';
import { Cell, Legend, Pie, PieChart } from 'recharts';
import { ChartCard, ChartContainer, COLORS, CustomTooltip, EmptyState, ErrorMessage, LoadingSpinner } from './CommonComponents';

const RegionalAnalysis = ({ data, isLoading, error }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    if (isLoading) {
        return <LoadingSpinner message="Regionale gegevens laden..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!data || data.length === 0) {
        return (
            <ChartCard
                title="Regionale analyse"
                description="Verdeling van gunningen per regio"
            >
                <EmptyState message="Regionale analyse is momenteel niet beschikbaar" />
            </ChartCard>
        );
    }

    // Process data for the chart
    const chartData = data.map(item => ({
        name: item.region || 'Onbekend',
        value: item.total_value
    }));

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ChartCard
            title="Regionale analyse"
            description="Verdeling van gunningen per regio"
        >
            <ChartContainer height={350}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={renderCustomizedLabel}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke={activeIndex === index ? '#fff' : 'none'}
                                strokeWidth={activeIndex === index ? 2 : 0}
                            />
                        ))}
                    </Pie>
                    <Legend />
                    <CustomTooltip />
                </PieChart>
            </ChartContainer>
        </ChartCard>
    );
};

export default RegionalAnalysis;
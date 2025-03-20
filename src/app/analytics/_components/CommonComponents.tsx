"use client";

import { ReactElement } from 'react';
import { ResponsiveContainer, TooltipProps } from 'recharts';

// Color palette for visualizations
export const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1',
    '#a4de6c', '#d0ed57', '#8884d8', '#83a6ed'
];

// Format large numbers for display with euro symbol
export const formatValue = (value: number) => {
    if (!value && value !== 0) return 'N/A';

    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(1)}K`;
    }
    return `€${value}`;
};

// Format percentage values
export const formatPercent = (value: number) => {
    if (!value && value !== 0) return 'N/A';
    return `${value.toFixed(1)}%`;
};

// Custom tooltip interface extending Recharts tooltip props
interface CustomTooltipProps extends Omit<TooltipProps<number, string>, 'payload'> {
    active?: boolean;
    payload?: Array<{
        color: string;
        name: string;
        value: number;
        dataKey?: string;
        payload?: Record<string, any>;
    }>;
    label?: string;
    valuePrefix?: string;
}

// Custom tooltip for charts
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
    valuePrefix = "€"
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-sm shadow-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {valuePrefix === '%' ?
                            formatPercent(entry.value ?? 0) :
                            formatValue(entry.value ?? 0)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Loading spinner props
interface LoadingSpinnerProps {
    message?: string;
}

// Loading spinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Laden..." }) => (
    <div className="flex flex-col items-center justify-center h-64 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </div>
);

// Error message props
interface ErrorMessageProps {
    message: string;
}

// Error message component
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4 h-64 flex items-center justify-center">
        <p className="text-red-700 dark:text-red-300 text-center">
            {message || "Er is een fout opgetreden bij het laden van de gegevens."}
        </p>
    </div>
);

// Chart card props
interface ChartCardProps {
    title: string;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

// Card component for charts
export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    description,
    children,
    className = ""
}) => (
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

// Empty state props
interface EmptyStateProps {
    message?: string;
}

// Empty state component
export const EmptyState: React.FC<EmptyStateProps> = ({ message = "Geen gegevens beschikbaar" }) => (
    <div className="text-center py-10 text-gray-500 dark:text-gray-400 h-64 flex items-center justify-center">
        <p>{message}</p>
    </div>
);

// Chart container props
interface ChartContainerProps {
    children: ReactElement;
    height?: number;
}

// Wrapper for responsive charts
export const ChartContainer: React.FC<ChartContainerProps> = ({ children, height = 300 }) => (
    <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
            {children}
        </ResponsiveContainer>
    </div>
);
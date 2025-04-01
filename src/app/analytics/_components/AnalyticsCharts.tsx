"use client"
import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  Sector
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { Skeleton } from "@/components/Skeleton";
import { AwardSectorItem } from "../types";

interface AnalyticsChartProps {
  sectorData: AwardSectorItem[];
  isLoading: boolean;
}

export default function AnalyticsChart({ sectorData, isLoading }: AnalyticsChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Chart colors
  const COLORS = [
    "#3882A4", "#52B7C2", "#B7BF10", "#E4B55B", "#E67F33", 
    "#9C538B", "#74A99C", "#C25450", "#6A8EAE", "#8C4646"
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      notation: 'compact',
      maximumSignificantDigits: 3
    }).format(value);
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-astral-600 dark:text-astral-400">
            Aantal: {payload[0].payload.count}
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Waarde: {formatCurrency(payload[1].payload.total_value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium">{data.sector}</p>
          <p className="text-sm">Aantal: {data.count}</p>
          <p className="text-sm">Waarde: {formatCurrency(data.total_value)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((data.total_value / data.totalSum) * 100)}% van totaal
          </p>
        </div>
      );
    }
    return null;
  };

  // Active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, total_value
    } = props;

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#888" className="text-xs">
          {payload.sector}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333" className="text-xs font-medium">
          {formatCurrency(payload.total_value)}
        </text>
        <text x={cx} y={cy + 25} dy={8} textAnchor="middle" fill="#999" className="text-xs">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Prepare data for pie chart by adding total sum
  const pieData = sectorData.map(item => {
    const totalSum = sectorData.reduce((sum, curr) => sum + curr.total_value, 0);
    return {
      ...item,
      totalSum
    };
  }).slice(0, 8); // Limit to top 8 sectors for better visibility

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  // No data state
  if (sectorData.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Geen sectorgegevens beschikbaar voor de geselecteerde filters
      </div>
    );
  }

  return (
    <Tabs defaultValue="bar" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Verdeling per sector
        </h3>
        <TabsList>
          <TabsTrigger value="bar">Staafdiagram</TabsTrigger>
          <TabsTrigger value="pie">Cirkeldiagram</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="bar" className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sectorData.slice(0, 10)}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 120
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="sector" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{fontSize: 12}}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              tickFormatter={formatNumber}
              label={{ value: 'Aantal', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickFormatter={(value) => formatCurrency(value).replace('€', '')}
              label={{ value: 'Waarde (€)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              yAxisId="left" 
              dataKey="count" 
              name="Aantal contracten" 
              fill="#3882A4" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right" 
              dataKey="total_value" 
              name="Totale waarde" 
              fill="#52B7C2" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="pie" className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              dataKey="total_value"
              nameKey="sector"
              onMouseEnter={(data, index) => setActiveIndex(index)}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              formatter={(value, entry, index) => {
                const item = pieData[index];
                return `${value} (${formatCurrency(item.total_value)})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
}
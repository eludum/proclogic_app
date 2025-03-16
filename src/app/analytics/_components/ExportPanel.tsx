"use client";

import { useToast } from '@/lib/useToast';
import { DownloadIcon } from 'lucide-react';

const ExportPanel = ({ dashboardData, filters, isLoading }) => {
    const { toast } = useToast();

    // Calculate totals for summary
    const totalCount = dashboardData.sectorData.reduce((acc, item) => acc + item.count, 0);
    const avgValue = totalCount ? dashboardData.totalValue / totalCount : 0;
    const topSector = dashboardData.sectorData.length > 0 ? dashboardData.sectorData[0].sector : "N/A";

    // Function to export data
    const exportData = (format) => {
        // Create export data
        let content = '';
        let filename = `marktanalyse-export-${new Date().toISOString().split('T')[0]}.${format}`;
        let fileType = format === 'csv' ? 'text/csv' : 'application/json';

        if (format === 'csv') {
            // Create CSV header
            content = 'Sector,Aantal,TotaleWaarde\n';

            // Add data rows
            dashboardData.sectorData.forEach(item => {
                content += `"${item.sector}",${item.count},${item.total_value}\n`;
            });

            // Add competitor data if available
            if (dashboardData.winnerData && dashboardData.winnerData.length > 0) {
                content += '\n\nConcurrenten,Aantal,TotaleWaarde\n';
                dashboardData.winnerData.forEach(item => {
                    content += `"${item.winner}",${item.count},${item.total_value}\n`;
                });
            }
        } else {
            // JSON format
            const exportObj = {
                filters: {
                    year: filters.year,
                    timeframe: filters.timeframe,
                    sector: filters.sector
                },
                summary: {
                    totalValue: dashboardData.totalValue,
                    totalCount,
                    avgValue,
                    topSector
                },
                sectors: dashboardData.sectorData,
                winners: dashboardData.winnerData,
                timeSeries: dashboardData.timeSeriesData,
                valueRanges: dashboardData.valueRangesData,
                regionalData: dashboardData.regionalData,
                exportDate: new Date().toISOString()
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
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Exporteer marktgegevens
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download de marktanalysegegevens voor verder gebruik in uw strategie
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={() => exportData('csv')}
                    disabled={isLoading}
                >
                    <DownloadIcon size={16} />
                    <span>Exporteren als CSV</span>
                </button>
                <button
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
                    onClick={() => exportData('json')}
                    disabled={isLoading}
                >
                    <DownloadIcon size={16} />
                    <span>Exporteren als JSON</span>
                </button>
            </div>
        </div>
    );
};

export default ExportPanel;
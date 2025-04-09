import { Card } from "@/components/Card";
import { EuroIcon, BarChart3Icon, PackageIcon, TrendingUpIcon } from "lucide-react";
import { AwardSummary, AwardSectorItem } from "../types";
import { Skeleton } from "@/components/Skeleton";

interface InfoCardsProps {
  summaryData: AwardSummary | null;
  sectorData: AwardSectorItem[];
  isLoading: boolean;
}

export default function InfoCards({ summaryData, sectorData, isLoading }: InfoCardsProps) {
  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* Total Value Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Totale contractwaarde</h3>
            <div className="w-8 h-8 rounded-full bg-astral-100 dark:bg-astral-900/30 flex items-center justify-center">
              <EuroIcon className="h-4 w-4 text-astral-600 dark:text-astral-400" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {summaryData ? formatCurrency(summaryData.total_value) : '€0'}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Totale waarde van contracten
          </p>
      </Card>

      {/* Contract Count Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Aantal contracten</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {summaryData ? summaryData.total_count : '0'}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Aantal toegekende contracten
          </p>
      </Card>

      {/* Average Value Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Gemiddelde waarde</h3>
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUpIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {summaryData ? formatCurrency(summaryData.avg_value) : '€0'}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gemiddelde per contract
          </p>
      </Card>

      {/* Top Sector Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Top sector</h3>
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <PackageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {sectorData && sectorData.length > 0 ? sectorData[0].sector : 'Geen data'}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {sectorData && sectorData.length > 0 
              ? `${sectorData[0].count} contracten (${formatCurrency(sectorData[0].total_value)})`
              : 'Geen sectordata beschikbaar'}
          </p>
      </Card>
    </div>
  );
}
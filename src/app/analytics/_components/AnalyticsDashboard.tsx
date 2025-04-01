"use client"
import { siteConfig } from "@/app/siteConfig";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/Card";
import { Toaster } from '@/components/Toaster';
import { useToast } from '@/lib/useToast';
import InfoCards from "./InfoCards";
import AnalyticsTable from "./AnalyticsTable";
import AnalyticsChart from "./AnalyticsCharts";
import AnalyticsFilters from "./AnalyticsFilters";
import { AwardSummary, AwardSectorItem, ContractItem } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";

const API_BASE_URL = siteConfig.api_base_url;

interface AnalyticsClientProps {
  initialSummaryData: AwardSummary | null;
  initialSectorData: AwardSectorItem[];
}

export default function AnalyticsDashboard({ 
  initialSummaryData, 
  initialSectorData 
}: AnalyticsClientProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  // State for various data
  const [summaryData, setSummaryData] = useState<AwardSummary | null>(initialSummaryData);
  const [sectorData, setSectorData] = useState<AwardSectorItem[]>(initialSectorData || []);
  const [contractsData, setContractsData] = useState<ContractItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filtering state
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    quarter: null as number | null,
    month: null as number | null,
    sector: "" as string,
    winner: "" as string,
    supplier: "" as string,
  });

  // Fetch data with the current filters
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authenticatie fout",
          description: "Kon niet authentiseren. Log opnieuw in.",
          variant: "error",
        });
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.quarter) params.append('quarter', filters.quarter.toString());
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.sector) params.append('sector_code', filters.sector);
      if (filters.winner) params.append('winner', filters.winner);
      if (filters.supplier) params.append('supplier', filters.supplier);

      // Fetch summary data
      const summaryResponse = await fetch(`${API_BASE_URL}/awards/summary?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!summaryResponse.ok) {
        throw new Error(`API error: ${summaryResponse.status}`);
      }
      
      const summaryResult = await summaryResponse.json();
      setSummaryData(summaryResult);

      // Fetch sector data
      const sectorResponse = await fetch(`${API_BASE_URL}/awards/by-sector?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!sectorResponse.ok) {
        throw new Error(`API error: ${sectorResponse.status}`);
      }
      
      const sectorResult = await sectorResponse.json();
      setSectorData(sectorResult);

      // Get contracts
      // We're using sector to filter, because backend doesn't have a direct /contracts endpoint
      // In a real app, you might want to add such an endpoint
      let winnerParam = "";
      if (filters.winner) {
        winnerParam = `/${encodeURIComponent(filters.winner)}`;
      }

      const contractsResponse = await fetch(`${API_BASE_URL}/awards/winner${winnerParam}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (contractsResponse.ok) {
        const contractsResult = await contractsResponse.json();
        setContractsData(contractsResult.contracts || []);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Fout bij ophalen data",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      <Toaster />
      
      {/* Summary Cards at the top */}
      <InfoCards 
        summaryData={summaryData} 
        sectorData={sectorData.slice(0, 3)} 
        isLoading={isLoading}
      />

      {/* Filters */}
      <div className="mb-6">
        <AnalyticsFilters 
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>

      {/* Toggle between table and chart view */}
      <Tabs defaultValue="table" className="w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Toegekende aanbestedingen
          </h2>
          <TabsList>
            <TabsTrigger value="table" onClick={() => setViewMode('table')}>
              Tabel
            </TabsTrigger>
            <TabsTrigger value="chart" onClick={() => setViewMode('chart')}>
              Grafiek
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="space-y-4">
          <AnalyticsTable 
            contracts={contractsData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card className="p-4">
            <AnalyticsChart 
              sectorData={sectorData}
              isLoading={isLoading}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
"use client"

import { siteConfig } from "@/app/siteConfig";
import { Toaster } from '@/components/Toaster';
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { AwardSectorItem, AwardSummary, ContractItem } from "../types";
import AnalyticsFilters from "./AnalyticsFilters";
import AnalyticsTable from "./AnalyticsTable";
import InfoCards from "./InfoCards";

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

      // Get contracts - using our new endpoint
      const contractsResponse = await fetch(`${API_BASE_URL}/awards/contracts?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (contractsResponse.ok) {
        const contractsResult = await contractsResponse.json();
        setContractsData(contractsResult);
      } else {
        throw new Error(`API error for contracts: ${contractsResponse.status}`);
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
      <div className="mb-4">
        <AnalyticsFilters
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>

      {/* Contracts table */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Toegekende aanbestedingen
        </h2>
        <AnalyticsTable
          contracts={contractsData}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
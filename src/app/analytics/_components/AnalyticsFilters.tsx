"use client"
import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Filter, XIcon } from "lucide-react";
import { nl_sectors } from "@/lib/cpvCodes"; // You'll need to create this

interface AnalyticsFiltersProps {
  currentFilters: {
    year: number;
    quarter: number | null;
    month: number | null;
    sector: string;
    winner: string;
    supplier: string;
  };
  onFilterChange: (filters: any) => void;
  isLoading: boolean;
}

export default function AnalyticsFilters({ 
  currentFilters, 
  onFilterChange, 
  isLoading 
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...currentFilters });
  
  // All years since 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2019 }, 
    (_, i) => currentYear - i
  );

  // CPV sectors
  const sectors = Object.entries(nl_sectors).map(([code, name]) => ({
    code,
    name
  }));

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number | null = value;
    
    // Convert numeric values
    if (name === 'year' && value) {
      parsedValue = parseInt(value);
    } else if ((name === 'quarter' || name === 'month') && value) {
      parsedValue = value ? parseInt(value) : null;
    }
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      quarter: null,
      month: null,
      sector: "",
      winner: "",
      supplier: ""
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      localFilters.quarter !== null ||
      localFilters.month !== null ||
      localFilters.sector !== "" ||
      localFilters.winner !== "" ||
      localFilters.supplier !== ""
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4 p-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              <span>Filters {isExpanded ? 'verbergen' : 'tonen'}</span>
            </Button>
            
            {hasActiveFilters() && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                className="text-sm text-red-600 dark:text-red-400"
              >
                <XIcon size={14} className="mr-1" />
                Reset
              </Button>
            )}
          </div>
          
          <Button
            onClick={applyFilters}
            disabled={isLoading}
            className="bg-astral-600 hover:bg-astral-700 text-white"
          >
            {isLoading ? 'Laden...' : 'Toepassen'}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Time Period Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jaar
              </label>
              <select
                name="year"
                value={localFilters.year}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kwartaal
              </label>
              <select
                name="quarter"
                value={localFilters.quarter || ""}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Alle kwartalen</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maand
              </label>
              <select
                name="month"
                value={localFilters.month || ""}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Alle maanden</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maart</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Augustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            
            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sector
              </label>
              <select
                name="sector"
                value={localFilters.sector}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Alle sectoren</option>
                {sectors.map(sector => (
                  <option key={sector.code} value={sector.code}>{sector.name}</option>
                ))}
              </select>
            </div>
            
            {/* Winner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Winnaar
              </label>
              <input
                type="text"
                name="winner"
                value={localFilters.winner}
                onChange={handleInputChange}
                placeholder="Zoek op bedrijfsnaam"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
            </div>
            
            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leverancier
              </label>
              <input
                type="text"
                name="supplier"
                value={localFilters.supplier}
                onChange={handleInputChange}
                placeholder="Zoek op leverancier"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
    </Card>
  );
}
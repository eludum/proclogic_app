import { useState, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Skeleton } from "@/components/Skeleton";
import { ContractItem } from "../types";
import { getCpvSectorName, getSectorColor } from "@/lib/cpvCodes";
import { SearchIcon } from "lucide-react";
import { formatDate } from "@/lib/publicationUtils";

interface AnalyticsTableProps {
  contracts: ContractItem[];
  isLoading: boolean;
}

export default function AnalyticsTable({ contracts, isLoading }: AnalyticsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ContractItem>("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // For fixed header
  const [headerHeight, setHeaderHeight] = useState(0);
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
  
  // Detect header height on mount and window resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (tableHeaderRef.current) {
        setHeaderHeight(tableHeaderRef.current.offsetHeight);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Handle sorting
  const handleSort = (field: keyof ContractItem) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  // Filter and sort contracts
  const filteredAndSortedContracts = [...contracts]
    .filter((contract) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        contract.title.toLowerCase().includes(searchLower) ||
        contract.winner.toLowerCase().includes(searchLower) ||
        contract.buyer.toLowerCase().includes(searchLower) ||
        contract.sector.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      // Handle different field types
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
      } else if (fieldA instanceof Date && fieldB instanceof Date) {
        return sortDirection === "asc"
          ? fieldA.getTime() - fieldB.getTime()
          : fieldB.getTime() - fieldA.getTime();
      }
      
      // Default case
      return 0;
    });

  // Render sort indicator
  const renderSortIndicator = (field: keyof ContractItem) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? " ↑" : " ↓";
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <div className="p-3">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-3">
        {/* Search bar */}
        <div className="flex mb-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Zoek op titel, winnaar, koper of sector..."
              className="pl-10 py-1 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table with fixed header */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '400px' }}>
          <Table>
            <TableCaption>
              {filteredAndSortedContracts.length === 0
                ? "Geen contractgegevens beschikbaar"
                : `Totaal ${filteredAndSortedContracts.length} contracten`}
            </TableCaption>
            
            <TableHead ref={tableHeaderRef} className="sticky top-0 z-10 bg-white dark:bg-slate-900">
              <TableRow>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs"
                  onClick={() => handleSort("title")}
                >
                  Titel{renderSortIndicator("title")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs"
                  onClick={() => handleSort("award_date")}
                >
                  Datum{renderSortIndicator("award_date")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs"
                  onClick={() => handleSort("winner")}
                >
                  Winnaar{renderSortIndicator("winner")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs"
                  onClick={() => handleSort("buyer")}
                >
                  Opdrachtgever{renderSortIndicator("buyer")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs"
                  onClick={() => handleSort("sector")}
                >
                  Sector{renderSortIndicator("sector")}
                </TableHeaderCell>
                <TableHeaderCell 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 py-2 text-xs text-right"
                  onClick={() => handleSort("value")}
                >
                  Waarde{renderSortIndicator("value")}
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {filteredAndSortedContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Geen contracten gevonden voor de huidige filterinstellingen
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedContracts.map((contract) => (
                  <TableRow key={contract.publication_id}>
                    <TableCell className="font-medium py-2 text-xs">
                      <a
                        href={`/publications/detail/${contract.publication_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contract.title.length > 50
                          ? `${contract.title.substring(0, 50)}...`
                          : contract.title}
                      </a>
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      {contract.award_date
                        ? formatDate(new Date(contract.award_date))
                        : "Onbekend"}
                    </TableCell>
                    <TableCell className="py-2 text-xs">{contract.winner}</TableCell>
                    <TableCell className="py-2 text-xs">{contract.buyer}</TableCell>
                    <TableCell className="py-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getSectorColor(contract.cpv_code)}`}>
                        {getCpvSectorName(contract.cpv_code)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold py-2 text-xs">
                      {formatCurrency(contract.value)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
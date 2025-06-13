"use client";

import { siteConfig } from "@/app/siteConfig";
import { Loader } from "@/components/ui/PageLoad";
import { useAuth } from "@clerk/nextjs";
import {
    BarChart3,
    ChevronDown,
    ChevronRight,
    Euro,
    ExternalLink,
    Filter,
    Search,
    TrendingUp,
    X
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from 'react';
import { Pagination } from "../publications/_components/Pagination";

// Types
interface ContractItem {
    publication_id: string;
    title: string;
    award_date: string;
    winner: string;
    suppliers: Array<{ name: string; id?: string }>;
    value: number;
    sector: string;
    cpv_code: string;
    buyer: string;
}

interface AwardSummary {
    total_count: number;
    total_value: number;
    avg_value: number;
}

interface ContractsResponse {
    items: ContractItem[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

interface Filters {
    search: string;
    year: string;
    quarter: string;
    month: string;
    sector_code: string;
    winner: string;
    supplier: string;
}

// Utility functions
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Components
type StatsCardProps = {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    value: string | number;
    description: string;
};

const StatsCard = ({ icon: Icon, title, value, description }: StatsCardProps) => (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
            <div className="p-2 rounded-full bg-astral-100 dark:bg-astral-900/30">
                <Icon size={20} className="text-astral-600 dark:text-astral-400" />
            </div>
        </div>
    </div>
);

type FilterDropdownProps = {
    isOpen: boolean;
    filters: Filters;
    onFilterChange: (key: keyof Filters, value: string) => void;
    onClear: () => void;
};

const FilterDropdown = ({ isOpen, filters, onFilterChange, onClear }: FilterDropdownProps) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
                <button
                    onClick={onClear}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                >
                    <X size={12} />
                    Alles wissen
                </button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jaar
                        </label>
                        <select
                            value={filters.year}
                            onChange={(e) => onFilterChange('year', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Alle jaren</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kwartaal
                        </label>
                        <select
                            value={filters.quarter}
                            onChange={(e) => onFilterChange('quarter', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Alle kwartalen</option>
                            <option value="1">K1</option>
                            <option value="2">K2</option>
                            <option value="3">K3</option>
                            <option value="4">K4</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Winnaar
                    </label>
                    <input
                        type="text"
                        value={filters.winner}
                        onChange={(e) => onFilterChange('winner', e.target.value)}
                        placeholder="Filter op winnaar naam"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Opdrachtgever
                    </label>
                    <input
                        type="text"
                        value={filters.supplier}
                        onChange={(e) => onFilterChange('supplier', e.target.value)}
                        placeholder="Filter op opdrachtgever naam"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>
        </div>
    );
};

interface ContractRowProps {
    contract: ContractItem;
    isExpanded: boolean;
    onToggle: () => void;
    onViewDetails: () => void;
}

const ContractRow = ({ contract, isExpanded, onToggle, onViewDetails }: ContractRowProps) => (
    <>
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3">
                <button
                    onClick={onToggle}
                    className="flex items-center gap-2 text-left group"
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {truncateText(contract.title, 60)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {contract.publication_id}
                        </p>
                    </div>
                </button>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(contract.award_date)}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {truncateText(contract.winner, 30)}
            </td>
            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {contract.value > 0 ? formatCurrency(contract.value) : 'Niet beschikbaar'}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {truncateText(contract.sector, 25)}
            </td>
            <td className="px-4 py-3">
                <button
                    onClick={onViewDetails}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-astral-50 text-astral-700 dark:bg-astral-900/30 dark:text-astral-300 rounded-md hover:bg-astral-100 dark:hover:bg-astral-900/50 transition-colors"
                >
                    <ExternalLink size={12} />
                    Details
                </button>
            </td>
        </tr>
        {isExpanded && (
            <tr className="bg-gray-50 dark:bg-gray-800/30">
                <td colSpan={6} className="px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Opdrachtgever:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{contract.buyer}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">CPV Code:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 font-mono text-xs">{contract.cpv_code}</p>
                        </div>
                        {contract.suppliers && contract.suppliers.length > 0 && (
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Leveranciers:</span>
                                <div className="mt-1 space-y-1">
                                    {contract.suppliers.slice(0, 3).map((supplier, index) => (
                                        <p key={index} className="text-gray-600 dark:text-gray-400 text-xs">
                                            {supplier.name}
                                            {supplier.id && (
                                                <span className="text-gray-500 ml-1">({supplier.id})</span>
                                            )}
                                        </p>
                                    ))}
                                    {contract.suppliers.length > 3 && (
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                            +{contract.suppliers.length - 3} meer...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={onViewDetails}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-astral-600 text-white text-sm font-medium rounded-md hover:bg-astral-700 transition-colors"
                        >
                            <ExternalLink size={14} />
                            Bekijk volledige gunning details
                        </button>
                    </div>
                </td>
            </tr>
        )}
    </>
);


// Main component
export default function AnalyticsDashboard() {
    const { getToken } = useAuth();
    const router = useRouter();

    // State
    const [contracts, setContracts] = useState<ContractsResponse | null>(null);
    const [summary, setSummary] = useState<AwardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter state
    const [filters, setFilters] = useState<Filters>({
        search: '',
        year: '',
        quarter: '',
        month: '',
        sector_code: '',
        winner: '',
        supplier: ''
    });

    // Debounced search
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Build query parameters
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();

        params.append('page', currentPage.toString());
        params.append('size', '25');

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        return params.toString();
    }, [filters, currentPage]);

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) throw new Error('Geen authenticatie token');

            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch contracts and summary in parallel
            const [contractsRes, summaryRes] = await Promise.all([
                fetch(`${siteConfig.api_base_url}/contracts?${queryParams}`, { headers }),
                fetch(`${siteConfig.api_base_url}/contracts/summary?${queryParams}`, { headers })
            ]);

            if (!contractsRes.ok || !summaryRes.ok) {
                throw new Error('Fout bij het ophalen van gegevens');
            }

            const [contractsData, summaryData] = await Promise.all([
                contractsRes.json(),
                summaryRes.json()
            ]);

            setContracts(contractsData);
            setSummary(summaryData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [queryParams]);

    // Event handlers
    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            year: '',
            quarter: '',
            month: '',
            sector_code: '',
            winner: '',
            supplier: ''
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    const toggleRowExpansion = (contractId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(contractId)) {
            newExpanded.delete(contractId);
        } else {
            newExpanded.add(contractId);
        }
        setExpandedRows(newExpanded);
    };
    const viewContractDetails = (contractId: string) => {
        router.push(`/contracts/${contractId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) {
        return (
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Gunning analyse</h1>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">Fout: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Opnieuw proberen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section aria-label="Analytics Dashboard">
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <div className="w-full">
                    <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Gunning analyse</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ontdek inzichten in toegekende gunningen en markttrends.</p>
                </div>
            </div>

            <div className="px-4 sm:px-6 pb-6 space-y-6">
                {/* Search and Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Zoek gunningen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-astral-500 focus:border-transparent"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <Filter size={16} />
                                Filters
                            </button>

                            <FilterDropdown
                                isOpen={showFilters}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={handleClearFilters}
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                    </div>
                                    <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
                                        <div className="w-5 h-5"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : summary ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            icon={BarChart3}
                            title="Totaal gunningen"
                            value={summary.total_count.toLocaleString()}
                            description="Toegekende gunningen"
                        />
                        <StatsCard
                            icon={Euro}
                            title="Totale waarde"
                            value={formatCurrency(summary.total_value)}
                            description="Gecombineerde gunningswaarde"
                        />
                        <StatsCard
                            icon={TrendingUp}
                            title="Gemiddelde waarde"
                            value={formatCurrency(summary.avg_value)}
                            description="Per gunning"
                        />
                    </div>
                ) : null}

                {/* Results count */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {loading ? (
                        "Gunningen laden..."
                    ) : contracts ? (
                        `${contracts.total} gunningen gevonden`
                    ) : (
                        "Geen gunningen beschikbaar"
                    )}
                </div>

                {/* Results Table */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12">
                            <Loader loadingtext="Gunningen laden..." size={32} />
                        </div>
                    ) : contracts?.items.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">Geen gunningen gevonden die voldoen aan uw criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Gunning
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Datum
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Winnaar
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Waarde
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Sector
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Acties
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts?.items.map((contract) => (
                                            <ContractRow
                                                key={contract.publication_id}
                                                contract={contract}
                                                isExpanded={expandedRows.has(contract.publication_id)}
                                                onToggle={() => toggleRowExpansion(contract.publication_id)}
                                                onViewDetails={() => viewContractDetails(contract.publication_id)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {contracts && contracts.pages > 1 && (
                    <Pagination
                        currentPage={contracts.page}
                        totalPages={contracts.pages}
                        totalItems={contracts.total}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                    />
                )}
            </div>
        </section>
    );
}
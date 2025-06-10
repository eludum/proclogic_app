"use client";

import { siteConfig } from "@/app/siteConfig";
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
import { useEffect, useMemo, useState } from 'react';

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
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    description: string;
};

const StatsCard = ({ icon: Icon, title, value, description }: StatsCardProps) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{description}</p>
            </div>
            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white">Filters</h3>
                <button
                    onClick={onClear}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                >
                    <X className="w-3 h-3" />
                    Alles wissen
                </button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Jaar
                        </label>
                        <select
                            value={filters.year}
                            onChange={(e) => onFilterChange('year', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="">Alle jaren</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Kwartaal
                        </label>
                        <select
                            value={filters.quarter}
                            onChange={(e) => onFilterChange('quarter', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Winnaar
                    </label>
                    <input
                        type="text"
                        value={filters.winner}
                        onChange={(e) => onFilterChange('winner', e.target.value)}
                        placeholder="Filter op winnaar naam"
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Opdrachtgever
                    </label>
                    <input
                        type="text"
                        value={filters.supplier}
                        onChange={(e) => onFilterChange('supplier', e.target.value)}
                        placeholder="Filter op opdrachtgever naam"
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                </div>
            </div>
        </div>
    );
};

type ContractRowProps = {
    contract: ContractItem;
    isExpanded: boolean;
    onToggle: () => void;
    onViewDetails: () => void;
};

const ContractRow = ({ contract, isExpanded, onToggle, onViewDetails }: ContractRowProps) => (
    <>
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3">
                <button
                    onClick={onToggle}
                    className="flex items-center gap-2 text-left group"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                            {truncateText(contract.title, 60)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {contract.publication_id}
                        </div>
                    </div>
                </button>
            </td>

            <td className="px-4 py-3">
                <div className="text-sm text-slate-900 dark:text-white">
                    {formatDate(contract.award_date)}
                </div>
            </td>

            <td className="px-4 py-3">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {truncateText(contract.winner, 30)}
                </div>
            </td>

            <td className="px-4 py-3">
                <div className="text-sm text-slate-900 dark:text-white">
                    {truncateText(contract.buyer, 30)}
                </div>
            </td>

            <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    {truncateText(contract.sector, 25)}
                </span>
            </td>

            <td className="px-4 py-3 text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(contract.value)}
                </div>
            </td>

            <td className="px-4 py-3 text-right">
                <button
                    onClick={onViewDetails}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Bekijk
                    <ExternalLink className="w-3 h-3" />
                </button>
            </td>
        </tr>

        {isExpanded && (
            <tr className="bg-slate-50 dark:bg-slate-700/30">
                <td colSpan={7} className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Gunning Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Volledige titel:</span>
                                    <p className="text-slate-900 dark:text-white font-medium">{contract.title}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">CPV Code:</span>
                                    <p className="text-slate-900 dark:text-white font-mono">{contract.cpv_code}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Gunningsdatum:</span>
                                    <p className="text-slate-900 dark:text-white">{formatDate(contract.award_date)}</p>
                                </div>
                            </div>
                        </div>

                        {contract.suppliers.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Leveranciers ({contract.suppliers.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {contract.suppliers.map((supplier, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        >
                                            {supplier.name}
                                            {supplier.id && (
                                                <span className="ml-1 opacity-75">({supplier.id})</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        )}
    </>
);

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Vorige
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                            disabled={typeof pageNum !== 'number'}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${pageNum === currentPage
                                ? 'bg-blue-600 text-white'
                                : typeof pageNum === 'number'
                                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    : 'text-slate-400 cursor-default'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Volgende
                </button>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
                Pagina {currentPage} van {totalPages}
            </div>
        </div>
    );
};

// Main component
export default function AnalyticsDashboard() {
    const { getToken } = useAuth();

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
        window.open(`/publications/detail/${contractId}`, '_blank');
    };

    if (error) {
        return (
            <div className="p-6">
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
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Zoek gunningen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                        >
                            <Filter className="w-4 h-4" />
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
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        icon={BarChart3}
                        title="Totaal Gunningen"
                        value={summary.total_count.toLocaleString()}
                        description="Toegekende gunningen"
                    />
                    <StatsCard
                        icon={Euro}
                        title="Totale Waarde"
                        value={formatCurrency(summary.total_value)}
                        description="Gecombineerde gunningswaarde"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        title="Gemiddelde Waarde"
                        value={formatCurrency(summary.avg_value)}
                        description="Per gunning"
                    />
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-slate-600 dark:text-slate-400">Gunningen laden...</p>
                    </div>
                ) : contracts?.items.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600 dark:text-slate-400">Geen gunningen gevonden die voldoen aan uw criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Titel
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Datum
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Winnaar
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Opdrachtgever
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Sector
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Waarde
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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

                        {contracts && (
                            <Pagination
                                currentPage={contracts.page}
                                totalPages={contracts.pages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
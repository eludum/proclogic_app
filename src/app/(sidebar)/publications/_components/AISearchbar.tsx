import { BookmarkPlus, Building2, Calendar, Search, Sparkles, Tag, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AISearchComponent = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [aiFeatureVisible, setAiFeatureVisible] = useState(true);
    const searchInputRef = useRef(null);

    // Mock search results - replace with your actual API call
    const mockSearchResults = [
        {
            workspace_id: "ELK-2024-001",
            title: "Elektriciteitswerken voor gemeentelijke gebouwen - Renovatie elektrische installaties",
            organisation: "Gemeente Mechelen",
            sector: "Elektriciteit en Energie",
            match_percentage: 95,
            award_date: "2024-06-15",
            value: 85000,
            is_active: true,
            original_description: "Renovatie van elektrische installaties in gemeentelijke gebouwen inclusief nieuwe bekabeling, schakelborden en veiligheidsystemen."
        },
        {
            workspace_id: "ELK-2024-002",
            title: "Elektriciteitsaansluiting industrieterrein - Nieuwe hoogspanningsverbinding",
            organisation: "Fluvius",
            sector: "Elektriciteit en Energie",
            match_percentage: 88,
            award_date: "2024-07-01",
            value: 125000,
            is_active: true,
            original_description: "Aanleg van nieuwe hoogspanningsverbinding voor industrieterrein met transformatorstation en distributienetten."
        },
        {
            workspace_id: "ELK-2024-003",
            title: "Onderhoudswerken elektrische infrastructuur - Preventief onderhoud",
            organisation: "Elia Group",
            sector: "Elektriciteit en Energie",
            match_percentage: 82,
            award_date: "2024-06-30",
            value: 67000,
            is_active: true,
            original_description: "Preventief onderhoud van elektrische infrastructuur inclusief inspectie, reiniging en vervanging van componenten."
        }
    ];

    // Simulate AI-powered search
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setShowResults(false);
            return;
        }

        setIsSearching(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Filter results based on contextual matching
        const filteredResults = mockSearchResults.filter(result =>
            query.toLowerCase().includes('elektriciteit') ||
            query.toLowerCase().includes('electric') ||
            query.toLowerCase().includes('stroom') ||
            query.toLowerCase().includes('energie')
        );

        setSearchResults(filteredResults);
        setShowResults(true);
        setIsSearching(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto relative">
            {/* AI Feature Indicator */}
            {aiFeatureVisible && (
                <div className="mb-4 relative">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 relative overflow-hidden">
                        {/* Floating arrow pointer */}
                        <div className="absolute -top-2 right-6 z-10">
                            <div className="relative">
                                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-bounce">
                                    ✨ AI-Powered!
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setAiFeatureVisible(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full">
                                <Sparkles className="text-purple-600 dark:text-purple-300" size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Slimme Contextuele Zoekfunctie</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">AI begrijpt de betekenis achter je zoekopdracht</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                                🧠 Semantisch zoeken
                            </span>
                            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                                🎯 Context-bewust
                            </span>
                            <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                                💬 Natuurlijke taal
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-astral-500 focus-within:border-astral-500">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isSearching ? (
                            <div className="animate-spin h-5 w-5 border-2 border-astral-500 border-t-transparent rounded-full" />
                        ) : (
                            <Search className="h-5 w-5 text-gray-400" />
                        )}
                    </div>

                    <input
                        ref={searchInputRef}
                        type="text"
                        className="block w-full pl-10 pr-12 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-0 focus:ring-0 focus:outline-none text-base"
                        placeholder="Probeer: 'elektriciteit werken' - AI begrijpt context en synoniemen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                    />

                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setShowResults(false);
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* AI-powered suggestions */}
                {!searchQuery && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {['elektriciteit werken', 'IT diensten', 'bouwprojecten', 'consultancy'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setSearchQuery(suggestion)}
                                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-astral-50 dark:hover:bg-astral-900 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                            >
                                <Sparkles size={12} className="text-astral-500" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Results */}
            {showResults && (
                <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                <TrendingUp size={16} />
                                <span>AI vond {searchResults.length} relevante aanbestedingen</span>
                            </div>

                            <div className="space-y-3">
                                {searchResults.map((result) => (
                                    <div key={result.workspace_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <a
                                                    href={`/publications/detail/${result.workspace_id}`}
                                                    target="_blank"
                                                    className="text-lg font-semibold text-astral-600 dark:text-astral-400 hover:underline line-clamp-2"
                                                >
                                                    {result.title}
                                                </a>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    ID: {result.workspace_id}
                                                </p>
                                            </div>

                                            <div className="flex items-center ml-4">
                                                <div className="text-xs text-astral-700 dark:text-astral-300">
                                                    <span className="font-medium">Match: </span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {result.match_percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                                            {result.original_description}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span className="font-medium">Organisatie:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{result.organisation}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Tag size={14} className="text-gray-400" />
                                                <span className="font-medium">Sector:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{result.sector}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="font-medium">Datum:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{formatDate(result.award_date)}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Waarde:</span>
                                                <span className="text-gray-600 dark:text-gray-400">{formatCurrency(result.value)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.is_active
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {result.is_active ? "Actief" : "Inactief"}
                                            </span>

                                            <button className="text-astral-600 dark:text-astral-400 hover:text-astral-800 dark:hover:text-astral-300 text-xs font-medium flex items-center gap-1">
                                                <BookmarkPlus size={12} />
                                                Opslaan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Geen resultaten gevonden voor "{searchQuery}"</p>
                            <p className="text-xs mt-1">Probeer andere zoektermen of synoniemen</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AISearchComponent;
"use client";

const FilterPanel = ({
    selectedYear,
    setSelectedYear,
    timeframe,
    setTimeframe,
    selectedSector,
    setSelectedSector,
    availableYears,
    companySectors,
    isLoading
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter op jaar
                    </label>
                    <select
                        id="yearFilter"
                        value={selectedYear || ''}
                        onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                        className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                    >
                        <option value="">Alle jaren</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full sm:w-auto">
                    <label htmlFor="timeframeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tijdsperiode
                    </label>
                    <select
                        id="timeframeFilter"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                    >
                        <option value="monthly">Maandelijks</option>
                        <option value="quarterly">Per kwartaal</option>
                        <option value="yearly">Jaarlijks</option>
                    </select>
                </div>

                {companySectors.length > 0 && (
                    <div className="w-full sm:w-auto">
                        <label htmlFor="sectorFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sector
                        </label>
                        <select
                            id="sectorFilter"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className="block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            disabled={isLoading}
                        >
                            <option value="all">Alle sectoren</option>
                            {companySectors.map((sector, index) => (
                                <option key={index} value={sector.name}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
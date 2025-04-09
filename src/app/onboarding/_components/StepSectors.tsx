import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { cx } from "@/lib/utils"
import { ChevronDown, ChevronUp, InfoIcon, SearchIcon, TagIcon } from "lucide-react"
import { CompanyData, availableSectors, sectorCategories } from "./constants"

interface StepSectorsProps {
    companyData: CompanyData
    toggleSector: (sectorValue: string) => void
    expandedCategory: string | null
    toggleExpandCategory: (category: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export default function StepSectors({
    companyData,
    toggleSector,
    expandedCategory,
    toggleExpandCategory,
    searchQuery,
    setSearchQuery
}: StepSectorsProps) {
    // Filter sectors based on search query
    const filteredSectors = availableSectors.filter(sector =>
        sector.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.value.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sectoren selecteren
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Kies de sectoren waarin je bedrijf actief is voor betere aanbevelingen.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                {/* Info box */}
                <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-4 rounded-md flex items-start gap-3">
                    <InfoIcon className="text-astral-600 dark:text-astral-300 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-medium text-astral-800 dark:text-astral-200 text-sm">
                            Wat zijn CPV-codes?
                        </h3>
                        <p className="text-sm text-astral-700 dark:text-astral-300 mt-1">
                            CPV (Common Procurement Vocabulary) codes worden gebruikt om aanbestedingen te classificeren.
                            Selecteer de sectoren waarin je bedrijf actief is om relevante aanbestedingen te vinden.
                        </p>
                    </div>
                </div>

                {/* Search and actions */}
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Input
                            type="search"
                            className="pl-10"
                            placeholder="Zoek op sector..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{companyData.interested_sectors.length}</span> van {availableSectors.length} sectoren geselecteerd
                        </div>
                    </div>
                </div>

                {/* Sectors list */}
                <div className="space-y-6 mb-6">
                    {searchQuery ? (
                        // Show search results
                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm pb-2 border-b border-gray-100 dark:border-gray-800">
                                Zoekresultaten
                            </h3>
                            {filteredSectors.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    Geen sectoren gevonden voor &quot;{searchQuery}&quot;
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredSectors.map((sector) => {
                                        const isSelected = companyData.interested_sectors.some(s => s.cpv_codes.includes(sector.value))
                                        return (
                                            <div
                                                key={sector.value}
                                                className={cx(
                                                    "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                )}
                                                onClick={() => toggleSector(sector.value)}
                                            >
                                                <div className="flex items-center h-5">
                                                    <Checkbox
                                                        id={`sector-${sector.value}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => { }}
                                                        className="h-4 w-4"
                                                    />
                                                </div>
                                                <div className="flex items-center ml-3">
                                                    <TagIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                    <Label
                                                        htmlFor={`sector-${sector.value}`}
                                                        className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        {sector.label}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                            ({sector.value})
                                                        </span>
                                                    </Label>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show categorized sectors
                        <div className="space-y-6">
                            {sectorCategories.map((category) => (
                                <div key={category.name} className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                                    {/* Category header */}
                                    <div
                                        className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleExpandCategory(category.name)}
                                    >
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                            {category.name}
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {category.sectors.length}
                                            </span>
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-2">
                                                {companyData.interested_sectors.filter(s =>
                                                    category.sectors.some(catSector => s.cpv_codes.includes(catSector))
                                                ).length} geselecteerd
                                            </span>
                                            {expandedCategory === category.name ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Category content */}
                                    {expandedCategory === category.name && (
                                        <div className="p-3 space-y-2">
                                            {availableSectors
                                                .filter(sector => category.sectors.includes(sector.value))
                                                .map(sector => {
                                                    const isSelected = companyData.interested_sectors.some(s => s.cpv_codes.includes(sector.value))
                                                    return (
                                                        <div
                                                            key={sector.value}
                                                            className={cx(
                                                                "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                                isSelected
                                                                    ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                            )}
                                                            onClick={() => toggleSector(sector.value)}
                                                        >
                                                            <div className="flex items-center h-5">
                                                                <Checkbox
                                                                    id={`sector-${sector.value}`}
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => { }}
                                                                    className="h-4 w-4"
                                                                />
                                                            </div>
                                                            <div className="flex items-center ml-3">
                                                                <TagIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                                <Label
                                                                    htmlFor={`sector-${sector.value}`}
                                                                    className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {sector.label}
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                        ({sector.value})
                                                                    </span>
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected sectors summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Geselecteerde sectoren ({companyData.interested_sectors.length})
                    </h3>
                    {companyData.interested_sectors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {companyData.interested_sectors.map((sector, index) => (
                                <div
                                    key={index}
                                    className="px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-md text-xs flex items-center"
                                >
                                    {sector.sector}
                                    <button
                                        type="button"
                                        className="ml-2 text-astral-500 hover:text-astral-700"
                                        onClick={() => toggleSector(sector.cpv_codes[0])}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Geen sectoren geselecteerd. Selecteer minstens één sector.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
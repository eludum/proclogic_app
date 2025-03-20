import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { cx } from "@/lib/utils"
import { CheckCircle, InfoIcon, MapPinIcon, SearchIcon } from "lucide-react"
import { CompanyData, availableRegions, regionCategories } from "./constants"

interface StepRegionsProps {
    companyData: CompanyData
    toggleRegion: (regionValue: string) => void
    selectAllRegions: () => void
    clearAllRegions: () => void
    selectCategory: (category: string) => void
    regionsSearchQuery: string
    setRegionsSearchQuery: (query: string) => void
}

export default function StepRegions({
    companyData,
    toggleRegion,
    selectAllRegions,
    clearAllRegions,
    selectCategory,
    regionsSearchQuery,
    setRegionsSearchQuery
}: StepRegionsProps) {
    // Filter regions based on search query
    const filteredRegions = availableRegions.filter(region =>
        region.label.toLowerCase().includes(regionsSearchQuery.toLowerCase()) ||
        region.value.toLowerCase().includes(regionsSearchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Regio&apos;s Selecteren
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Selecteer de regio&apos;s waar je bedrijf actief is voor relevante aanbestedingen.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                {/* Info box */}
                <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-4 rounded-md flex items-start gap-3">
                    <InfoIcon className="text-astral-600 dark:text-astral-300 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-medium text-astral-800 dark:text-astral-200 text-sm">
                            NUTS-codes
                        </h3>
                        <p className="text-sm text-astral-700 dark:text-astral-300 mt-1">
                            De geselecteerde regio&apos;szijn gebaseerd op NUTS-codes, een hiërarchisch systeem voor het indelen van economische gebieden in Europa.
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
                            placeholder="Zoek op regio..."
                            value={regionsSearchQuery}
                            onChange={(e) => setRegionsSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{companyData.operating_regions.length}</span> van {availableRegions.length} regio&apos;sgeselecteerd
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={selectAllRegions}
                                className="text-xs"
                            >
                                Alles selecteren
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={clearAllRegions}
                                className="text-xs"
                            >
                                Alles wissen
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Regions selection */}
                <div className="mb-6">
                    {regionsSearchQuery ? (
                        // Show search results
                        <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                                Zoekresultaten
                            </h3>
                            {filteredRegions.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                    Geen regio&apos;sgevonden voor &quot;{regionsSearchQuery}&quot;
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filteredRegions.map((region) => {
                                        const isSelected = companyData.operating_regions.includes(region.value)
                                        return (
                                            <div
                                                key={region.value}
                                                className={cx(
                                                    "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                )}
                                                onClick={() => toggleRegion(region.value)}
                                            >
                                                <div className="flex items-center h-5">
                                                    <Checkbox
                                                        id={`region-${region.value}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => { }}
                                                        className="h-4 w-4"
                                                    />
                                                </div>
                                                <div className="flex items-center ml-3">
                                                    <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                    <Label
                                                        htmlFor={`region-${region.value}`}
                                                        className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        {region.label}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                            ({region.value})
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
                        // Show categorized regions
                        <div className="space-y-6">
                            {regionCategories.map((category) => (
                                <div key={category.name}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                            {category.name}
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 text-xs text-astral-600 dark:text-astral-400"
                                            onClick={() => selectCategory(category.name)}
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                            Alles in {category.name.toLowerCase()} selecteren
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableRegions
                                            .filter(region => category.regions.includes(region.value))
                                            .map(region => {
                                                const isSelected = companyData.operating_regions.includes(region.value)
                                                return (
                                                    <div
                                                        key={region.value}
                                                        className={cx(
                                                            "flex items-center p-3 border rounded-md cursor-pointer transition-colors",
                                                            isSelected
                                                                ? "border-astral-300 bg-astral-50 dark:border-astral-700 dark:bg-astral-900/20"
                                                                : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                                        )}
                                                        onClick={() => toggleRegion(region.value)}
                                                    >
                                                        <div className="flex items-center h-5">
                                                            <Checkbox
                                                                id={`region-${region.value}`}
                                                                checked={isSelected}
                                                                onCheckedChange={() => { }}
                                                                className="h-4 w-4"
                                                            />
                                                        </div>
                                                        <div className="flex items-center ml-3">
                                                            <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                            <Label
                                                                htmlFor={`region-${region.value}`}
                                                                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                                                            >
                                                                {region.label}
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                                    ({region.value})
                                                                </span>
                                                            </Label>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected regions summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Geselecteerde regio&apos;s({companyData.operating_regions.length})
                    </h3>
                    {companyData.operating_regions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {companyData.operating_regions.map(regionValue => {
                                const region = availableRegions.find(r => r.value === regionValue)
                                return (
                                    <div
                                        key={regionValue}
                                        className="px-2 py-1 bg-astral-100 dark:bg-astral-900/40 text-astral-700 dark:text-astral-300 rounded-md text-xs flex items-center group"
                                    >
                                        {region?.label || regionValue}
                                        <button
                                            type="button"
                                            className="ml-1 text-astral-500 dark:text-astral-400 hover:text-astral-700 dark:hover:text-astral-200"
                                            onClick={() => toggleRegion(regionValue)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Geen regio&apos;sgeselecteerd. Selecteer minstens één regio.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
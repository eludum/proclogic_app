"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth, useSession } from "@clerk/nextjs"
import { ArrowRight, ChevronDown, ChevronUp, InfoIcon, Loader2, SearchIcon, TagIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { updateSectorsInfo } from "../_actions/onboarding"

// Available sectors based on CPV codes
const availableSectors = [
    { value: "03000000", label: "Landbouw, veeteelt, visserij, bosbouw" },
    { value: "09000000", label: "Aardolieproducten, brandstof, elektriciteit" },
    { value: "14000000", label: "Mijnbouw, basismetalen en aanverwante producten" },
    { value: "15000000", label: "Voedingsmiddelen, dranken, tabak" },
    { value: "30000000", label: "Kantoor- en computerapparatuur" },
    { value: "31000000", label: "Elektrische machines, apparaten, apparatuur" },
    { value: "32000000", label: "Radio-, televisie-, communicatie-, telecommunicatie" },
    { value: "33000000", label: "Medische apparatuur, farmaceutische producten" },
    { value: "34000000", label: "Vervoersmaterieel en hulpstukken voor transport" },
    { value: "35000000", label: "Beveiligings-, brandbestrijdings-, politie-, defensie" },
    { value: "37000000", label: "Muziekinstrumenten, sportartikelen, spellen" },
    { value: "38000000", label: "Laboratorium-, optische en precisieapparatuur" },
    { value: "39000000", label: "Meubelen, inrichting, huishoudelijke apparaten" },
    { value: "41000000", label: "Opgevangen en gezuiverd water" },
    { value: "42000000", label: "Industriële machines" },
    { value: "43000000", label: "Machines voor mijnbouw, steengroeven" },
    { value: "44000000", label: "Bouwconstructies en -materialen" },
    { value: "45000000", label: "Bouwwerkzaamheden" },
    { value: "48000000", label: "Softwarepakketten en informatiesystemen" },
    { value: "50000000", label: "Reparatie- en onderhoudsdiensten" },
    { value: "51000000", label: "Installatiediensten (excl. software)" },
    { value: "55000000", label: "Hotel-, restaurant- en detailhandeldiensten" },
    { value: "60000000", label: "Transportdiensten (excl. afvaltransport)" },
    { value: "63000000", label: "Ondersteunende en aanvullende transportdiensten" },
    { value: "64000000", label: "Post- en telecommunicatiediensten" },
    { value: "65000000", label: "Openbare nutsvoorzieningen" },
    { value: "66000000", label: "Financiële en verzekeringsdiensten" },
    { value: "70000000", label: "Vastgoeddiensten" },
    { value: "71000000", label: "Architectuur-, bouw-, engineering-, inspectiediensten" },
    { value: "72000000", label: "IT-diensten: consulting, softwareontwikkeling" },
    { value: "73000000", label: "Onderzoeks- en ontwikkelingsdiensten" },
    { value: "75000000", label: "Overheids-, defensie- en sociale zekerheidsdiensten" },
    { value: "76000000", label: "Diensten gerelateerd aan de olie- en gasindustrie" },
    { value: "77000000", label: "Landbouw-, bosbouw-, tuinbouw-, aquacultuur diensten" },
    { value: "79000000", label: "Zakelijke diensten: recht, marketing, consulting" },
    { value: "80000000", label: "Onderwijs- en opleidingsdiensten" },
    { value: "85000000", label: "Gezondheidszorg- en maatschappelijke diensten" },
    { value: "90000000", label: "Riolering, afvalverwerking, schoonmaak-, milieudiensten" },
    { value: "92000000", label: "Recreatieve, culturele en sportdiensten" },
    { value: "98000000", label: "Overige gemeenschaps-, sociale en persoonlijke diensten" },
];

// Group sectors by categories
const sectorCategories = [
    {
        name: "Producten & Grondstoffen",
        sectors: ["03000000", "09000000", "14000000", "15000000", "41000000"]
    },
    {
        name: "Elektronische & Technische Apparatuur",
        sectors: ["30000000", "31000000", "32000000", "38000000", "48000000"]
    },
    {
        name: "Industrieel & Transport",
        sectors: ["34000000", "42000000", "43000000", "60000000", "63000000"]
    },
    {
        name: "Bouw & Infrastructuur",
        sectors: ["44000000", "45000000"]
    },
    {
        name: "Diensten & Consultancy",
        sectors: ["71000000", "72000000", "73000000", "79000000"]
    },
    {
        name: "Publieke & Sociale Diensten",
        sectors: ["75000000", "80000000", "85000000", "90000000", "92000000"]
    },
    {
        name: "Overige",
        sectors: ["35000000", "37000000", "39000000", "50000000", "51000000", "55000000", "64000000", "65000000", "66000000", "70000000", "76000000", "77000000", "98000000"]
    }
];

interface SectorWithDetails {
    value: string;
    label: string;
    selected: boolean;
    customCpvCodes: string;
}

interface SectorItemProps {
    sector: SectorWithDetails;
    isExpanded: boolean;
    onToggle: (value: string) => void;
    onExpand: (value: string) => void;
    onCustomCodesChange: (value: string, codes: string) => void;
}

const SectorItem = ({ sector, isExpanded, onToggle, onExpand, onCustomCodesChange }: SectorItemProps) => {
    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div
                className={`px-4 py-3 ${sector.selected ? 'bg-astral-50 dark:bg-astral-900/20' : 'bg-white dark:bg-slate-900'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Checkbox
                            id={`sector-${sector.value}`}
                            checked={sector.selected}
                            onCheckedChange={() => onToggle(sector.value)}
                            className="mr-3"
                        />
                        <Label
                            htmlFor={`sector-${sector.value}`}
                            className="cursor-pointer font-medium text-gray-800 dark:text-gray-200 flex items-center"
                        >
                            <TagIcon size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                            {sector.label}
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                ({sector.value})
                            </span>
                        </Label>

                        {/* Hidden input to store the sector name for form submission */}
                        <input
                            type="hidden"
                            name={`sector-name-${sector.value}`}
                            value={sector.label}
                        />
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => onExpand(sector.value)}
                    >
                        {isExpanded ? (
                            <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                        )}
                        <span className="sr-only">
                            {isExpanded ? "Minder details" : "Meer details"}
                        </span>
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                    <div className="pl-7 space-y-3">
                        <div>
                            <label htmlFor={`custom-cpv-${sector.value}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Extra CPV-codes voor deze sector (optioneel)
                            </label>
                            <Input
                                id={`custom-cpv-${sector.value}`}
                                placeholder="45310000, 45320000, 45330000"
                                value={sector.customCpvCodes}
                                onChange={(e) => onCustomCodesChange(sector.value, e.target.value)}
                                className="text-sm"
                                name={`custom-cpv-${sector.value}`}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Voeg specifieke CPV-codes toe, gescheiden door komma's
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SectorsPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const { session } = useSession()
    const { toast } = useToast()
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sectors, setSectors] = useState<SectorWithDetails[]>([])
    const [expandedSector, setExpandedSector] = useState<string | null>(null)
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Producten & Grondstoffen") // Start with first category expanded

    // Fetch existing sectors data if available
    useEffect(() => {
        async function fetchSectorsData() {
            try {
                setLoading(true)
                const token = await getToken()
                const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()

                    // Initialize with all available sectors
                    const initialSectors = availableSectors.map(sector => {
                        // Check if sector exists in company data
                        const existingSector = data.interested_sectors?.find(
                            (s: any) => s.sector === sector.label || s.cpv_codes.includes(sector.value)
                        )

                        return {
                            value: sector.value,
                            label: sector.label,
                            selected: Boolean(existingSector),
                            customCpvCodes: existingSector
                                ? existingSector.cpv_codes.filter((code: string) => code !== sector.value).join(", ")
                                : ""
                        }
                    })

                    setSectors(initialSectors)
                } else if (response.status === 404) {
                    // Company not found, initialize with defaults
                    const initialSectors = availableSectors.map(sector => ({
                        value: sector.value,
                        label: sector.label,
                        selected: false,
                        customCpvCodes: ""
                    }))

                    setSectors(initialSectors)
                } else {
                    console.error("Error fetching company data", response.status)
                    toast({
                        title: "Fout",
                        description: "Er is een fout opgetreden bij het ophalen van sectoren.",
                        variant: "error",
                    })
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSectorsData()
    }, [getToken, toast])

    const toggleSector = (value: string) => {
        setSectors(sectors.map(sector =>
            sector.value === value
                ? { ...sector, selected: !sector.selected }
                : sector
        ))
    }

    const updateCustomCpvCodes = (value: string, customCodes: string) => {
        setSectors(sectors.map(sector =>
            sector.value === value
                ? { ...sector, customCpvCodes }
                : sector
        ))
    }

    const toggleExpandSector = (value: string) => {
        setExpandedSector(expandedSector === value ? null : value)
    }

    const toggleExpandCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category)
    }

    const selectAll = () => {
        setSectors(sectors.map(sector => ({ ...sector, selected: true })))
    }

    const clearAll = () => {
        setSectors(sectors.map(sector => ({ ...sector, selected: false, customCpvCodes: "" })))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormSubmitting(true)

        try {
            // Get form data from the form element
            const formData = new FormData(e.currentTarget)

            // Check if at least one sector is selected
            const selectedSectors = sectors.filter(s => s.selected)
            if (selectedSectors.length === 0) {
                toast({
                    title: "Ontbrekende informatie",
                    description: "Selecteer ten minste één sector.",
                    variant: "error",
                })
                setFormSubmitting(false)
                return
            }

            // Add checked state for selected sectors
            selectedSectors.forEach(sector => {
                formData.append(`sector-${sector.value}`, 'on')
            })

            // Call the server action
            const result = await updateSectorsInfo(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            toast({
                title: "Sectoren Opgeslagen",
                description: "Je sectoren zijn succesvol opgeslagen.",
                variant: "success",
            })

            // Reload session to get updated metadata
            if (session) {
                await session.reload()
            }

            router.push("/onboarding/regions")
        } catch (error) {
            console.error("Error saving sectors data:", error)
            toast({
                title: "Fout bij Opslaan",
                description: "Er is een fout opgetreden bij het opslaan van je sectoren.",
                variant: "error",
            })
        } finally {
            setFormSubmitting(false)
        }
    }

    // Filter sectors based on search query
    const filteredSectors = sectors.filter(sector =>
        sector.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.value.includes(searchQuery.toLowerCase())
    )

    // Count selected sectors
    const selectedSectorsCount = sectors.filter(s => s.selected).length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader loadingtext="Sectoren laden..." size={32} />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sectoren Selecteren
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
                            <span className="font-medium">{selectedSectorsCount}</span> van {sectors.length} sectoren geselecteerd
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAll}
                                className="text-xs"
                            >
                                Alles selecteren
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearAll}
                                className="text-xs"
                            >
                                Alles wissen
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sectors list */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 mb-6">
                        {searchQuery ? (
                            // Show search results
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm pb-2 border-b border-gray-100 dark:border-gray-800">
                                    Zoekresultaten
                                </h3>
                                {filteredSectors.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                        Geen sectoren gevonden voor "{searchQuery}"
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredSectors.map((sector) => (
                                            <SectorItem
                                                key={sector.value}
                                                sector={sector}
                                                isExpanded={expandedSector === sector.value}
                                                onToggle={toggleSector}
                                                onExpand={toggleExpandSector}
                                                onCustomCodesChange={updateCustomCpvCodes}
                                            />
                                        ))}
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
                                                    {sectors.filter(s => category.sectors.includes(s.value) && s.selected).length} geselecteerd
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
                                                {sectors
                                                    .filter(sector => category.sectors.includes(sector.value))
                                                    .map(sector => (
                                                        <SectorItem
                                                            key={sector.value}
                                                            sector={sector}
                                                            isExpanded={expandedSector === sector.value}
                                                            onToggle={toggleSector}
                                                            onExpand={toggleExpandSector}
                                                            onCustomCodesChange={updateCustomCpvCodes}
                                                        />
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="flex items-center gap-2"
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Opslaan...</span>
                                </>
                            ) : (
                                <>
                                    <span>Doorgaan</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
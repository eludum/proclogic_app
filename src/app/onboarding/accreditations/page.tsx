"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { cx } from "@/lib/utils"
import { useAuth, useSession } from "@clerk/nextjs"
import { ArrowRight, Award, InfoIcon, Loader2, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { updateAccreditationsInfo } from "../_actions/onboarding"

// Belgian construction accreditation categories
const availableAccreditations = [
    {
        code: "C",
        name: "Bouwwerken",
        levels: [1, 2, 3, 4, 5, 6, 7, 8],
        description: "Algemene bouwwerkzaamheden"
    },
    {
        code: "D",
        name: "Bouwkundig timmerwerk",
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        description: "Gespecialiseerde werkzaamheden in hout- en staalconstructies"
    },
    {
        code: "E",
        name: "Afwerking",
        levels: [1, 2, 3, 4, 5, 6, 7],
        description: "Afwerkingswerkzaamheden zoals pleisterwerk, vloer en wand"
    },
    {
        code: "F",
        name: "Schilderwerk",
        levels: [1, 2],
        description: "Schilder- en glaswerk"
    },
    {
        code: "G",
        name: "Installaties",
        levels: [1, 2, 3, 4, 5, 6],
        description: "Technische installaties (verwarming, ventilatie)"
    },
    {
        code: "P",
        name: "Elektriciteit",
        levels: [1, 2, 3],
        description: "Elektrische installaties"
    },
    {
        code: "S",
        name: "Wegenbouw",
        levels: [1, 2, 3, 4],
        description: "Wegenbouwkundige werkzaamheden"
    },
    {
        code: "W",
        name: "Grondwerken",
        levels: [1, 2, 3, 4, 5],
        description: "Grondwerken en funderingen"
    }
]

const AccreditationItem = ({
    accreditation,
    selected,
    levels = [],
    onToggle,
    onLevelsChange
}) => {
    const [showLevels, setShowLevels] = useState(false)
    const [activeLevels, setActiveLevels] = useState<number[]>(levels)

    // Update active levels when the props change
    useEffect(() => {
        setActiveLevels(levels)
    }, [levels])

    const toggleLevel = (level: number) => {
        let newLevels: number[]

        if (activeLevels.includes(level)) {
            newLevels = activeLevels.filter(l => l !== level)
        } else {
            newLevels = [...activeLevels, level].sort((a, b) => a - b)
        }

        setActiveLevels(newLevels)
        onLevelsChange(accreditation.code, newLevels)
    }

    const toggleShowLevels = () => {
        // If item is selected and not showing levels, show them
        if (selected && !showLevels) {
            setShowLevels(true)
        } else if (!selected) {
            // If item is deselected, hide levels
            setShowLevels(false)
        } else {
            // Toggle visibility
            setShowLevels(!showLevels)
        }
    }

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden mb-4">
            <div
                className={cx(
                    "flex items-center justify-between px-4 py-3 cursor-pointer",
                    selected ? "bg-astral-50 dark:bg-astral-900/20" : "bg-white dark:bg-slate-900"
                )}
            >
                <div className="flex items-center flex-1">
                    <Checkbox
                        id={`accreditation-${accreditation.code}`}
                        checked={selected}
                        onCheckedChange={() => {
                            onToggle(accreditation.code)
                            // When selected, automatically show levels
                            if (!selected) {
                                setShowLevels(true)
                            }
                        }}
                        name={`accreditation-${accreditation.code}`}
                        className="mr-3"
                    />
                    <div>
                        <Label
                            htmlFor={`accreditation-${accreditation.code}`}
                            className="cursor-pointer font-medium flex items-center"
                        >
                            <Award size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                            {accreditation.name} <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({accreditation.code})</span>
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {accreditation.description}
                        </p>
                    </div>
                </div>

                {/* Only show button if selected */}
                {selected && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleShowLevels()
                        }}
                        className="text-xs"
                    >
                        {showLevels ? "Verberg niveaus" : "Toon niveaus"}
                    </Button>
                )}
            </div>

            {/* Levels selection area */}
            {selected && showLevels && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                    <div className="mb-2 flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selecteer niveaus
                        </p>
                        <input
                            type="hidden"
                            name={`levels-${accreditation.code}`}
                            value={activeLevels.join(',')}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {accreditation.levels.map(level => (
                            <button
                                key={level}
                                type="button"
                                className={cx(
                                    "px-2 py-1 text-xs rounded-md font-medium transition-colors",
                                    activeLevels.includes(level)
                                        ? "bg-astral-500 text-white dark:bg-astral-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                )}
                                onClick={() => toggleLevel(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AccreditationsPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const { session } = useSession()
    const { toast } = useToast()
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAccreditations, setSelectedAccreditations] = useState<{ [key: string]: number[] }>({})
    const [skipAccreditations, setSkipAccreditations] = useState(false)

    // Fetch existing accreditation data if available
    useEffect(() => {
        async function fetchAccreditationsData() {
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

                    if (data.accreditations) {
                        // Initialize selected accreditations with data from API
                        setSelectedAccreditations(data.accreditations)
                    }
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAccreditationsData()
    }, [getToken, toast])

    const toggleAccreditation = (code: string) => {
        setSelectedAccreditations(prev => {
            const newState = { ...prev }

            if (newState[code]) {
                // Remove if already selected
                delete newState[code]
            } else {
                // Add with empty levels if not selected
                newState[code] = []
            }

            return newState
        })
    }

    const updateAccreditationLevels = (code: string, levels: number[]) => {
        setSelectedAccreditations(prev => ({
            ...prev,
            [code]: levels
        }))
    }

    const handleSkipAndContinue = async () => {
        // Submit empty form to mark the step as complete, but without any accreditations
        setFormSubmitting(true)

        try {
            const formData = new FormData()

            // Call the server action with empty data
            const result = await updateAccreditationsInfo(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            toast({
                title: "Stap overgeslagen",
                description: "Je kunt accreditaties later toevoegen indien nodig.",
                variant: "success",
            })

            // Reload session to get updated metadata
            if (session) {
                await session.reload()
            }

            router.push("/onboarding/complete")
        } catch (error) {
            console.error("Error skipping accreditations:", error)
            toast({
                title: "Fout",
                description: "Er is een fout opgetreden bij het opslaan.",
                variant: "error",
            })
        } finally {
            setFormSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormSubmitting(true)

        try {
            // Get form data from the form element
            const formData = new FormData(e.currentTarget as HTMLFormElement)

            // Call the server action
            const result = await updateAccreditationsInfo(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            toast({
                title: "Accreditaties Opgeslagen",
                description: "Je accreditaties zijn succesvol opgeslagen.",
                variant: "success",
            })

            // Reload session to get updated metadata
            if (session) {
                await session.reload()
            }

            router.push("/onboarding/complete")
        } catch (error) {
            console.error("Error saving accreditations data:", error)
            toast({
                title: "Fout bij Opslaan",
                description: "Er is een fout opgetreden bij het opslaan van je accreditaties.",
                variant: "error",
            })
        } finally {
            setFormSubmitting(false)
        }
    }

    // Filter accreditations based on search query
    const filteredAccreditations = availableAccreditations.filter(accreditation =>
        accreditation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        accreditation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        accreditation.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader loadingtext="Accreditaties laden..." size={32} />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Accreditaties
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Selecteer de accreditaties die je bedrijf heeft verkregen. Dit helpt ons bij het vinden van passende aanbestedingen.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                {/* Info box */}
                <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-4 rounded-md flex items-start gap-3">
                    <InfoIcon className="text-astral-600 dark:text-astral-300 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-medium text-astral-800 dark:text-astral-200 text-sm">
                            Optionele Stap
                        </h3>
                        <p className="text-sm text-astral-700 dark:text-astral-300 mt-1">
                            Deze stap is optioneel. Als je bedrijf geen specifieke accreditaties heeft, kun je deze stap overslaan.
                            Je kunt dit later altijd nog aanpassen via je bedrijfsprofiel.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 relative">
                        <Label htmlFor="search-accreditations" className="sr-only">Zoek accreditaties</Label>
                        <Input
                            id="search-accreditations"
                            type="search"
                            placeholder="Zoek accreditaties..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Beschikbare Accreditaties
                        </h3>

                        {filteredAccreditations.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Geen accreditaties gevonden voor "{searchQuery}"
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {filteredAccreditations.map(accreditation => (
                                    <AccreditationItem
                                        key={accreditation.code}
                                        accreditation={accreditation}
                                        selected={Boolean(selectedAccreditations[accreditation.code])}
                                        levels={selectedAccreditations[accreditation.code] || []}
                                        onToggle={toggleAccreditation}
                                        onLevelsChange={updateAccreditationLevels}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected accreditations summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Geselecteerde Accreditaties ({Object.keys(selectedAccreditations).length})
                        </h3>

                        {Object.keys(selectedAccreditations).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(selectedAccreditations).map(([code, levels]) => {
                                    const accreditation = availableAccreditations.find(a => a.code === code)
                                    return (
                                        <div
                                            key={code}
                                            className="flex items-center bg-astral-100 text-astral-800 dark:bg-astral-900/40 dark:text-astral-300 rounded-md py-1 px-2 text-xs"
                                        >
                                            <span>{accreditation?.name || code}</span>
                                            {levels.length > 0 && (
                                                <span className="ml-1">
                                                    (niveaus: {levels.join(', ')})
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="ml-2 text-astral-500 hover:text-astral-700 dark:text-astral-400 dark:hover:text-astral-200"
                                                onClick={() => toggleAccreditation(code)}
                                            >
                                                <TrashIcon size={12} />
                                                <span className="sr-only">Verwijderen</span>
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Geen accreditaties geselecteerd.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSkipAndContinue}
                            disabled={formSubmitting}
                        >
                            Overslaan
                        </Button>

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
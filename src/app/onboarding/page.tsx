"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { cx } from "@/lib/utils"
import { useAuth, useSession, useUser } from "@clerk/nextjs"
import {
    BarChart3,
    BuildingIcon,
    CheckCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Globe,
    InfoIcon,
    Loader2,
    MailIcon,
    MapPinIcon,
    PenSquareIcon,
    SearchIcon,
    Sparkles,
    TagIcon,
    Users,
    Wand,
    XCircle
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define all steps
const STEPS = {
    WELCOME: 'welcome',
    WEBSITE_PARSER: 'website_parser',
    COMPANY_INFO: 'company_info',
    SECTORS: 'sectors',
    REGIONS: 'regions',
    COMPLETE: 'complete'
}

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
]

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
]

// Available regions based on NUTS codes for Belgium
const availableRegions = [
    { value: "BE1", label: "Brussels Hoofdstedelijk Gewest" },
    { value: "BE10", label: "Région de Bruxelles-Capitale / Brussels Hoofdstedelijk Gewest" },
    { value: "BE2", label: "Vlaams Gewest" },
    { value: "BE21", label: "Prov. Antwerpen" },
    { value: "BE22", label: "Prov. Limburg (BE)" },
    { value: "BE23", label: "Prov. Oost-Vlaanderen" },
    { value: "BE24", label: "Prov. Vlaams-Brabant" },
    { value: "BE25", label: "Prov. West-Vlaanderen" },
    { value: "BE3", label: "Région wallonne" },
    { value: "BE31", label: "Prov. Brabant Wallon" },
    { value: "BE32", label: "Prov. Hainaut" },
    { value: "BE33", label: "Prov. Liège" },
    { value: "BE34", label: "Prov. Luxembourg (BE)" },
    { value: "BE35", label: "Prov. Namur" },
    { value: "BE", label: "België (Heel België)" },
]

// Group regions into categories
const regionCategories = [
    {
        name: "Landelijk",
        regions: ["BE"]
    },
    {
        name: "Gewesten",
        regions: ["BE1", "BE2", "BE3"]
    },
    {
        name: "Provincies in Vlaanderen",
        regions: ["BE21", "BE22", "BE23", "BE24", "BE25"]
    },
    {
        name: "Provincies in Wallonië",
        regions: ["BE31", "BE32", "BE33", "BE34", "BE35"]
    },
    {
        name: "Brussel",
        regions: ["BE10"]
    }
]

// Main onboarding component
export default function OnboardingPage() {
    const router = useRouter()
    const { user } = useUser()
    const { getToken } = useAuth()
    const { session } = useSession()
    const { toast } = useToast()

    // State variables
    const [currentStep, setCurrentStep] = useState(STEPS.WELCOME)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Company info state
    const [selectedOption, setSelectedOption] = useState<"ai" | "manual" | null>(null)
    const [websiteUrl, setWebsiteUrl] = useState("")
    const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null)
    const [isScraping, setIsScraping] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Producten & Grondstoffen")
    const [searchQuery, setSearchQuery] = useState("")
    const [regionsSearchQuery, setRegionsSearchQuery] = useState("")

    // Company data state
    const [companyData, setCompanyData] = useState({
        vat_number: "BE0000000000",
        name: "",
        emails: [""],
        summary_activities: "",
        number_of_employees: 1,
        max_publication_value: null as number | null,
        interested_sectors: [] as { sector: string, cpv_codes: string[] }[],
        operating_regions: [] as string[],
        activity_keywords: [] as string[]
    })

    // Basic URL validation
    useEffect(() => {
        if (!websiteUrl) {
            setIsUrlValid(null)
            return
        }

        try {
            // Add protocol if missing
            let urlToCheck = websiteUrl
            if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
                urlToCheck = 'https://' + urlToCheck
            }

            // Try to create URL object
            new URL(urlToCheck)
            setIsUrlValid(true)
        } catch (e) {
            setIsUrlValid(false)
        }
    }, [websiteUrl])

    // Initialize email with user email if available
    useEffect(() => {
        if (user?.emailAddresses && user.emailAddresses.length > 0) {
            const primaryEmail = user.emailAddresses[0].emailAddress
            setCompanyData(prev => ({
                ...prev,
                emails: [primaryEmail]
            }))
        }
    }, [user])

    // Functions to handle sectors
    const toggleSector = (sectorValue: string) => {
        setCompanyData(prev => {
            const sectorInfo = availableSectors.find(s => s.value === sectorValue)
            if (!sectorInfo) return prev

            const sectorExists = prev.interested_sectors.some(s => s.cpv_codes.includes(sectorValue))

            if (sectorExists) {
                // Remove sector
                return {
                    ...prev,
                    interested_sectors: prev.interested_sectors.filter(s => !s.cpv_codes.includes(sectorValue))
                }
            } else {
                // Add sector
                return {
                    ...prev,
                    interested_sectors: [
                        ...prev.interested_sectors,
                        { sector: sectorInfo.label, cpv_codes: [sectorValue] }
                    ]
                }
            }
        })
    }

    const toggleExpandCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category)
    }

    // Functions to handle regions
    const toggleRegion = (regionValue: string) => {
        setCompanyData(prev => {
            const regions = [...prev.operating_regions]
            if (regions.includes(regionValue)) {
                return {
                    ...prev,
                    operating_regions: regions.filter(r => r !== regionValue)
                }
            } else {
                return {
                    ...prev,
                    operating_regions: [...regions, regionValue]
                }
            }
        })
    }

    const selectAllRegions = () => {
        setCompanyData(prev => ({
            ...prev,
            operating_regions: availableRegions.map(r => r.value)
        }))
    }

    const clearAllRegions = () => {
        setCompanyData(prev => ({
            ...prev,
            operating_regions: []
        }))
    }

    const selectCategory = (category: string) => {
        const categoryToSelect = regionCategories.find(c => c.name === category)
        if (categoryToSelect) {
            setCompanyData(prev => {
                const newRegions = [...prev.operating_regions]
                categoryToSelect.regions.forEach(region => {
                    if (!newRegions.includes(region)) {
                        newRegions.push(region)
                    }
                })
                return {
                    ...prev,
                    operating_regions: newRegions
                }
            })
        }
    }

    // Update fields
    const handleEmailChange = (index: number, value: string) => {
        const updatedEmails = [...companyData.emails]
        updatedEmails[index] = value
        setCompanyData({ ...companyData, emails: updatedEmails })
    }

    const addEmailField = () => {
        setCompanyData({ ...companyData, emails: [...companyData.emails, ""] })
    }

    const removeEmailField = (index: number) => {
        if (companyData.emails.length > 1) {
            const updatedEmails = companyData.emails.filter((_, i) => i !== index)
            setCompanyData({ ...companyData, emails: updatedEmails })
        }
    }

    // Scrape website for company data
    const handleScrapeWebsite = async () => {
        if (!isUrlValid) return

        setIsScraping(true)
        try {
            const token = await getToken()
            const response = await fetch(`${siteConfig.api_base_url}/company/scrape-website`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    website_url: websiteUrl
                }),
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()

            // Update company data with scraped info
            setCompanyData(prev => ({
                ...prev,
                name: data.name || prev.name,
                vat_number: data.vat_number || prev.vat_number,
                summary_activities: data.summary_activities || prev.summary_activities,
                number_of_employees: data.employee_count || prev.number_of_employees,
                operating_regions: data.operating_regions || prev.operating_regions,
                activity_keywords: data.activity_keywords || prev.activity_keywords
            }))

            // Add sectors if available
            if (data.interested_sectors && data.interested_sectors.length > 0) {
                setCompanyData(prev => ({
                    ...prev,
                    interested_sectors: data.interested_sectors
                }))
            }

            toast({
                title: "Website Geanalyseerd",
                description: "We hebben informatie van je website verzameld.",
                variant: "success",
            })

            // Move to next step
            setCurrentStep(STEPS.COMPANY_INFO)
        } catch (error) {
            console.error("Error scraping website:", error)
            toast({
                title: "Fout bij Analyse",
                description: "Er is een fout opgetreden bij het analyseren van de website.",
                variant: "error",
            })
        } finally {
            setIsScraping(false)
        }
    }

    // Complete onboarding by creating company
    const completeOnboarding = async () => {
        setIsSubmitting(true)

        try {
            const token = await getToken()

            // Create company with all data
            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(companyData),
            })

            // If company already exists, try update instead
            if (response.status === 400) {
                const updateResponse = await fetch(`${siteConfig.api_base_url}/company/`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(companyData),
                })

                if (!updateResponse.ok) {
                    throw new Error(`API error during update: ${updateResponse.status}`)
                }
            } else if (!response.ok) {
                throw new Error(`API error during creation: ${response.status}`)
            }

            // Update Clerk metadata to mark onboarding as complete
            if (session) {
                await fetch('/api/complete-onboarding', {
                    method: 'POST',
                })

                // Reload session to get updated metadata
                await session.reload()
            }

            toast({
                title: "Onboarding Voltooid",
                description: "Je bedrijfsprofiel is succesvol aangemaakt.",
                variant: "success",
            })

            // Go to dashboard
            router.push("/dashboard")
        } catch (error) {
            console.error("Error completing onboarding:", error)
            toast({
                title: "Fout bij Voltooien",
                description: "Er is een fout opgetreden bij het voltooien van onboarding.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Navigation handlers
    const goToNextStep = () => {
        if (currentStep === STEPS.WELCOME) {
            if (selectedOption === "ai") {
                setCurrentStep(STEPS.WEBSITE_PARSER)
            } else {
                setCurrentStep(STEPS.COMPANY_INFO)
            }
        } else if (currentStep === STEPS.WEBSITE_PARSER) {
            setCurrentStep(STEPS.COMPANY_INFO)
        } else if (currentStep === STEPS.COMPANY_INFO) {
            setCurrentStep(STEPS.SECTORS)
        } else if (currentStep === STEPS.SECTORS) {
            setCurrentStep(STEPS.REGIONS)
        } else if (currentStep === STEPS.REGIONS) {
            setCurrentStep(STEPS.COMPLETE)
        } else if (currentStep === STEPS.COMPLETE) {
            completeOnboarding()
        }
    }

    const goToPreviousStep = () => {
        if (currentStep === STEPS.WEBSITE_PARSER) {
            setCurrentStep(STEPS.WELCOME)
        } else if (currentStep === STEPS.COMPANY_INFO) {
            if (selectedOption === "ai") {
                setCurrentStep(STEPS.WEBSITE_PARSER)
            } else {
                setCurrentStep(STEPS.WELCOME)
            }
        } else if (currentStep === STEPS.SECTORS) {
            setCurrentStep(STEPS.COMPANY_INFO)
        } else if (currentStep === STEPS.REGIONS) {
            setCurrentStep(STEPS.SECTORS)
        } else if (currentStep === STEPS.COMPLETE) {
            setCurrentStep(STEPS.REGIONS)
        }
    }

    // Validation before going to next step
    const canProceedToNext = () => {
        if (currentStep === STEPS.WELCOME) {
            return selectedOption !== null
        } else if (currentStep === STEPS.WEBSITE_PARSER) {
            // Can always proceed (either with or without scraped data)
            return true
        } else if (currentStep === STEPS.COMPANY_INFO) {
            return companyData.name.trim() !== "" &&
                companyData.summary_activities.trim() !== "" &&
                companyData.emails.length > 0 &&
                companyData.emails[0].trim() !== ""
        } else if (currentStep === STEPS.SECTORS) {
            return companyData.interested_sectors.length > 0
        } else if (currentStep === STEPS.REGIONS) {
            return companyData.operating_regions.length > 0
        } else if (currentStep === STEPS.COMPLETE) {
            return true
        }
        return false
    }

    // Filter sectors based on search query
    const filteredSectors = availableSectors.filter(sector =>
        sector.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.value.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter regions based on search query
    const filteredRegions = availableRegions.filter(region =>
        region.label.toLowerCase().includes(regionsSearchQuery.toLowerCase()) ||
        region.value.toLowerCase().includes(regionsSearchQuery.toLowerCase())
    )

    // Render the appropriate step
    const renderStep = () => {
        switch (currentStep) {
            case STEPS.WELCOME:
                return (
                    <div className="flex flex-col items-center space-y-8 animate-fadeIn">
                        {/* Logo and welcome message */}
                        <div className="text-center mb-4">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/logo.svg"
                                    alt="ProcLogic Logo"
                                    width={180}
                                    height={40}
                                    className="dark:invert"
                                />
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                Welkom bij ProcLogic
                            </h1>

                            <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                We helpen je de beste aanbestedingen te vinden die passen bij jouw bedrijf.
                                Laten we even je profiel instellen.
                            </p>

                            {user?.firstName && (
                                <p className="mt-2 text-lg font-medium text-astral-600 dark:text-astral-400">
                                    Hallo {user.firstName}!
                                </p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Card
                                className={`p-6 border-2 transition-all cursor-pointer hover:border-astral-300 dark:hover:border-astral-600 hover:shadow-md ${selectedOption === "ai"
                                    ? "border-astral-500 dark:border-astral-500 bg-astral-50 dark:bg-astral-900/20"
                                    : "border-gray-200 dark:border-gray-800"
                                    }`}
                                onClick={() => setSelectedOption("ai")}
                            >
                                <div className="flex flex-col items-center text-center h-full">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-astral-100 dark:bg-astral-900/40 text-astral-600 dark:text-astral-300 mb-4">
                                        <Wand className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        AI Magic
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                                        ProcLogic analyseert je website en vult automatisch zoveel mogelijk informatie in.
                                    </p>
                                </div>
                            </Card>

                            <Card
                                className={`p-6 border-2 transition-all cursor-pointer hover:border-astral-300 dark:hover:border-astral-600 hover:shadow-md ${selectedOption === "manual"
                                    ? "border-astral-500 dark:border-astral-500 bg-astral-50 dark:bg-astral-900/20"
                                    : "border-gray-200 dark:border-gray-800"
                                    }`}
                                onClick={() => setSelectedOption("manual")}
                            >
                                <div className="flex flex-col items-center text-center h-full">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 mb-4">
                                        <PenSquareIcon className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Handmatige invoer
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                                        Vul handmatig alle informatie in voor volledige controle over je bedrijfsprofiel.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                )

            case STEPS.WEBSITE_PARSER:
                return (
                    <div className="flex flex-col space-y-6 animate-fadeIn">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Website Analyse
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                Voer je website URL in, dan analyseren wij je website en vullen automatisch zoveel mogelijk informatie in.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                            <div className="mb-6">
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Website URL
                                </label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <Input
                                            id="website"
                                            type="url"
                                            className={`pl-10 ${isUrlValid === false ? "border-red-300 dark:border-red-700" : ""
                                                }`}
                                            placeholder="www.jouwbedrijf.be"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                            disabled={isScraping}
                                        />
                                        {isUrlValid !== null && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                {isUrlValid ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleScrapeWebsite}
                                        disabled={isScraping || !isUrlValid}
                                        className="w-28"
                                    >
                                        {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyseren"}
                                    </Button>
                                </div>
                                {isUrlValid === false && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        Voer een geldige website URL in.
                                    </p>
                                )}
                            </div>

                            {isScraping && (
                                <div className="text-center py-8">
                                    <Loader loadingtext="Website wordt geanalyseerd..." size={32} />
                                </div>
                            )}

                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                <p>Je kunt ook doorgaan zonder website analyse door op de knop 'Overslaan' te klikken.</p>
                            </div>
                        </div>
                    </div>
                )

            case STEPS.COMPANY_INFO:
                return (
                    <div className="flex flex-col space-y-6 animate-fadeIn">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Bedrijfsinformatie
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                Vul je bedrijfsgegevens in om de match met aanbestedingen te optimaliseren.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                            {/* Company Name */}
                            <div className="mb-6">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bedrijfsnaam <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <BuildingIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        className="pl-10"
                                        placeholder="Bedrijfsnaam"
                                        value={companyData.name}
                                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* VAT Number */}
                            <div className="mb-6">
                                <label htmlFor="vat_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    BTW-nummer <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        id="vat_number"
                                        type="text"
                                        placeholder="BE0123456789"
                                        value={companyData.vat_number}
                                        onChange={(e) => setCompanyData({ ...companyData, vat_number: e.target.value })}
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Voer je BTW-nummer in, beginnend met BE gevolgd door 10 cijfers.
                                </p>
                            </div>

                            {/* Company Activities */}
                            <div className="mb-6">
                                <label htmlFor="summary_activities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Omschrijving Bedrijfsactiviteiten <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Textarea
                                        id="summary_activities"
                                        className="min-h-32"
                                        placeholder="Beschrijf de kernactiviteiten van je bedrijf..."
                                        value={companyData.summary_activities}
                                        onChange={(e) => setCompanyData({ ...companyData, summary_activities: e.target.value })}
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Deze beschrijving wordt gebruikt voor het matchen van aanbestedingen.
                                </p>
                            </div>

                            {/* Number of Employees */}
                            <div className="mb-6">
                                <label htmlFor="number_of_employees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Aantal Medewerkers <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <Input
                                        id="number_of_employees"
                                        type="number"
                                        className="pl-10"
                                        placeholder="1"
                                        value={companyData.number_of_employees}
                                        onChange={(e) => setCompanyData({ ...companyData, number_of_employees: parseInt(e.target.value) || 1 })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Addresses */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    E-mailadressen <span className="text-red-500">*</span>
                                </label>

                                {companyData.emails.map((email, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <MailIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <Input
                                                type="email"
                                                className="pl-10"
                                                placeholder="email@bedrijf.be"
                                                value={email}
                                                onChange={(e) => handleEmailChange(index, e.target.value)}
                                                required={index === 0}
                                            />
                                        </div>

                                        {companyData.emails.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="ml-2 px-3"
                                                onClick={() => removeEmailField(index)}
                                            >
                                                <span className="sr-only">Verwijderen</span>
                                                <span aria-hidden="true">×</span>
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-2 text-sm"
                                    onClick={addEmailField}
                                >
                                    + E-mailadres toevoegen
                                </Button>
                            </div>
                        </div>
                    </div>
                )

            case STEPS.SECTORS:
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
                                                Geen sectoren gevonden voor "{searchQuery}"
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

            case STEPS.REGIONS:
                return (
                    <div className="flex flex-col space-y-6 animate-fadeIn">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Regio's Selecteren
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                Selecteer de regio's waar je bedrijf actief is voor relevante aanbestedingen.
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
                                        De geselecteerde regio's zijn gebaseerd op NUTS-codes, een hiërarchisch systeem voor het indelen van economische gebieden in Europa.
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
                                        <span className="font-medium">{companyData.operating_regions.length}</span> van {availableRegions.length} regio's geselecteerd
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllRegions}
                                            className="text-xs"
                                        >
                                            Alles selecteren
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
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
                                                Geen regio's gevonden voor "{regionsSearchQuery}"
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
                                                        size="sm"
                                                        className="h-8 text-xs text-astral-600 dark:text-astral-400"
                                                        onClick={() => selectCategory(category.name)}
                                                    >
                                                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
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
                                    Geselecteerde regio's ({companyData.operating_regions.length})
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
                                        Geen regio's geselecteerd. Selecteer minstens één regio.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )

            case STEPS.COMPLETE:
                return (
                    <div className="flex flex-col items-center text-center space-y-6 animate-fadeIn">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Onboarding Voltooid!
                        </h1>

                        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-lg">
                            Gefeliciteerd! {companyData.name} is nu klaar om van ProcLogic gebruik te maken.
                        </p>

                        <div className="w-full max-w-lg mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                                <Sparkles className="text-astral-500 dark:text-astral-400 mb-3" size={24} />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Slimme aanbevelingen
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Wij zoeken automatisch naar aanbestedingen die passen bij jouw bedrijfsprofiel.
                                </p>
                            </div>

                            <div className="flex flex-col items-center p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                                <SearchIcon className="text-astral-500 dark:text-astral-400 mb-3" size={24} />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Geavanceerd zoeken
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Vind precies wat je zoekt met onze uitgebreide zoekfunctionaliteit.
                                </p>
                            </div>

                            <div className="flex flex-col items-center p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                                <Clock className="text-astral-500 dark:text-astral-400 mb-3" size={24} />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Deadline reminders
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Mis nooit meer een deadline met automatische herinneringen.
                                </p>
                            </div>

                            <div className="flex flex-col items-center p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
                                <BarChart3 className="text-astral-500 dark:text-astral-400 mb-3" size={24} />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Inzichtelijk dashboard
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Houd al je aanbestedingen bij in een duidelijk dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 relative h-40 w-full max-w-lg">
                            <Image
                                src="/dash-preview.png"
                                alt="Dashboard Preview"
                                fill
                                className="object-contain rounded-lg border border-gray-200 dark:border-gray-800 shadow-md"
                            />
                        </div>
                    </div>
                )
        }
    }
}
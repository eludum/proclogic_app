"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth } from "@clerk/nextjs"
import { ArrowRight, CheckIcon, ChevronDown, ChevronUp, Globe, Loader2, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface WebsiteScrapingResult {
    name?: string;
    summary_activities?: string;
    interested_sectors?: { sector: string; cpv_codes: string[] }[];
    employee_count?: number;
    operating_regions?: string[];
    activity_keywords?: string[];
}

export default function WebsiteParserPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const { toast } = useToast()
    const [websiteUrl, setWebsiteUrl] = useState("")
    const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null)
    const [isScraping, setIsScraping] = useState(false)
    const [isCreatingCompany, setIsCreatingCompany] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [scrapingResult, setScrapingResult] = useState<WebsiteScrapingResult | null>(null)

    // Editable form data (initialized from scraping result)
    const [editFormData, setEditFormData] = useState<{
        name: string;
        summary_activities: string;
        employee_count: number;
    }>({
        name: "",
        summary_activities: "",
        employee_count: 1
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

    // Update form data when scraping result changes
    useEffect(() => {
        if (scrapingResult) {
            setEditFormData({
                name: scrapingResult.name || "",
                summary_activities: scrapingResult.summary_activities || "",
                employee_count: scrapingResult.employee_count || 1
            })
        }
    }, [scrapingResult])

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
            setScrapingResult(data)

            toast({
                title: "Website Geanalyseerd",
                description: "We hebben informatie van je website verzameld.",
                variant: "success",
            })
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

    const handleCreateCompany = async () => {
        if (!scrapingResult && !editFormData) return

        setIsCreatingCompany(true)
        try {
            const token = await getToken()

            // First get the user's VAT from Clerk or use a placeholder
            let vatNumber = "BE0123456789" // Placeholder
            const userDataResponse = await fetch(`${siteConfig.api_base_url}/user/profile`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }).catch(() => null)

            if (userDataResponse?.ok) {
                const userData = await userDataResponse.json()
                vatNumber = userData.vat_number || vatNumber
            }

            // Use either edited data or original scraping result
            const finalData = {
                vat_number: vatNumber,
                name: editFormData.name || "Mijn Bedrijf",
                emails: [scrapingResult?.activity_keywords?.[0] || "info@example.com"],
                subscription: "premium",
                summary_activities: editFormData.summary_activities || "",
                interested_sectors: scrapingResult?.interested_sectors || [],
                operating_regions: scrapingResult?.operating_regions || [],
                activity_keywords: scrapingResult?.activity_keywords || [],
                max_publication_value: null,
                number_of_employees: editFormData.employee_count || 1,
                accreditations: null
            }

            // Create company with data
            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalData),
            })

            if (!response.ok) {
                // If we get a 400, it might be that the company already exists, try an update instead
                if (response.status === 400) {
                    const updateResponse = await fetch(`${siteConfig.api_base_url}/company/`, {
                        method: "PATCH",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(finalData),
                    })

                    if (!updateResponse.ok) {
                        throw new Error(`API error during update: ${updateResponse.status}`)
                    }
                } else {
                    throw new Error(`API error during creation: ${response.status}`)
                }
            }

            toast({
                title: "Bedrijf Aangemaakt",
                description: "Je bedrijfsprofiel is succesvol aangemaakt.",
                variant: "success",
            })

            // Proceed to sectors page
            router.push("/onboarding/sectors")

        } catch (error) {
            console.error("Error creating company:", error)
            toast({
                title: "Fout bij Aanmaken",
                description: "Er is een fout opgetreden bij het aanmaken van je bedrijfsprofiel.",
                variant: "error",
            })
            // Redirect to manual entry if AI fails
            router.push("/onboarding/company-info")
        } finally {
            setIsCreatingCompany(false)
        }
    }

    const handleEditToggle = () => {
        setShowEditForm(!showEditForm)
    }

    const handleManualEntry = () => {
        router.push("/onboarding/company-info")
    }

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
                                disabled={isScraping || isCreatingCompany}
                            />
                            {isUrlValid !== null && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    {isUrlValid ? (
                                        <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                                    ) : (
                                        <XIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleScrapeWebsite}
                            disabled={isScraping || !isUrlValid || isCreatingCompany}
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

                {scrapingResult && !isScraping && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                Gevonden informatie
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditToggle}
                                className="flex items-center gap-1"
                            >
                                {showEditForm ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        <span>Verberg bewerken</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        <span>Bewerken</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Display view (non-editable) */}
                        {!showEditForm && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedrijfsnaam</h3>
                                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                                        {editFormData.name || "Niet gevonden"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activiteiten</h3>
                                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                                        {editFormData.summary_activities || "Niet gevonden"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Aantal Medewerkers</h3>
                                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                                        {editFormData.employee_count || 1}
                                    </p>
                                </div>

                                {scrapingResult.interested_sectors?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sectoren</h3>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {scrapingResult.interested_sectors.map((sector, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-astral-100 text-astral-800 dark:bg-astral-900/40 dark:text-astral-300"
                                                >
                                                    {sector.sector}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {scrapingResult.operating_regions?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Regio's</h3>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {scrapingResult.operating_regions.map((region, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                >
                                                    {region}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edit form (editable) */}
                        {showEditForm && (
                            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bedrijfsnaam
                                    </label>
                                    <Input
                                        id="name"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        placeholder="Bedrijfsnaam"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="summary_activities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Activiteiten
                                    </label>
                                    <Textarea
                                        id="summary_activities"
                                        value={editFormData.summary_activities}
                                        onChange={(e) => setEditFormData({ ...editFormData, summary_activities: e.target.value })}
                                        placeholder="Beschrijf de activiteiten van uw bedrijf..."
                                        rows={5}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Aantal Medewerkers
                                    </label>
                                    <Input
                                        id="employee_count"
                                        type="number"
                                        min="1"
                                        value={editFormData.employee_count}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            employee_count: parseInt(e.target.value) || 1
                                        })}
                                    />
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Sectoren en regio's kunnen op de volgende pagina's worden aangepast.
                                </p>
                            </div>
                        )}

                        <div className="mt-8 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={handleManualEntry}
                                disabled={isCreatingCompany}
                            >
                                Handmatig invullen
                            </Button>

                            <Button
                                onClick={handleCreateCompany}
                                disabled={isCreatingCompany}
                                className="flex items-center gap-2"
                            >
                                {isCreatingCompany ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Verwerken...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Doorgaan met deze informatie</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
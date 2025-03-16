"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth } from "@clerk/nextjs"
import { ArrowRight, CheckIcon, Globe, Loader2, XIcon } from "lucide-react"
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
    const [scrapingResult, setScrapingResult] = useState<WebsiteScrapingResult | null>(null)

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
        if (!scrapingResult) return

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

            // Create company with scraped data
            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vat_number: vatNumber,
                    name: scrapingResult.name || "Mijn Bedrijf",
                    emails: [scrapingResult.activity_keywords?.[0] || "info@example.com"],
                    subscription: "premium",
                    summary_activities: scrapingResult.summary_activities || "",
                    interested_sectors: scrapingResult.interested_sectors || [],
                    operating_regions: scrapingResult.operating_regions || [],
                    activity_keywords: scrapingResult.activity_keywords || [],
                    max_publication_value: null,
                    accreditations: null
                }),
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
                        body: JSON.stringify({
                            vat_number: vatNumber,
                            name: scrapingResult.name || "Mijn Bedrijf",
                            summary_activities: scrapingResult.summary_activities || "",
                            interested_sectors: scrapingResult.interested_sectors || [],
                            operating_regions: scrapingResult.operating_regions || [],
                            activity_keywords: scrapingResult.activity_keywords || [],
                        }),
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

            // Determine next step based on what data was found
            if (!scrapingResult.interested_sectors?.length) {
                router.push("/onboarding/sectors")
            } else if (!scrapingResult.operating_regions?.length) {
                router.push("/onboarding/regions")
            } else {
                router.push("/onboarding/complete")
            }

        } catch (error) {
            console.error("Error creating company:", error)
            toast({
                title: "Fout bij Aanmaken",
                description: "Er is een fout opgetreden bij het aanmaken van je bedrijfsprofiel.",
                variant: "error",
            })
            router.push("/onboarding/company-info")
        } finally {
            setIsCreatingCompany(false)
        }
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
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Gevonden informatie
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedrijfsnaam</h3>
                                <p className="mt-1 text-base text-gray-900 dark:text-white">
                                    {scrapingResult.name || "Niet gevonden"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activiteiten</h3>
                                <p className="mt-1 text-base text-gray-900 dark:text-white">
                                    {scrapingResult.summary_activities || "Niet gevonden"}
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

                        <div className="mt-8 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/onboarding/company-info")}
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
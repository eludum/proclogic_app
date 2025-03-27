"use client"
import { siteConfig } from "@/app/siteConfig"
import { useToast } from "@/lib/useToast"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Import components
import OnboardingContainer from "./_components/OnboardingContainer"
import StepCompanyInfo from "./_components/StepCompanyInfo"
import StepComplete from "./_components/StepComplete"
import StepRegions from "./_components/StepRegions"
import StepSectors from "./_components/StepSectors"
import StepWebsiteParser from "./_components/StepWebsiteParser"
import StepWelcome from "./_components/StepWelcome"

// Import constants
import { CompanyData, STEPS } from "./_components/constants"

// Main onboarding component
export default function OnboardingPage() {
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()
    const { toast } = useToast()

    // State variables
    const [currentStep, setCurrentStep] = useState(STEPS.WELCOME)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Company info state
    const [selectedOption, setSelectedOption] = useState<"ai" | "manual" | null>(null)
    const [websiteUrl, setWebsiteUrl] = useState("")
    const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null)
    const [isScraping, setIsScraping] = useState(false)
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Producten & Grondstoffen")
    const [searchQuery, setSearchQuery] = useState("")
    const [regionsSearchQuery, setRegionsSearchQuery] = useState("")

    // Company data state
    const [companyData, setCompanyData] = useState<CompanyData>({
        vat_number: "",
        name: "",
        emails: [user?.primaryEmailAddress?.emailAddress || ""],
        summary_activities: "",
        number_of_employees: 1,
        max_publication_value: null,
        interested_sectors: [],
        operating_regions: [],
        activity_keywords: []
    })

    useEffect(() => {
        // Reset validation state if field is empty
        if (!websiteUrl || websiteUrl.trim() === "") {
            setIsUrlValid(null)
            return
        }

        try {
            // Trim the URL first
            const trimmedUrl = websiteUrl.trim()

            // Validate URL format using a regex pattern that requires a domain and TLD
            const urlPattern = /^(https?:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i;
            // This pattern accepts: domain.com, www.domain.com, http://domain.com, https://domain.com

            // If input doesn't match the pattern, it's not valid
            if (!urlPattern.test(trimmedUrl)) {
                setIsUrlValid(false)
                return
            }

            // Add protocol if missing
            let urlToCheck = trimmedUrl
            if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
                urlToCheck = 'https://' + urlToCheck
            }

            // Try to create URL object for final validation
            new URL(urlToCheck)

            // If we got here, URL is valid
            setIsUrlValid(true)
        } catch (e) {
            // Any errors mean invalid URL
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
            // Find the sector from the availableSectors array to get the proper label
            const availableSector = availableSectors.find((s: { value: string }) => s.value === sectorValue)
            if (!availableSector) return prev

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
                        { sector: availableSector.label, cpv_codes: [sectorValue] }
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
            operating_regions: ["BE", "BE1", "BE2", "BE3", "BE10", "BE21", "BE22", "BE23", "BE24", "BE25",
                "BE31", "BE32", "BE33", "BE34", "BE35"]
        }))
    }

    const clearAllRegions = () => {
        setCompanyData(prev => ({
            ...prev,
            operating_regions: []
        }))
    }

    const selectCategory = (category: string) => {
        if (category === "Landelijk") {
            setCompanyData(prev => ({
                ...prev,
                operating_regions: [...prev.operating_regions, "BE"]
            }))
        } else if (category === "Gewesten") {
            setCompanyData(prev => {
                const newRegions = [...prev.operating_regions]
                    ;["BE1", "BE2", "BE3"].forEach(region => {
                        if (!newRegions.includes(region)) {
                            newRegions.push(region)
                        }
                    })
                return { ...prev, operating_regions: newRegions }
            })
        } else if (category === "Provincies in Vlaanderen") {
            setCompanyData(prev => {
                const newRegions = [...prev.operating_regions]
                    ;["BE21", "BE22", "BE23", "BE24", "BE25"].forEach(region => {
                        if (!newRegions.includes(region)) {
                            newRegions.push(region)
                        }
                    })
                return { ...prev, operating_regions: newRegions }
            })
        } else if (category === "Provincies in Wallonië") {
            setCompanyData(prev => {
                const newRegions = [...prev.operating_regions]
                    ;["BE31", "BE32", "BE33", "BE34", "BE35"].forEach(region => {
                        if (!newRegions.includes(region)) {
                            newRegions.push(region)
                        }
                    })
                return { ...prev, operating_regions: newRegions }
            })
        } else if (category === "Brussel") {
            setCompanyData(prev => ({
                ...prev,
                operating_regions: [...prev.operating_regions, "BE10"]
            }))
        }
    }

    // Scrape website for company data
    const handleScrapeWebsite = async () => {
        if (!isUrlValid) return

        // Normalize URL before sending to API
        let normalizedUrl = websiteUrl.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

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
                    website_url: normalizedUrl
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

            // Add sectors if available - ensure they match available sectors
            if (data.sectors && data.sectors.length > 0) {
                const validSectors = data.sectors
                    .filter((sector: { confidence: number }) => sector.confidence > 0.5)
                    .map((sector: { sector: any }) => {
                        // Find matching sector from availableSectors
                        const matchingSector = availableSectors.find(
                            (s: { label: any; value: any }) => s.label === sector.sector || s.value === sector.sector
                        )
                        if (matchingSector) {
                            return {
                                sector: matchingSector.label,
                                cpv_codes: [matchingSector.value]
                            }
                        }
                        return null
                    })
                    .filter((s: null) => s !== null)

                setCompanyData(prev => ({
                    ...prev,
                    interested_sectors: validSectors
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

            await fetch(`/api/onboarding/complete`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })

            // Create properly formatted company payload that matches backend schema
            const companyPayload = {
                vat_number: companyData.vat_number,
                name: companyData.name,
                emails: companyData.emails,
                subscription: "starter", // Default value TODO get from clerk
                number_of_employees: companyData.number_of_employees,
                summary_activities: companyData.summary_activities,
                max_publication_value: companyData.max_publication_value,
                activity_keywords: companyData.activity_keywords,
                operating_regions: companyData.operating_regions,
                interested_sectors: companyData.interested_sectors
            }

            // Create company with all data
            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(companyPayload),
            })

            // If company already exists, try update instead
            if (response.status === 400) {
                const updateResponse = await fetch(`${siteConfig.api_base_url}/company/`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(companyPayload),
                })

                if (!updateResponse.ok) {
                    throw new Error(`API error during update: ${updateResponse.status}`)
                }
            } else if (!response.ok) {
                throw new Error(`API error during creation: ${response.status}`)
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
    const goToNextStep = async () => {
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
            // Create the company when moving from REGIONS to COMPLETE
            setCurrentStep(STEPS.COMPLETE)
        } else if (currentStep === STEPS.COMPLETE) {
            setIsSubmitting(true)
            try {
                await completeOnboarding()
            } catch (error) {
                console.error("Error creating company:", error)
                toast({
                    title: "Fout bij Voltooien",
                    description: "Er is een fout opgetreden bij het aanmaken van je bedrijfsprofiel.",
                    variant: "error",
                })
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const goToPreviousStep = () => {
        if (currentStep === STEPS.WEBSITE_PARSER) {
            setCurrentStep(STEPS.WELCOME)
        } else if (currentStep === STEPS.COMPANY_INFO) {
            // If we came from website parser, go back there if AI option was selected
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

    // Import the constants here to ensure proper type matching
    const { availableSectors } = require("./_components/constants")

    // Render the components inside the container
    return (
        <OnboardingContainer
            currentStep={currentStep}
            canProceedToNext={canProceedToNext()}
            isSubmitting={isSubmitting}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
        >
            {currentStep === STEPS.WELCOME && (
                <StepWelcome
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    user_first_name={user?.firstName || ""}
                />
            )}

            {currentStep === STEPS.WEBSITE_PARSER && (
                <StepWebsiteParser
                    websiteUrl={websiteUrl}
                    setWebsiteUrl={setWebsiteUrl}
                    isUrlValid={isUrlValid}
                    isScraping={isScraping}
                    handleScrapeWebsite={handleScrapeWebsite}
                />
            )}

            {currentStep === STEPS.COMPANY_INFO && (
                <StepCompanyInfo
                    companyData={companyData}
                    setCompanyData={setCompanyData}
                />
            )}

            {currentStep === STEPS.SECTORS && (
                <StepSectors
                    companyData={companyData}
                    toggleSector={toggleSector}
                    expandedCategory={expandedCategory}
                    toggleExpandCategory={toggleExpandCategory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            )}

            {currentStep === STEPS.REGIONS && (
                <StepRegions
                    companyData={companyData}
                    toggleRegion={toggleRegion}
                    selectAllRegions={selectAllRegions}
                    clearAllRegions={clearAllRegions}
                    selectCategory={selectCategory}
                    regionsSearchQuery={regionsSearchQuery}
                    setRegionsSearchQuery={setRegionsSearchQuery}
                />
            )}

            {currentStep === STEPS.COMPLETE && (
                <StepComplete
                    companyName={companyData.name}
                />
            )}
        </OnboardingContainer>
    )
}
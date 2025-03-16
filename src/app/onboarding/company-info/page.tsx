// src/app/onboarding/company-info/page.tsx
"use client"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { Loader } from "@/components/ui/PageLoad"
import { useToast } from "@/lib/useToast"
import { useAuth } from "@clerk/nextjs"
import { ArrowRight, BuildingIcon, EuroIcon, Loader2, MailIcon, TextIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface CompanyFormData {
    vat_number: string;
    name: string;
    emails: string[];
    summary_activities: string;
    max_publication_value: number | null;
}

export default function CompanyInfoPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const { toast } = useToast()
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [formData, setFormData] = useState<CompanyFormData>({
        vat_number: "BE0000000000", // Will be replaced if available
        name: "",
        emails: [""],
        summary_activities: "",
        max_publication_value: null,
    })
    const [maxValueInput, setMaxValueInput] = useState("")
    const [loading, setLoading] = useState(true)
    const [existingCompany, setExistingCompany] = useState(false)

    // Fetch existing company data if available
    useEffect(() => {
        async function fetchCompanyData() {
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
                    setExistingCompany(true)

                    // Update form with existing data
                    setFormData({
                        vat_number: data.vat_number || "BE0000000000",
                        name: data.name || "",
                        emails: data.emails && data.emails.length > 0 ? data.emails : [""],
                        summary_activities: data.summary_activities || "",
                        max_publication_value: data.max_publication_value,
                    })

                    if (data.max_publication_value) {
                        setMaxValueInput(data.max_publication_value.toString())
                    }
                } else if (response.status !== 404) {
                    // Only show error if it's not a 404 (company not found is expected)
                    console.error("Error fetching company data", response.status)
                    toast({
                        title: "Fout",
                        description: "Er is een fout opgetreden bij het ophalen van bedrijfsinformatie.",
                        variant: "error",
                    })
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCompanyData()
    }, [getToken, toast])

    const handleEmailChange = (index: number, value: string) => {
        const updatedEmails = [...formData.emails]
        updatedEmails[index] = value
        setFormData({ ...formData, emails: updatedEmails })
    }

    const addEmailField = () => {
        setFormData({ ...formData, emails: [...formData.emails, ""] })
    }

    const removeEmailField = (index: number) => {
        if (formData.emails.length > 1) {
            const updatedEmails = formData.emails.filter((_, i) => i !== index)
            setFormData({ ...formData, emails: updatedEmails })
        }
    }

    const handleMaxValueChange = (value: string) => {
        setMaxValueInput(value)

        if (value === "") {
            setFormData({ ...formData, max_publication_value: null })
        } else {
            const numValue = parseInt(value, 10)
            if (!isNaN(numValue)) {
                setFormData({ ...formData, max_publication_value: numValue })
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!formData.name.trim()) {
            toast({
                title: "Ontbrekende informatie",
                description: "Voer een bedrijfsnaam in.",
                variant: "error",
            })
            return
        }

        if (!formData.summary_activities.trim()) {
            toast({
                title: "Ontbrekende informatie",
                description: "Voer een omschrijving van je bedrijfsactiviteiten in.",
                variant: "error",
            })
            return
        }

        // Filter out empty emails
        const validEmails = formData.emails.filter(email => email.trim() !== "")
        if (validEmails.length === 0) {
            toast({
                title: "Ontbrekende informatie",
                description: "Voer minstens één e-mailadres in.",
                variant: "error",
            })
            return
        }

        setFormSubmitting(true)

        try {
            const token = await getToken()

            // Prepare data with valid emails
            const dataToSubmit = {
                ...formData,
                emails: validEmails,
                subscription: "premium", // Default for now
            }

            // Use POST for new company, PATCH for existing
            const method = existingCompany ? "PATCH" : "POST"

            const response = await fetch(`${siteConfig.api_base_url}/company/`, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSubmit),
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            toast({
                title: "Bedrijfsinformatie Opgeslagen",
                description: "Je bedrijfsinformatie is succesvol opgeslagen.",
                variant: "success",
            })

            router.push("/onboarding/sectors")
        } catch (error) {
            console.error("Error saving company data:", error)
            toast({
                title: "Fout bij Opslaan",
                description: "Er is een fout opgetreden bij het opslaan van je bedrijfsinformatie.",
                variant: "error",
            })
        } finally {
            setFormSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader loadingtext="Bedrijfsinformatie laden..." size={32} />
            </div>
        )
    }

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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Company Activities */}
                    <div className="mb-6">
                        <label htmlFor="summary_activities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Omschrijving Bedrijfsactiviteiten <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <TextIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <Textarea
                                id="summary_activities"
                                className="pl-10 min-h-32"
                                placeholder="Beschrijf de kernactiviteiten van je bedrijf..."
                                value={formData.summary_activities}
                                onChange={(e) => setFormData({ ...formData, summary_activities: e.target.value })}
                                required
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Deze beschrijving wordt gebruikt voor het matchen van aanbestedingen.
                        </p>
                    </div>

                    {/* Max Publication Value */}
                    <div className="mb-6">
                        <label htmlFor="max_publication_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maximale Aanbestedingswaarde (€)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <EuroIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <Input
                                id="max_publication_value"
                                type="number"
                                className="pl-10"
                                placeholder="Bijvoorbeeld: 500000"
                                value={maxValueInput}
                                onChange={(e) => handleMaxValueChange(e.target.value)}
                                min="0"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Laat leeg als er geen limiet is voor aanbestedingen.
                        </p>
                    </div>

                    {/* Email Addresses */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            E-mailadressen <span className="text-red-500">*</span>
                        </label>

                        {formData.emails.map((email, index) => (
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

                                {formData.emails.length > 1 && (
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

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Deze e-mailadressen worden gebruikt voor notificaties en communicatie.
                        </p>
                    </div>
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
    )
}
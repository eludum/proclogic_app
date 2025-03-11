"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { BuildingIcon, GlobeIcon, PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = siteConfig.api_base_url;

export default function CompanySettings() {
    const { getToken } = useAuth();
    const { toast } = useToast();

    // State for company data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [extractingSite, setExtractingSite] = useState(false);
    const [companyData, setCompanyData] = useState({
        name: "",
        vat_number: "",
        emails: [],
        subscription: "",
        summary_activities: "",
        accreditations: {},
        max_publication_value: 0,
        activity_keywords: [],
        operating_regions: [],
        interested_sectors: [],
        website: ""
    });

    // Additional state for new inputs
    const [newEmail, setNewEmail] = useState("");
    const [newSector, setNewSector] = useState({ sector: "", cpv_codes: [""] });
    const [newRegion, setNewRegion] = useState("");
    const [newKeyword, setNewKeyword] = useState("");
    const [accreditationName, setAccreditationName] = useState("");
    const [accreditationValue, setAccreditationValue] = useState("");

    // Sectors options
    const sectorOptions = [
        { label: "Bouwwerkzaamheden", value: "Bouwwerkzaamheden", cpv: ["45000000"] },
        { label: "IT Services", value: "IT Services", cpv: ["72000000"] },
        { label: "Gezondheidszorg", value: "Gezondheidszorg", cpv: ["85000000"] },
        { label: "Onderwijs", value: "Onderwijs", cpv: ["80000000"] },
        { label: "Architectuur en Ingenieursdiensten", value: "Architectuur en Ingenieursdiensten", cpv: ["71000000"] },
        { label: "Transport", value: "Transport", cpv: ["60000000"] },
        { label: "Schoonmaakdiensten", value: "Schoonmaakdiensten", cpv: ["90000000"] },
        { label: "Kantoormeubilair", value: "Kantoormeubilair", cpv: ["39000000"] },
        { label: "Beveiligingsdiensten", value: "Beveiligingsdiensten", cpv: ["79000000"] },
        { label: "Onderzoeksdiensten", value: "Onderzoeksdiensten", cpv: ["73000000"] }
    ];

    // Region options (NUTS codes for Belgium)
    const regionOptions = [
        { label: "Brussel", value: "BE10" },
        { label: "Antwerpen", value: "BE21" },
        { label: "Limburg", value: "BE22" },
        { label: "Oost-Vlaanderen", value: "BE23" },
        { label: "Vlaams-Brabant", value: "BE24" },
        { label: "West-Vlaanderen", value: "BE25" },
        { label: "Brabant Wallon", value: "BE31" },
        { label: "Hainaut", value: "BE32" },
        { label: "Liège", value: "BE33" },
        { label: "Luxembourg", value: "BE34" },
        { label: "Namur", value: "BE35" }
    ];

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                toast({
                    title: "Authenticatie fout",
                    description: "Je bent niet ingelogd. Log in om je bedrijfsgegevens te bekijken.",
                    variant: "error"
                });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/company/current`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setCompanyData({
                ...data,
                website: data.website || ""
            });
        } catch (error) {
            console.error("Error fetching company data:", error);
            toast({
                title: "Fout bij laden",
                description: "Er is een fout opgetreden bij het laden van je bedrijfsgegevens.",
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const extractFromWebsite = async () => {
        if (!companyData.website) {
            toast({
                title: "Geen website ingevoerd",
                description: "Voer eerst een websiteadres in.",
                variant: "warning"
            });
            return;
        }

        setExtractingSite(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/company/extract-info`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ website: companyData.website })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Update company data with extracted info
            setCompanyData(prev => ({
                ...prev,
                summary_activities: data.summary || prev.summary_activities,
                activity_keywords: data.keywords || prev.activity_keywords,
                // Only update other fields if they're empty and we have data
                name: prev.name || data.name || "",
            }));

            toast({
                title: "Informatie geëxtraheerd",
                description: "Bedrijfsinformatie is succesvol geëxtraheerd van de website.",
                variant: "success"
            });
        } catch (error) {
            console.error("Error extracting website info:", error);
            toast({
                title: "Extractie mislukt",
                description: "Er is een fout opgetreden bij het extraheren van informatie van de website.",
                variant: "error"
            });
        } finally {
            setExtractingSite(false);
        }
    };

    const saveCompanyData = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/company/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(companyData)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            toast({
                title: "Opgeslagen!",
                description: "Je bedrijfsgegevens zijn succesvol bijgewerkt.",
                variant: "success"
            });
        } catch (error) {
            console.error("Error saving company data:", error);
            toast({
                title: "Fout bij opslaan",
                description: "Er is een fout opgetreden bij het opslaan van je bedrijfsgegevens.",
                variant: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCompanyData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add email
    const addEmail = () => {
        if (!newEmail || companyData.emails.includes(newEmail)) return;
        setCompanyData(prev => ({
            ...prev,
            emails: [...prev.emails, newEmail]
        }));
        setNewEmail("");
    };

    // Remove email
    const removeEmail = (email) => {
        setCompanyData(prev => ({
            ...prev,
            emails: prev.emails.filter(e => e !== email)
        }));
    };

    // Add sector
    const addSector = () => {
        if (!newSector.sector || newSector.cpv_codes[0] === "") return;
        setCompanyData(prev => ({
            ...prev,
            interested_sectors: [...prev.interested_sectors, { ...newSector }]
        }));
        setNewSector({ sector: "", cpv_codes: [""] });
    };

    // Remove sector
    const removeSector = (index) => {
        setCompanyData(prev => ({
            ...prev,
            interested_sectors: prev.interested_sectors.filter((_, i) => i !== index)
        }));
    };

    // Add region
    const addRegion = () => {
        if (!newRegion || companyData.operating_regions.includes(newRegion)) return;
        setCompanyData(prev => ({
            ...prev,
            operating_regions: [...prev.operating_regions, newRegion]
        }));
        setNewRegion("");
    };

    // Remove region
    const removeRegion = (region) => {
        setCompanyData(prev => ({
            ...prev,
            operating_regions: prev.operating_regions.filter(r => r !== region)
        }));
    };

    // Add keyword
    const addKeyword = () => {
        if (!newKeyword || companyData.activity_keywords.includes(newKeyword)) return;
        setCompanyData(prev => ({
            ...prev,
            activity_keywords: [...prev.activity_keywords, newKeyword]
        }));
        setNewKeyword("");
    };

    // Remove keyword
    const removeKeyword = (keyword) => {
        setCompanyData(prev => ({
            ...prev,
            activity_keywords: prev.activity_keywords.filter(k => k !== keyword)
        }));
    };

    // Add accreditation
    const addAccreditation = () => {
        if (!accreditationName || !accreditationValue) return;
        setCompanyData(prev => ({
            ...prev,
            accreditations: {
                ...prev.accreditations,
                [accreditationName]: accreditationValue
            }
        }));
        setAccreditationName("");
        setAccreditationValue("");
    };

    // Remove accreditation
    const removeAccreditation = (key) => {
        const newAccreditations = { ...companyData.accreditations };
        delete newAccreditations[key];
        setCompanyData(prev => ({
            ...prev,
            accreditations: newAccreditations
        }));
    };

    if (loading) {
        return <Loader loadingtext={"Laden..."} size={32} />;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <Toaster />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bedrijfsinstellingen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Beheer je bedrijfsgegevens en profiel</p>
                </div>
                <Button
                    onClick={saveCompanyData}
                    disabled={saving}
                    className="mt-4 sm:mt-0 flex items-center gap-2 bg-astral-500 hover:bg-astral-600 text-white"
                >
                    {saving ? (
                        <>Opslaan...</>
                    ) : (
                        <>
                            <SaveIcon size={16} />
                            <span>Opslaan</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Main form container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <BuildingIcon size={20} className="text-astral-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bedrijfsgegevens</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Left column */}
                    <div>
                        {/* Bedrijfsnaam */}
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bedrijfsnaam
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={companyData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* BTW-nummer */}
                        <div className="mb-6">
                            <label htmlFor="vat_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                BTW-nummer
                            </label>
                            <input
                                type="text"
                                id="vat_number"
                                name="vat_number"
                                value={companyData.vat_number}
                                disabled
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">BTW-nummer kan niet worden gewijzigd</p>
                        </div>

                        {/* Subscription level */}
                        <div className="mb-6">
                            <label htmlFor="subscription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Abonnement
                            </label>
                            <input
                                type="text"
                                id="subscription"
                                name="subscription"
                                value={companyData.subscription}
                                disabled
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                        </div>

                        {/* Max publication value */}
                        <div className="mb-6">
                            <label htmlFor="max_publication_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maximale aanbestedingswaarde (€)
                            </label>
                            <input
                                type="number"
                                id="max_publication_value"
                                name="max_publication_value"
                                value={companyData.max_publication_value}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximale waarde van aanbestedingen waarvoor je bedrijf interest heeft</p>
                        </div>
                    </div>

                    {/* Right column */}
                    <div>
                        {/* Website with extraction */}
                        <div className="mb-6">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Website
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GlobeIcon size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        placeholder="https://www.example.com"
                                        value={companyData.website}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <Button
                                    onClick={extractFromWebsite}
                                    disabled={extractingSite || !companyData.website}
                                    className="bg-astral-500 hover:bg-astral-600 text-white"
                                >
                                    {extractingSite ? "Bezig..." : "Extraheren"}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Voer je website in en wij halen automatisch relevante bedrijfsgegevens op</p>
                        </div>

                        {/* Activity summary */}
                        <div className="mb-6">
                            <label htmlFor="summary_activities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Activiteitsbeschrijving
                            </label>
                            <textarea
                                id="summary_activities"
                                name="summary_activities"
                                value={companyData.summary_activities}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Beschrijf de activiteiten van je bedrijf voor betere aanbestedingsmatches</p>
                        </div>
                    </div>
                </div>

                {/* Emails section */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">E-mailadressen</h3>
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Voeg e-mailadres toe"
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <Button onClick={addEmail} className="bg-astral-500 hover:bg-astral-600 text-white">
                                <PlusIcon size={16} />
                                <span className="ml-1">Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {companyData.emails.map((email, index) => (
                            <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                                <span className="text-gray-800 dark:text-gray-200 mr-2">{email}</span>
                                <button
                                    onClick={() => removeEmail(email)}
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <TrashIcon size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interested sectors */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interessegebieden</h3>
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <select
                                    value={newSector.sector}
                                    onChange={(e) => {
                                        const selected = sectorOptions.find(opt => opt.value === e.target.value);
                                        setNewSector({
                                            sector: e.target.value,
                                            cpv_codes: selected ? selected.cpv : [""]
                                        });
                                    }}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecteer sector</option>
                                    {sectorOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={addSector} disabled={!newSector.sector} className="bg-astral-500 hover:bg-astral-600 text-white shrink-0">
                                <PlusIcon size={16} />
                                <span className="ml-1">Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyData.interested_sectors.map((sector, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                                <div>
                                    <div className="text-gray-800 dark:text-gray-200">{sector.sector}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        CPV: {sector.cpv_codes.join(", ")}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeSector(index)}
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operating regions */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Operationele regio's</h3>
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <select
                                value={newRegion}
                                onChange={(e) => setNewRegion(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecteer regio</option>
                                {regionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <Button onClick={addRegion} disabled={!newRegion} className="bg-astral-500 hover:bg-astral-600 text-white">
                                <PlusIcon size={16} />
                                <span className="ml-1">Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {companyData.operating_regions.map((region, index) => {
                            const regionLabel = regionOptions.find(r => r.value === region)?.label || region;
                            return (
                                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                                    <span className="text-gray-800 dark:text-gray-200 mr-2">{regionLabel}</span>
                                    <button
                                        onClick={() => removeRegion(region)}
                                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                    >
                                        <TrashIcon size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Keywords */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activiteit Kernwoorden</h3>
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Nieuw kernwoord"
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <Button onClick={addKeyword} disabled={!newKeyword} className="bg-astral-500 hover:bg-astral-600 text-white">
                                <PlusIcon size={16} />
                                <span className="ml-1">Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {companyData.activity_keywords.map((keyword, index) => (
                            <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                                <span className="text-gray-800 dark:text-gray-200 mr-2">{keyword}</span>
                                <button
                                    onClick={() => removeKeyword(keyword)}
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <TrashIcon size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accreditations */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Accreditaties en Certificaten</h3>
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={accreditationName}
                                onChange={(e) => setAccreditationName(e.target.value)}
                                placeholder="Naam (bijv. ISO9001)"
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <input
                                type="text"
                                value={accreditationValue}
                                onChange={(e) => setAccreditationValue(e.target.value)}
                                placeholder="Waarde/niveau (bijv. 1,2,3)"
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                            <Button
                                onClick={addAccreditation}
                                disabled={!accreditationName || !accreditationValue}
                                className="bg-astral-500 hover:bg-astral-600 text-white shrink-0"
                            >
                                <PlusIcon size={16} />
                                <span className="ml-1">Toevoegen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(companyData.accreditations || {}).map(([key, value], index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                                <div>
                                    <div className="text-gray-800 dark:text-gray-200">{key}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Niveau: {value}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeAccreditation(key)}
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        ))}
                        {Object.keys(companyData.accreditations || {}).length === 0 && (
                            <div className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-2">
                                Geen accreditaties toegevoegd. Voeg uw bedrij
"use client"
import { siteConfig } from "@/app/siteConfig";
import { Button } from "@/components/Button";
import { Toaster } from '@/components/Toaster';
import { Loader } from "@/components/ui/PageLoad";
import { useToast } from '@/lib/useToast';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AccreditationsForm from "../_components/AccreditationsForm";
import CompanyProfileForm from "../_components/CompanyProfileForm";
import RegionsForm from "../_components/RegionsForm";
import SectorsForm from "../_components/SectorsForm";

const API_BASE_URL = siteConfig.api_base_url;

export interface Company {
    vat_number: string;
    name: string;
    emails: string[];
    subscription: string;
    summary_activities: string;
    interested_sectors: {
        sector: string;
        cpv_codes: string[];
    }[];
    max_publication_value: number | null;
    accreditations: Record<string, any> | null;
    activity_keywords: string[] | null;
    operating_regions: string[] | null;
}

export default function CompanySettingsPage() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const { getToken } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/company/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch company data: ${response.status}`);
            }

            const data = await response.json();
            setCompany(data);
        } catch (error) {
            console.error("Error fetching company data:", error);
            toast({
                title: "Fout bij laden",
                description: "Bedrijfsgegevens konden niet worden geladen. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const updateCompany = async (updatedData: Partial<Company>) => {
        if (!company) return;

        setSaving(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE_URL}/company/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData) // Only send what changed
            });

            if (!response.ok) {
                throw new Error(`Failed to update company data: ${response.status}`);
            }

            const updatedCompany = await response.json();
            setCompany(updatedCompany);

            toast({
                title: "Opgeslagen!",
                description: "De bedrijfsgegevens zijn bijgewerkt.",
                variant: "success"
            });
        } catch (error) {
            console.error("Error updating company data:", error);
            toast({
                title: "Fout bij opslaan",
                description: "Bedrijfsgegevens konden niet worden opgeslagen. Probeer het later opnieuw.",
                variant: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    const renderActiveSection = () => {
        if (!company) return null;

        switch (activeSection) {
            case 'profile':
                return <CompanyProfileForm company={company} onSave={updateCompany} saving={saving} />;
            case 'sectors':
                return <SectorsForm company={company} onSave={updateCompany} saving={saving} />;
            case 'regions':
                return <RegionsForm company={company} onSave={updateCompany} saving={saving} />;
            case 'accreditations':
                return <AccreditationsForm company={company} onSave={updateCompany} saving={saving} />;
            default:
                return <CompanyProfileForm company={company} onSave={updateCompany} saving={saving} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader loadingtext="Bedrijfsgegevens laden..." size={32} />
            </div>
        );
    }

    return (
        <section aria-label="Company Settings" className="pb-12">
            <Toaster />
            <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bedrijfsinstellingen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Beheer je bedrijfsgegevens en voorkeuren eenvoudig.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6">
                {/* Settings Menu */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <nav className="space-y-1">
                            <Button
                                onClick={() => setActiveSection('profile')}
                                className={`w-full justify-start text-left font-medium ${activeSection === 'profile' ? 'bg-astral-50 dark:bg-astral-900/20 text-astral-600 dark:text-astral-400' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                variant="ghost"
                            >
                                Bedrijfsprofiel
                            </Button>
                            <Button
                                onClick={() => setActiveSection('sectors')}
                                className={`w-full justify-start text-left font-medium ${activeSection === 'sectors' ? 'bg-astral-50 dark:bg-astral-900/20 text-astral-600 dark:text-astral-400' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                variant="ghost"
                            >
                                Sectoren & CPV-codes
                            </Button>
                            <Button
                                onClick={() => setActiveSection('regions')}
                                className={`w-full justify-start text-left font-medium ${activeSection === 'regions' ? 'bg-astral-50 dark:bg-astral-900/20 text-astral-600 dark:text-astral-400' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                variant="ghost"
                            >
                                Regio&apos;s
                            </Button>
                            <Button
                                onClick={() => setActiveSection('accreditations')}
                                className={`w-full justify-start text-left font-medium ${activeSection === 'accreditations' ? 'bg-astral-50 dark:bg-astral-900/20 text-astral-600 dark:text-astral-400' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                                variant="ghost"
                            >
                                Accreditaties
                            </Button>
                        </nav>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                        {renderActiveSection()}
                    </div>
                </div>
            </div>
        </section>
    );
}
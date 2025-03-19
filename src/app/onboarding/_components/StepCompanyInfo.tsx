import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { BuildingIcon, Users } from "lucide-react"
import { CompanyData } from "./constants"

interface StepCompanyInfoProps {
    companyData: CompanyData
    setCompanyData: (data: CompanyData) => void
}


export default function StepCompanyInfo({
    companyData,
    setCompanyData,
}: StepCompanyInfoProps) {
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
            </div>
        </div>
    )
}
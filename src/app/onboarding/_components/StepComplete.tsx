import { BarChart3, CheckCircle2, Clock, SearchIcon, Sparkles } from "lucide-react"
import Image from "next/image"

interface StepCompleteProps {
    companyName: string
}

export default function StepComplete({ companyName }: StepCompleteProps) {
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
                Gefeliciteerd! {companyName} is nu klaar om van ProcLogic gebruik te maken.
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
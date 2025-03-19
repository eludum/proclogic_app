import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Loader } from "@/components/ui/PageLoad"
import { CheckCircle, Globe, Loader2, XCircle } from "lucide-react"

interface StepWebsiteParserProps {
    websiteUrl: string
    setWebsiteUrl: (url: string) => void
    isUrlValid: boolean | null
    isScraping: boolean
    handleScrapeWebsite: () => Promise<void>
}

export default function StepWebsiteParser({
    websiteUrl,
    setWebsiteUrl,
    isUrlValid,
    isScraping,
    handleScrapeWebsite
}: StepWebsiteParserProps) {
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
                                className={`pl-10 ${isUrlValid === false ? "border-red-300 dark:border-red-700" : ""}`}
                                placeholder="jouwbedrijf.be"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                disabled={isScraping}
                            />
                            {websiteUrl.trim() !== "" && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    {isUrlValid === true ? (
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
                            Voer een geldige website URL in zoals "bedrijf.be", "www.bedrijf.be", "http://bedrijf.be" of "https://bedrijf.be"
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
}
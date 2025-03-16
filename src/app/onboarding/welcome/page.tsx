"use client"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, PenSquareIcon, Wand } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function WelcomePage() {
    const router = useRouter()
    const { user } = useUser()
    const [selectedOption, setSelectedOption] = useState<"ai" | "manual" | null>(null)

    const handleContinue = () => {
        if (selectedOption === "ai") {
            router.push("/onboarding/website-parser")
        } else {
            router.push("/onboarding/company-info")
        }
    }

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

            {/* Continue button */}
            <div className="mt-8 w-full max-w-xl">
                <Button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 float-right"
                    disabled={!selectedOption}
                    onClick={handleContinue}
                >
                    <span>Doorgaan</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
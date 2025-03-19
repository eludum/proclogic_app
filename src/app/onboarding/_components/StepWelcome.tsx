import { Card } from "@/components/Card"
import { User } from "@clerk/nextjs/server"
import { PenSquareIcon, Wand } from "lucide-react"
import { Logo } from "../../../../public/Logo"

interface StepWelcomeProps {
    selectedOption: "ai" | "manual" | null
    setSelectedOption: (option: "ai" | "manual") => void
    user: User | null | undefined
}

export default function StepWelcome({
    selectedOption,
    setSelectedOption,
    user
}: StepWelcomeProps) {
    return (
        <div className="flex flex-col items-center space-y-8 animate-fadeIn">
            {/* Logo and welcome message */}
            <div className="text-center mb-4">
                <div className="flex justify-center mb-6">
                    <Logo className="size-24" />
                </div>

                {user?.firstName && (
                    <p className="mt-2 text-lg font-medium text-astral-600 dark:text-astral-400">
                        Hallo {user.firstName}!
                    </p>
                )}

                <h1 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    Welkom bij ProcLogic
                </h1>

                <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    We helpen je de beste aanbestedingen te vinden die passen bij jouw bedrijf.
                    Laten we even je profiel instellen.
                </p>

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
        </div>
    )
}
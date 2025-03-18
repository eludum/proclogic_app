import { cx } from "@/lib/utils"
import { CheckCircle } from "lucide-react"
import { STEP_LABELS, STEP_SEQUENCE, STEPS } from "./constants"

interface ProgressBarProps {
    currentStep: string
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
    // Find current step index (skip WEBSITE_PARSER in display)
    const getCurrentStepIndex = () => {
        if (currentStep === STEPS.WEBSITE_PARSER) {
            return STEP_SEQUENCE.indexOf(STEPS.COMPANY_INFO)
        }
        return STEP_SEQUENCE.indexOf(currentStep)
    }

    const currentIndex = getCurrentStepIndex()

    return (
        <div className="mb-8">
            <div className="w-full flex justify-between">
                {STEP_SEQUENCE.map((step, idx) => (
                    <div key={step} className="flex flex-col items-center">
                        <div
                            className={cx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                idx < currentIndex
                                    ? "bg-astral-100 text-astral-600 dark:bg-astral-900/30 dark:text-astral-400 border border-astral-200 dark:border-astral-800"
                                    : idx === currentIndex
                                        ? "bg-astral-500 text-white dark:bg-astral-400 dark:text-slate-900"
                                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                            )}
                        >
                            {idx < currentIndex ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                idx + 1
                            )}
                        </div>
                        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400 hidden sm:inline">
                            {STEP_LABELS[step as keyof typeof STEP_LABELS]}
                        </span>
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-4">
                <div
                    className="bg-astral-500 dark:bg-astral-400 h-1 rounded-full transition-all duration-300"
                    style={{
                        width: `${Math.max(5, ((getCurrentStepIndex() + 1) / STEP_SEQUENCE.length) * 100)}%`,
                    }}
                ></div>
            </div>
        </div>
    )
}
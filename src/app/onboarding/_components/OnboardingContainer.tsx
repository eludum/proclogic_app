import { cx } from "@/lib/utils"
import { ReactNode } from "react"
import NavButtons from "./NavButtons"
import ProgressBar from "./ProgressBar"
import { STEPS } from "./constants"

interface OnboardingContainerProps {
    currentStep: string
    children: ReactNode
    canProceedToNext: boolean
    isSubmitting: boolean
    goToNextStep: () => void
    goToPreviousStep: () => void
}

export default function OnboardingContainer({
    currentStep,
    children,
    canProceedToNext,
    isSubmitting,
    goToNextStep,
    goToPreviousStep
}: OnboardingContainerProps) {
    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-950 p-4">
            <div className={cx(
                "w-full max-w-3xl mx-auto",
                // For welcome and complete steps, show more centered content
                currentStep === STEPS.WELCOME || currentStep === STEPS.COMPLETE
                    ? "py-12"
                    : "py-8"
            )}>
                {/* Progress bar - don't show for welcome screen */}
                {currentStep !== STEPS.WELCOME && (
                    <ProgressBar currentStep={currentStep} />
                )}

                {/* Main content area */}
                <div className="mb-8">
                    {children}
                </div>

                {/* Navigation buttons */}
                <NavButtons
                    currentStep={currentStep}
                    canProceedToNext={canProceedToNext}
                    isSubmitting={isSubmitting}
                    goToNextStep={goToNextStep}
                    goToPreviousStep={goToPreviousStep}
                />
            </div>
        </div>
    )
}
import { Button } from "@/components/Button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { STEPS } from "./constants"

interface NavButtonsProps {
    currentStep: string
    canProceedToNext: boolean
    isSubmitting: boolean
    goToNextStep: () => void
    goToPreviousStep: () => void
}

export default function NavButtons({
    currentStep,
    canProceedToNext,
    isSubmitting,
    goToNextStep,
    goToPreviousStep
}: NavButtonsProps) {
    return (
        <div className="flex justify-between mt-8">
            {currentStep !== STEPS.WELCOME && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Terug</span>
                </Button>
            )}

            {currentStep === STEPS.WELCOME && (
                <div></div> // Empty div to maintain flex spacing
            )}

            {currentStep !== STEPS.COMPLETE ? (
                <Button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2"
                    disabled={!canProceedToNext || isSubmitting}
                >
                    <span>{currentStep === STEPS.WEBSITE_PARSER ? "Overslaan" : "Doorgaan"}</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Verwerken...</span>
                        </>
                    ) : (
                        <>
                            <span>Naar het dashboard</span>
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}
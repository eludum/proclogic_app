"use client"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RadioCardGroup, RadioCardItem } from "@/components/RadioCardGroup"
import { RadioGroup, RadioGroupItem } from "@/components/RadioGroup"
import { Slider } from "@/components/Slider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

export default function PublicTenderConfiguration() {
  const [emailNotifications, setEmailNotifications] = useState<"yes" | "no">("yes")
  const [numberOfEmployees, setNumberOfEmployees] = useState(10)
  const [averageTenderValue] = useState(100000)
  const [companyDescription, setCompanyDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [experience, setExperience] = useState<"none" | "some" | "regular">("none")
  const [contractDuration, setContractDuration] = useState<"short" | "medium" | "long">("medium")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      console.log("Formulier ingediend")
      router.push("/reports")
    }, 1200)
  }

  const calculateEstimatedValue = () => {
    const baseValue = numberOfEmployees * 10000
    const adjustedValue = baseValue * (averageTenderValue / 100000)
    return `${adjustedValue.toLocaleString()} EUR+`
  }

  return (
    <main className="mx-auto p-4">
      <div
        style={{ animationDuration: "500ms" }}
        className="motion-safe:animate-revealBottom"
      >
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Configureer Aanbestedingsmeldingen
        </h1>
        <p className="mt-6 text-gray-700 sm:text-sm dark:text-gray-300">
          Stel uw voorkeuren in voor aanbestedingsmeldingen en bedrijfsinformatie.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex flex-col gap-6">
          {/* E-mailmeldingen */}
          <fieldset
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <legend className="font-medium text-gray-900 sm:text-sm dark:text-gray-50">
              E-mailmeldingen
            </legend>
            <RadioCardGroup
              id="email-notifications"
              value={emailNotifications}
              onValueChange={(value) => setEmailNotifications(value as "yes" | "no")}
              className="mt-2 grid grid-cols-1 gap-4 sm:text-sm md:grid-cols-2"
              aria-label="Selecteer e-mailmeldingen"
            >
              <RadioCardItem value="yes">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold leading-6">Ja</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 sm:text-xs dark:text-gray-500">
                    Ontvang dagelijkse e-mailmeldingen met top publicaties
                  </p>
                </div>
              </RadioCardItem>
              <RadioCardItem value="no">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold leading-6">Nee</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 sm:text-xs dark:text-gray-500">
                    Ontvang geen e-mailmeldingen
                  </p>
                </div>
              </RadioCardItem>
            </RadioCardGroup>
          </fieldset>

          {/* Aantal Werknemers en Gemiddelde Aanbestedingswaarde */}
          <div
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "400ms",
              animationFillMode: "backwards",
            }}
          >
            <Label
              className="text-base font-medium text-gray-900 sm:text-sm dark:text-gray-50"
              htmlFor="employees"
            >
              Aantal Werknemers
            </Label>
            <div className="flex flex-nowrap gap-4">
              <Slider
                value={[numberOfEmployees]}
                onValueChange={(value) => setNumberOfEmployees(value[0])}
                id="employees"
                min={1}
                max={1000}
                step={5}
                aria-valuetext={`${numberOfEmployees} werknemers`}
              />
              <Input
                id="employees-input"
                type="number"
                min={1}
                max={1000}
                value={numberOfEmployees}
                onChange={(e) => setNumberOfEmployees(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          {/* Bedrijfsomschrijving en Website */}
          <div
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "800ms",
              animationFillMode: "backwards",
            }}
          >
            <Label
              className="text-base font-medium text-gray-900 sm:text-sm dark:text-gray-50"
              htmlFor="company-description"
            >
              Bedrijfsomschrijving
            </Label>
            <Input
              id="company-description"
              type="text"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              aria-describedby="company-description-description"
            />
            <p id="company-description-description" className="sr-only">
              Voer een korte beschrijving van uw bedrijf in
            </p>
          </div>

          <div
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "1000ms",
              animationFillMode: "backwards",
            }}
          >
            <Label
              className="text-base font-medium text-gray-900 sm:text-sm dark:text-gray-50"
              htmlFor="website"
            >
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              aria-describedby="website-description"
            />
            <p id="website-description" className="sr-only">
              Voer de URL van uw bedrijfswebsite in
            </p>
          </div>

          {/* Ervaring met Overheidsopdrachten */}
          <div
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "1800ms",
              animationFillMode: "backwards",
            }}
          >
            <Label
              className="text-base font-medium text-gray-900 sm:text-sm dark:text-gray-50"
              htmlFor="experience"
            >
              Ervaring met Overheidsopdrachten
            </Label>
            <RadioGroup
              value={experience}
              onValueChange={(value) =>
                setExperience(value as "none" | "some" | "regular")
              }
              className="flex gap-6 pt-2.5"
            >
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="none" id="experience-none" />
                <Label htmlFor="experience-none">Geen ervaring</Label>
              </div>
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="some" id="experience-some" />
                <Label htmlFor="experience-some">Enkele keren</Label>
              </div>
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="regular" id="experience-regular" />
                <Label htmlFor="experience-regular">Regelmatig</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Gewenste Contractduur */}
          <div
            className="space-y-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "500ms",
              animationDelay: "2000ms",
              animationFillMode: "backwards",
            }}
          >
            <Label
              className="text-base font-medium text-gray-900 sm:text-sm dark:text-gray-50"
              htmlFor="contract-duration"
            >
              Gewenste Contractduur
            </Label>
            <RadioGroup
              value={contractDuration}
              onValueChange={(value) =>
                setContractDuration(value as "short" | "medium" | "long")
              }
              className="flex gap-6 pt-2.5"
            >
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="short" id="contract-duration-short" />
                <Label htmlFor="contract-duration-short">Kort (&lt;6 maanden)</Label>
              </div>
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="medium" id="contract-duration-medium" />
                <Label htmlFor="contract-duration-medium">Middel (6-24 maanden)</Label>
              </div>
              <div className="flex items-center gap-x-3">
                <RadioGroupItem value="long" id="contract-duration-long" />
                <Label htmlFor="contract-duration-long">Lang (&gt;24 maanden)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Geschatte Waarde */}
          <Card
            className="mt-4 space-y-1 border-gray-300 motion-safe:animate-revealBottom dark:border-gray-800"
            style={{
              animationDuration: "500ms",
              animationDelay: "2200ms",
              animationFillMode: "backwards",
            }}
          >
            <p className="text-gray-700 sm:text-sm dark:text-gray-300">
              Geschatte Aanbestedingswaarde
            </p>
            <p
              className="text-3xl font-medium text-gray-900 sm:text-2xl dark:text-gray-50"
              aria-live="polite"
            >
              {calculateEstimatedValue()}
            </p>
          </Card>

          {/* Submit en Terug Buttons */}
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="ghost" asChild>
              <Link href="/onboarding/employees">Terug</Link>
            </Button>
            <Button
              className="disabled:bg-gray-200 disabled:text-gray-500"
              type="submit"
              disabled={
                !emailNotifications ||
                !numberOfEmployees ||
                !averageTenderValue ||
                !companyDescription ||
                !website ||
                loading
              }
              aria-disabled={
                !emailNotifications ||
                !numberOfEmployees ||
                !averageTenderValue ||
                !companyDescription ||
                !website ||
                loading
              }
              isLoading={loading}
            >
              {loading ? "Indienen..." : "Doorgaan"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
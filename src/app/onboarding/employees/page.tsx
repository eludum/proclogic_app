"use client"
import { Button } from "@/components/Button"
import {
  RadioCardGroup,
  RadioCardIndicator,
  RadioCardItem,
} from "@/components/RadioCardGroup"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

const provinces = [
  { value: "antwerpen", label: "Antwerpen" },
  { value: "oost-vlaanderen", label: "Oost-Vlaanderen" },
  { value: "west-vlaanderen", label: "West-Vlaanderen" },
  { value: "vlaams-brabant", label: "Vlaams-Brabant" },
  { value: "limburg", label: "Limburg" },
  { value: "brussels", label: "Brussels Hoofdstedelijk Gewest" },
  { value: "henegouwen", label: "Henegouwen" },
  { value: "luik", label: "Luik" },
  { value: "luxemburg", label: "Luxemburg" },
  { value: "namen", label: "Namen" },
  { value: "waals-brabant", label: "Waals-Brabant" },
]

export default function Provinces() {
  const [selectedProvince, setSelectedProvince] = useState("")
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      console.log("Form submitted with province:", selectedProvince)
      router.push("/onboarding/infrastructure")
    }, 600)
  }

  return (
    <main className="mx-auto p-4">
      <div
        className="motion-safe:animate-revealBottom"
        style={{ animationDuration: "500ms" }}
      >
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          In welke provincie is uw bedrijf gevestigd?
        </h1>
        <p className="mt-6 text-gray-700 sm:text-sm dark:text-gray-300">
          Dit helpt ons om de ervaring aan te passen aan uw regio.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <fieldset>
          <legend className="sr-only">Selecteer uw provincie</legend>
          <RadioCardGroup
            value={selectedProvince}
            onValueChange={(value) => setSelectedProvince(value)}
            required
            aria-label="Provincie"
          >
            {provinces.map((province, index) => (
              <div
                className="motion-safe:animate-revealBottom"
                key={province.value}
                style={{
                  animationDuration: "600ms",
                  animationDelay: `${100 + index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <RadioCardItem
                  className="active:scale-[99%] dark:bg-gray-925"
                  key={province.value}
                  value={province.value}
                  style={{
                    animationDuration: "600ms",
                    animationDelay: `${100 + index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <RadioCardIndicator />
                    <span className="block sm:text-sm">{province.label}</span>
                  </div>
                </RadioCardItem>
              </div>
            ))}
          </RadioCardGroup>
        </fieldset>
        <div className="mt-6 flex justify-between">
          <Button type="button" variant="ghost" asChild>
            <Link href="/onboarding/products">Terug</Link>
          </Button>
          <Button
            className="disabled:bg-gray-200 disabled:text-gray-500"
            type="submit"
            disabled={!selectedProvince || loading}
            aria-disabled={!selectedProvince || loading}
            isLoading={loading}
          >
            {loading ? "Verzenden..." : "Doorgaan"}
          </Button>
        </div>
      </form>
    </main>
  )
}
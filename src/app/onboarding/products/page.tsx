"use client"
import { badgeVariants } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { Label } from "@/components/Label"
import { cx } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React from "react"

interface Sector {
  id: string
  title: string
  subcategories: string[]
}

interface CheckedItems {
  [sectorId: string]: boolean
}

interface SectorItemProps {
  sector: Sector
  checked: boolean
  onCheckedChange: (sectorId: string, checked: boolean) => void
}

const sectors: Sector[] = [
  {
    id: "agriculture",
    title: "Landbouw en Voedselindustrie",
    subcategories: [
      "Landbouwproducten",
      "Voedingsmiddelen en dranken",
      "Landbouwmachines",
    ],
  },
  {
    id: "energy",
    title: "Energie en Grondstoffen",
    subcategories: ["Brandstoffen", "Elektriciteit", "Mijnbouwproducten"],
  },
  {
    id: "manufacturing",
    title: "Industrie en Productie",
    subcategories: [
      "Chemische producten",
      "Metaalbewerking",
      "Textiel en Leder",
      "Meubelen en inrichting",
    ],
  },
  {
    id: "technology",
    title: "Technologie en IT",
    subcategories: ["Software", "IT-diensten", "Elektronische apparatuur"],
  },
  {
    id: "construction",
    title: "Bouw en Infrastructuur",
    subcategories: ["Bouwwerkzaamheden", "Bouwmaterialen", "Waterbeheer"],
  },
  {
    id: "healthcare",
    title: "Gezondheid en Onderwijs",
    subcategories: ["Gezondheidszorg", "Onderwijsdiensten", "Farmaceutische producten"],
  },
  {
    id: "services",
    title: "Diensten en Overheid",
    subcategories: [
      "Financiële diensten",
      "Vastgoeddiensten",
      "Consulting en zakelijke diensten",
    ],
  },
  {
    id: "transport",
    title: "Transport en Logistiek",
    subcategories: ["Vervoersmaterieel", "Transportdiensten", "Post- en telecommunicatiediensten"],
  },
]

const SectorItem = ({ sector, checked, onCheckedChange }: SectorItemProps) => {
  return (
    <Card asChild className={cx("cursor-pointer border-gray-300 p-5 transition-all active:scale-[99%] dark:border-gray-800")}
    >
      <Label className="block" htmlFor={sector.id}>
        <div className="mb-2 flex items-center gap-2.5">
          <Checkbox
            id={sector.id}
            name={sector.title}
            checked={checked}
            onCheckedChange={(isChecked) =>
              onCheckedChange(sector.id, isChecked === true)
            }
          />
          <span className="text-base font-medium sm:text-sm">{sector.title}</span>
        </div>
        {sector.subcategories.length > 0 && (
          <ul className="ml-6 mt-2 flex flex-wrap gap-1.5">
            {sector.subcategories.map((subcategory) => (
              <li
                className={badgeVariants({ variant: "neutral" })}
                key={subcategory}
              >
                {subcategory}
              </li>
            ))}
          </ul>
        )}
      </Label>
    </Card>
  )
}

export default function Sectors() {
  const [checkedItems, setCheckedItems] = React.useState<CheckedItems>({})
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleCheckedChange = (sectorId: string, isChecked: boolean) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [sectorId]: isChecked,
    }))
  }

  const isAnyItemChecked = Object.values(checkedItems).some(Boolean)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      console.log("Form submitted:", checkedItems)
      router.push("/onboarding/employees")
    }, 400)
  }

  return (
    <main className="mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        In welke sectoren bent u actief?
      </h1>
      <p className="mt-6 text-gray-700 sm:text-sm dark:text-gray-300">
        U kunt meerdere sectoren selecteren. Dit helpt ons om de ervaring aan te passen.
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <fieldset>
          <legend className="sr-only">Selecteer uw sectoren</legend>
          <div className="space-y-2">
            {sectors.map((sector, index) => (
              <div key={sector.id}>
                <SectorItem
                  sector={sector}
                  checked={checkedItems[sector.id] || false}
                  onCheckedChange={handleCheckedChange}
                />
              </div>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex justify-end">
          <Button
            className="disabled:bg-gray-200 disabled:text-gray-500"
            type="submit"
            disabled={!isAnyItemChecked || loading}
            aria-disabled={!isAnyItemChecked || loading}
            isLoading={loading}
          >
            {loading ? "Verzenden..." : "Doorgaan"}
          </Button>
        </div>
      </form>
    </main>
  )
}
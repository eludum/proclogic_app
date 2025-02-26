"use client"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

// Translation map for converting route segments to display names
const routeTranslations: Record<string, string> = {
  // Main sections
  dashboard: "Dashboard",
  search: "Zoeken",
  alerts: "Mijn Alerts",
  publications: "Aanbestedingen",
  workspaces: "Werkruimtes",
  analytics: "Analyses",
  settings: "Instellingen",

  // Publications subsections
  overview: "Overzicht",
  saved: "Opgeslagen",
  expiring: "Verlopend",

  // Workspaces subsections
  projects: "Projecten",
  documents: "Documenten",
  team: "Team Samenwerking",

  // Analytics subsections
  "ai-summaries": "AI-Samenvattingen",
  competition: "Concurrentieanalyse",
  reports: "Rapportages",

  // Settings subsections
  "company-profile": "Bedrijfsprofiel",
  users: "Gebruikersbeheer",
  notifications: "Notificatie-instellingen",
}

interface BreadcrumbItem {
  name: string
  href: string
  isCurrent: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    // Always start with Home
    const items: BreadcrumbItem[] = [
      {
        name: "Home",
        href: "/",
        isCurrent: pathname === "/"
      }
    ]

    // Skip processing if we're on the home page
    if (pathname === "/") {
      return items
    }

    // Split the path into segments and build the breadcrumb trail
    const segments = pathname.split("/").filter(Boolean)
    let currentPath = ""

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Get display name from translation map or use the segment with first letter capitalized
      const displayName = routeTranslations[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1)

      items.push({
        name: displayName,
        href: currentPath,
        isCurrent: index === segments.length - 1
      })
    })

    return items
  }, [pathname])

  // Don't render breadcrumbs on the home page
  if (pathname === "/") {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="ml-2">
      <ol role="list" className="flex items-center text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                className="mx-2 size-4 shrink-0 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            )}
            {item.isCurrent ? (
              <span className="text-gray-900 font-medium dark:text-gray-50" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
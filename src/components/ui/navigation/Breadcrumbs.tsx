"use client"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

// Translation map for converting route segments to display names
const routeTranslations: Record<string, string> = {
  // Main sections
  // TODO: add new sections and add metadata everywhere
  dashboard: "Dashboard",
  search: "Zoeken",

  publications: "Aanbevolen",
  "my-publications": "Mijn aanbestedingen",
  board: "Overzichtsbord",
  workspaces: "Werkruimtes",
  analytics: "Analyses",
  procy: "Procy",
  settings: "Instellingen",


  // Workspaces subsections
  projects: "Projecten",
  documents: "Documenten",
  team: "Team Samenwerking",

  // Settings subsections
  "company-profile": "Bedrijfsprofiel",
  users: "Gebruikersbeheer",
}

interface BreadcrumbItem {
  name: string
  href: string
  isCurrent: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleItems, setVisibleItems] = useState<BreadcrumbItem[]>([])
  const [isOverflowing, setIsOverflowing] = useState(false)

  const allBreadcrumbs = useMemo(() => {
    // Always start with Home
    const items: BreadcrumbItem[] = [
      {
        name: "Start",
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

  // Calculate which breadcrumbs to show based on available space
  useEffect(() => {
    if (!containerRef.current || allBreadcrumbs.length <= 3) {
      setVisibleItems(allBreadcrumbs)
      setIsOverflowing(false)
      return
    }

    const updateVisibleItems = () => {
      const containerWidth = containerRef.current?.clientWidth || 0

      // Always show first and last two items if we have many breadcrumbs
      if (allBreadcrumbs.length > 3) {
        // Try with all items first
        setVisibleItems(allBreadcrumbs)

        // Check if it's overflowing after a small delay to let the DOM update
        setTimeout(() => {
          const isCurrentlyOverflowing = containerRef.current ?
            containerRef.current.scrollWidth > containerRef.current.clientWidth : false;

          if (isCurrentlyOverflowing) {
            // If overflowing, show first, ellipsis, and last two items
            setVisibleItems([
              allBreadcrumbs[0],
              { name: "...", href: "", isCurrent: false }, // Ellipsis placeholder
              ...allBreadcrumbs.slice(-2)
            ]);
            setIsOverflowing(true);
          } else {
            setIsOverflowing(false);
          }
        }, 0);
      } else {
        setVisibleItems(allBreadcrumbs);
        setIsOverflowing(false);
      }
    };

    updateVisibleItems();

    // Set up resize observer to handle window size changes
    const resizeObserver = new ResizeObserver(updateVisibleItems);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [allBreadcrumbs]);

  // Don't render breadcrumbs on the home page
  if (pathname === "/") {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="ml-2 w-full overflow-hidden">
      <div ref={containerRef} className="max-w-full">
        <ol role="list" className="flex items-center text-sm">
          {visibleItems.map((item, index) => (
            <li key={item.name + index} className="flex items-center whitespace-nowrap">
              {index > 0 && (
                <ChevronRight
                  className="mx-2 size-4 shrink-0 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              )}
              {item.name === "..." ? (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              ) : item.isCurrent ? (
                <span
                  className="text-gray-900 font-medium dark:text-gray-50 truncate max-w-xs"
                  aria-current="page"
                  title={item.name}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 truncate max-w-xs"
                  title={item.name}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
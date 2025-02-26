"use client"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import {
  BarChart2,
  Bell,
  FileText,
  Home,
  Search,
  Settings,
  Users
} from "lucide-react"
import * as React from "react"
import { Logo } from "../../../../public/Logo"
import { UserProfile } from "./UserProfile"

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    notifications: false,
  },
  {
    name: "Zoeken",
    href: "/search",
    icon: Search,
    notifications: 0,
  },
  {
    name: "Mijn Alerts",
    href: "/alerts",
    icon: Bell,
    notifications: 3,
  },
] as const

const secondaryNavigation = [
  {
    name: "Aanbestedingen",
    href: "/publications",
    icon: FileText,
    children: [
      {
        name: "Overzicht",
        href: "/publications/overview",
      },
      {
        name: "Opgeslagen",
        href: "/publications/saved",
      },
      {
        name: "Verlopend",
        href: "/publications/expiring",
      },
    ],
  },
  {
    name: "Werkruimtes",
    href: "/workspaces",
    icon: Users,
    children: [
      {
        name: "Projecten",
        href: "/workspaces/projects",
      },
      {
        name: "Documenten",
        href: "/workspaces/documents",
      },
      {
        name: "Team Samenwerking",
        href: "/workspaces/team",
      }
    ],
  },
  {
    name: "Analyses",
    href: "/analytics",
    icon: BarChart2,
    children: [
      {
        name: "AI-Samenvattingen",
        href: "/analytics/ai-summaries",
      },
      {
        name: "Concurrentieanalyse",
        href: "/analytics/competition",
      },
      {
        name: "Rapportages",
        href: "/analytics/reports",
      }
    ],
  },
] as const

const adminNavigation = [
  {
    name: "Instellingen",
    href: "/settings",
    icon: Settings,
    children: [
      {
        name: "Bedrijfsprofiel",
        href: "/settings/company-profile",
      },
      {
        name: "Gebruikersbeheer",
        href: "/settings/users",
      },
      {
        name: "Notificatie-instellingen",
        href: "/settings/notifications",
      },
    ],
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Initialize with all menu sections open
  const [openMenus, setOpenMenus] = React.useState<string[]>([
    secondaryNavigation[0].name,
    secondaryNavigation[1].name,
    secondaryNavigation[2].name,
    adminNavigation[0].name
  ]);

  // Get the current route from window.location if we're in a browser environment
  const [currentRoute, setCurrentRoute] = React.useState<string>("/");

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Extract pathname from either localhost:3000 or app.proclogic.be
      const pathname = window.location.pathname;
      setCurrentRoute(pathname);

      // We don't need to auto-expand since all menus are open by default
      // This useEffect just sets the current route
    }
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  // Helper function to check if a route is active
  const isRouteActive = (route: string): boolean => {
    // Exact match for main routes
    if (route === currentRoute) return true;

    // For nested routes like /publications/overview when currentRoute is /publications/overview
    if (route !== '/' && currentRoute.startsWith(route)) return true;

    return false;
  };

  // Helper to check if a child route is active in a section
  const isChildActive = (children: { href: string }[]): boolean => {
    return children.some(child => isRouteActive(child.href));
  };

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <Logo className="size-6 text-blue-500 dark:text-blue-500" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
              ProcLogic
            </span>
            <span className="block text-xs text-gray-900 dark:text-gray-50">
              Starter Plan
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Zoeken naar aanbestedingen..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isRouteActive(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {secondaryNavigation.map((item) => {
                const sectionActive = isChildActive(item.children);
                return (
                  <SidebarMenuItem key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cx(
                        "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base transition hover:bg-gray-200/50 sm:text-sm dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                        focusRing,
                        sectionActive
                          ? "bg-gray-200/70 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                          : "text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cx(
                            "size-[18px] shrink-0",
                            sectionActive && "text-blue-500 dark:text-blue-400"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      <RiArrowDownSFill
                        className={cx(
                          openMenus.includes(item.name)
                            ? "rotate-0"
                            : "-rotate-90",
                          "size-5 shrink-0 transform transition-transform duration-150 ease-in-out",
                          sectionActive
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-600"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {item.children && openMenus.includes(item.name) && (
                      <SidebarMenuSub>
                        <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                        {item.children.map((child) => (
                          <SidebarMenuItem key={child.name}>
                            <SidebarSubLink
                              href={child.href}
                              isActive={isRouteActive(child.href)}
                            >
                              {child.name}
                            </SidebarSubLink>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {adminNavigation.map((item) => {
                const sectionActive = isChildActive(item.children);
                return (
                  <SidebarMenuItem key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cx(
                        "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base transition hover:bg-gray-200/50 sm:text-sm dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                        focusRing,
                        sectionActive
                          ? "bg-gray-200/70 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                          : "text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cx(
                            "size-[18px] shrink-0",
                            sectionActive && "text-blue-500 dark:text-blue-400"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      <RiArrowDownSFill
                        className={cx(
                          openMenus.includes(item.name)
                            ? "rotate-0"
                            : "-rotate-90",
                          "size-5 shrink-0 transform transition-transform duration-150 ease-in-out",
                          sectionActive
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-600"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {item.children && openMenus.includes(item.name) && (
                      <SidebarMenuSub>
                        <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                        {item.children.map((child) => (
                          <SidebarMenuItem key={child.name}>
                            <SidebarSubLink
                              href={child.href}
                              isActive={isRouteActive(child.href)}
                            >
                              {child.name}
                            </SidebarSubLink>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
"use client"
import { Divider } from "@/components/Divider"
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
import { SafeUser } from '@/lib/clerkUserUtils'
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import {
  BarChart2,
  FileText,
  Home,
  Search,
  Settings,
  Users
} from "lucide-react"
import * as React from "react"
import { Logo } from "../../../../public/Logo"
import { UserProfile } from "./UserProfile"

// Type for the props
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: null | SafeUser;
}

const mainNavigation = [
  {
    name: "Zoeken",
    href: "/search",
    icon: Search,
    notifications: false,
  },
  // {
  //   name: "Mijn Alerts",
  //   href: "/alerts",
  //   icon: Bell,
  //   notifications: 3,
  // },
] as const

const secondaryNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    notifications: false,
    hasChildren: false, // Added this property to indicate no children
  },
  {
    name: "Aanbestedingen",
    href: "/publications",
    icon: FileText,
    hasChildren: true, // Added this property to indicate it has children
    children: [
      {
        name: "Overzicht",
        href: "/publications/overview",
      },
      {
        name: "Opgeslagen",
        href: "/publications/saved",
      },
    ],
  },
  {
    name: "Analyses",
    href: "/analytics",
    icon: BarChart2,
    hasChildren: true, // Added this property to indicate it has children
    children: [
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
  {
    name: "Werkruimtes",
    href: "#", // Changed from "/workspaces" to "#" to prevent navigation
    icon: Users,
    disabled: true, // Added disabled property
    hasChildren: true, // Added this property to indicate it has children
    children: [
      {
        name: "Projecten",
        href: "#", // Changed from actual path to "#"
        disabled: true, // Added disabled property
      },
      {
        name: "Documenten",
        href: "#", // Changed from actual path to "#"
        disabled: true, // Added disabled property
      },
    ],
  },
] as const

const adminNavigation = [
  {
    name: "Instellingen",
    href: "/settings",
    icon: Settings,
    hasChildren: true, // Added this property to indicate it has children
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

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Set loading to false once component mounts
    setIsLoading(false);
  }, []);

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
  const isChildActive = (children?: { href: string }[]): boolean => {
    // Handle case where children might be undefined
    if (!children || !Array.isArray(children)) {
      return false;
    }
    return children.some(child => isRouteActive(child.href));
  };

  // Function to determine if an item should be blurred
  const shouldBlurItem = (itemName: string): boolean => {
    // Only blur if user is not signed in
    if (!user) return itemName !== "Zoeken";
    return false;
  };

  // CSS class for blurred items - lighter blur so text remains readable
  const blurredClass = "filter blur-[0.8px] pointer-events-none opacity-70";

  return (
    <Sidebar {...props}>
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
        <SidebarGroup className="pt-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name} className={shouldBlurItem(item.name) ? blurredClass : ""}>
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
        <SidebarGroup className={!user ? blurredClass : ""}>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {secondaryNavigation.map((item) => {
                const sectionActive = isChildActive(item.children);
                // For Dashboard, render SidebarLink instead of button with dropdown arrow
                if (!item.hasChildren) {
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarLink
                        href={item.href}
                        isActive={isRouteActive(item.href)}
                        icon={item.icon}
                        notifications={item.notifications}
                        className={cx(
                          item.disabled && "cursor-not-allowed opacity-60 pointer-events-none"
                        )}
                      >
                        {item.name}
                      </SidebarLink>
                    </SidebarMenuItem>
                  );
                }

                // For other items with children, keep the original dropdown behavior
                return (
                  <SidebarMenuItem key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cx(
                        "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base transition sm:text-sm",
                        focusRing,
                        item.disabled
                          ? "cursor-not-allowed opacity-60 text-gray-500 dark:text-gray-500"
                          : "hover:bg-gray-200/50 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                        sectionActive && !item.disabled
                          ? "bg-gray-200/70 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                          : "text-gray-900"
                      )}
                      disabled={item.disabled}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cx(
                            "size-[18px] shrink-0",
                            item.disabled
                              ? "text-gray-400 dark:text-gray-600"
                              : sectionActive && "text-blue-500 dark:text-blue-400"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                        {item.disabled && (
                          <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-500">
                            (Binnenkort)
                          </span>
                        )}
                      </div>
                      <RiArrowDownSFill
                        className={cx(
                          openMenus.includes(item.name)
                            ? "rotate-0"
                            : "-rotate-90",
                          "size-5 shrink-0 transform transition-transform duration-150 ease-in-out",
                          item.disabled
                            ? "text-gray-400 dark:text-gray-600"
                            : sectionActive
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
                              className={cx(
                                child.disabled && "cursor-not-allowed opacity-60 pointer-events-none text-gray-500 dark:text-gray-500 hover:bg-transparent"
                              )}
                              onClick={child.disabled ? (e) => e.preventDefault() : undefined}
                            >
                              {child.name}
                              {child.disabled && (
                                <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-500">
                                  (Binnenkort)
                                </span>
                              )}
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
        <SidebarGroup className={!user ? blurredClass : ""}>
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
        <UserProfile user={user} loading={isLoading} />

      </SidebarFooter>
    </Sidebar>
  )
}
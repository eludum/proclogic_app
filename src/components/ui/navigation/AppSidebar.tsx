"use client"
import { Divider } from "@/components/Divider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/Popover"
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
  useSidebar
} from "@/components/Sidebar"
import { SafeUser } from '@/lib/clerkUserUtils'
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill, RiChatSmile2Line } from "@remixicon/react"
import {
  BarChart2,
  BookmarkCheck,
  FileText,
  FolderKanban,
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
] as const

const secondaryNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    notifications: false,
    hasChildren: false,
  },
  {
    name: "Aanbevolen",
    href: "/publications",
    icon: FileText,
    hasChildren: false,
  },
  {
    name: "Mijn aanbestedingen",
    href: "/my-publications",
    icon: BookmarkCheck,
    hasChildren: false,
  },
  {
    name: "Bord",
    href: "/board",
    icon: FolderKanban,
    hasChildren: false,
  },
  {
    name: "Analyses",
    href: "/analytics",
    icon: BarChart2,
    hasChildren: false,
  },
  {
    name: "Proclogic AI",
    href: "/proclogic-ai",
    icon: RiChatSmile2Line,
    notifications: false,
    hasChildren: false,
  },
  {
    name: "Werkruimtes",
    href: "#",
    icon: Users,
    disabled: true,
    hasChildren: true,
    children: [
      {
        name: "Projecten",
        href: "#",
        disabled: true,
      },
      {
        name: "Documenten",
        href: "#",
        disabled: true,
      },
    ],
  },
] as const

const adminNavigation = [
  {
    name: "Instellingen",
    href: "/settings",
    icon: Settings,
    hasChildren: true,
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
    }
  }, []);

  const toggleMenu = (name: string) => {
    // Don't toggle menus when collapsed
    if (isCollapsed) return;

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

    // For nested routes like /settings/notifications when currentRoute is /settings/notifications
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

  // Render function for sidebar items with children
  const renderItemWithChildren = (item: any) => {
    const sectionActive = isChildActive(item.children);

    // For collapsed view, use a popover instead of expanding in-place
    if (isCollapsed) {
      return (
        <SidebarMenuItem key={item.name}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cx(
                  "flex w-full items-center justify-center rounded-md p-2 text-base transition",
                  focusRing,
                  item.disabled
                    ? "cursor-not-allowed opacity-60 text-gray-500 dark:text-gray-500"
                    : "hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-50",
                  sectionActive && !item.disabled
                    ? "bg-gray-200/70 text-astral-600 dark:bg-gray-800 dark:text-astral-400"
                    : "text-gray-900"
                )}
                disabled={item.disabled}
              >
                <item.icon
                  className={cx(
                    "size-[18px] shrink-0",
                    item.disabled
                      ? "text-gray-400 dark:text-gray-600"
                      : sectionActive && "text-astral-500 dark:text-astral-400"
                  )}
                  aria-hidden="true"
                />
                {item.disabled && <span className="absolute -top-1 -right-1 text-xs text-red-500">•</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="p-1 w-44">
              <div className="py-1 text-sm">
                <div className="px-2 py-1.5 font-medium text-gray-900 dark:text-gray-100">
                  {item.name}
                  {item.disabled && (
                    <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-400">
                      (Binnenkort)
                    </span>
                  )}
                </div>
                {item.children.map((child) => (
                  <a
                    key={child.name}
                    href={child.disabled ? "#" : child.href}
                    className={cx(
                      "block px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded",
                      isRouteActive(child.href) && "bg-gray-100 text-astral-600 dark:bg-gray-800 dark:text-astral-400",
                      child.disabled && "cursor-not-allowed opacity-60 text-gray-500 dark:text-gray-500"
                    )}
                    onClick={child.disabled ? (e) => e.preventDefault() : undefined}
                  >
                    {child.name}
                    {child.disabled && (
                      <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-400">
                        (Binnenkort)
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      );
    }

    // For expanded view, use the dropdown menu pattern - but with a button instead of a link
    return (
      <SidebarMenuItem key={item.name}>
        <button
          onClick={() => toggleMenu(item.name)}
          className={cx(
            "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base transition sm:text-sm",
            focusRing,
            item.disabled
              ? "cursor-not-allowed opacity-60 text-gray-500 dark:text-gray-500"
              : "hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-50",
            sectionActive && !item.disabled
              ? "bg-gray-200/70 text-astral-600 dark:bg-gray-800 dark:text-astral-400"
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
                  : sectionActive && "text-astral-500 dark:text-astral-400"
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
                  ? "text-astral-500 dark:text-astral-400"
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
                  href={child.disabled ? "#" : child.href}
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
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className={isCollapsed ? "py-4" : "px-3 py-4"}>
        <div className={cx(
          "flex items-center",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <span className={cx(
            "flex items-center justify-center transition-all duration-400",
            isCollapsed ? "size-8" : "size-11 rotate-360",
            // Adding a transform animation for the logo
          )}>
            <Logo className="transform transition-transform duration-300" />
          </span>
          {!isCollapsed && (
            <div>
              <span className="block text-xl font-semibold text-astral-700 dark:text-gray-50">
                ProcLogic
              </span>
            </div>
          )}
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
            <SidebarMenu className={isCollapsed ? "space-y-4" : "space-y-4"}>
              {secondaryNavigation.map((item) => (
                item.hasChildren
                  ? renderItemWithChildren(item)
                  : (
                    <SidebarMenuItem key={item.name}>
                      <SidebarLink
                        href={item.disabled ? "#" : item.href}
                        isActive={isRouteActive(item.href)}
                        icon={item.icon}
                        notifications={item.notifications}
                        className={cx(
                          item.disabled && "cursor-not-allowed opacity-60 pointer-events-none"
                        )}
                        onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                      >
                        {item.name}
                        {item.disabled && (
                          <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-500">
                            (Binnenkort)
                          </span>
                        )}
                      </SidebarLink>
                    </SidebarMenuItem>
                  )
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
              {adminNavigation.map(item => renderItemWithChildren(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile user={user} loading={isLoading} />
      </SidebarFooter>
    </Sidebar>
  );
}
"use client"

import { Button } from "@/components/Button";
import { useSidebar } from "@/components/Sidebar";
import { SafeUser } from '@/lib/clerkUserUtils';
import { cx, focusRing } from "@/lib/utils";
import { SignInButton, SignOutButton, useClerk } from '@clerk/nextjs';
import { RiLoginBoxLine, RiLogoutBoxLine } from "@remixicon/react";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ArrowAnimated } from "../ArrowAnimated";
import { DropdownUserProfile } from "./DropdownUserProfile";

// Define prop types for the component
interface UserProfileProps {
  user?: SafeUser | null;
  loading?: boolean;
}

export function UserProfile({ user, loading = false }: UserProfileProps) {
  const [mounted, setMounted] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { signOut } = useClerk();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while loading, regardless of user state
  if (loading || !mounted) {
    return (
      <div className={isCollapsed ? "px-0 py-1 flex justify-center" : "px-1 py-1"}>
        {isCollapsed ? (
          <div className="size-9 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Skeleton UI */}
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
            <div className="w-full h-10 px-1 py-2 flex items-center gap-3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md">
              <div className="size-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 flex-1 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
              <div className="size-4 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not logged in - show login button
  if (!user) {
    if (isCollapsed) {
      return (
        <SignInButton>
          <Button
            variant="ghost"
            className="size-11 rounded-full"
          >
            <RiLoginBoxLine />
          </Button>
        </SignInButton>
      )
    }

    return (
      <div className="px-1 py-1">
        <div className="flex flex-col gap-2">
          <SignInButton>
            <Button variant="light" className="w-full h-10">
              Aanmelden
              <ArrowAnimated />
            </Button>
          </SignInButton>
          <Button variant="primary" className="w-full h-10">
            Boek een demo
          </Button>
        </div>
      </div>
    )
  }

  // For logged in users with collapsed sidebar, show initials with dropdown
  if (isCollapsed) {
    const userInitials = user.fullName?.match(/(^\S\S?|\s\S)?/g)?.map(v => v?.trim())?.join("")?.match(/(^\S|\S$)?/g)?.join("")?.toLocaleUpperCase() || '';

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Add logout button above profile when collapsed */}
        <Button
          variant="ghost"
          className="size-11 rounded-full text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
          onClick={() => signOut()}
          aria-label="Uitloggen"
        >
          <RiLogoutBoxLine />
        </Button>

        {/* User profile dropdown */}
        <DropdownUserProfile user={user} align="center">
          <Button
            variant="ghost"
            className="size-9 rounded-full"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              aria-hidden="true"
            >
              {userInitials}
            </span>
          </Button>
        </DropdownUserProfile>
      </div>
    )
  }

  // Full expanded view for logged in users
  return (
    <div className="px-1 py-1">
      <div className="flex flex-col gap-2">
        <SignOutButton>
          <Button variant="light" className="w-full">
            Afmelden
          </Button>
        </SignOutButton>

        {user && (
          <DropdownUserProfile user={user}>
            <Button
              aria-label="User settings"
              variant="ghost"
              className={cx(
                "group flex w-full items-center justify-between rounded-md px-1 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 dark:hover:bg-gray-800/50 dark:data-[state=open]:bg-gray-900",
                focusRing,
              )}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  aria-hidden="true"
                >
                  {user.fullName?.match(/(^\S\S?|\s\S)?/g)?.map(v => v?.trim())?.join("")?.match(/(^\S|\S$)?/g)?.join("")?.toLocaleUpperCase() || ''}
                </span>
                <span className="truncate">{user.fullName}</span>
              </span>
              <ChevronsUpDown
                className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400"
                aria-hidden="true"
              />
            </Button>
          </DropdownUserProfile>
        )}
      </div>
    </div>
  );
}
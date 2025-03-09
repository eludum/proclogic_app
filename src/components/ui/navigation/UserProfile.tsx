"use client"

import { Button } from "@/components/Button";
import { SafeUser } from '@/lib/clerkUserUtils';
import { cx, focusRing } from "@/lib/utils";
import { SignInButton, SignOutButton } from '@clerk/nextjs';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while loading, regardless of user state
  if (loading || !mounted) {
    return (
      <div className="px-1 py-1">
        <div className="flex flex-col gap-2">
          {/* Skeleton UI */}
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
          <div className="w-full h-10 px-1 py-2 flex items-center gap-3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md">
            <div className="size-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-4 flex-1 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
            <div className="size-4 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of component remains the same
  const hasUser = Boolean(user);
  return (
    <div className="px-1 py-1">
      {!hasUser ? (
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
      ) : (
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
      )}
    </div>
  );
}
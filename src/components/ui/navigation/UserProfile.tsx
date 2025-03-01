"use client"

import { Button } from "@/components/Button";
import { cx, focusRing } from "@/lib/utils";
import { ChevronsUpDown, LoaderIcon } from "lucide-react";

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { ArrowAnimated } from "../ArrowAnimated";
import { DropdownUserProfile } from "./DropdownUserProfile";


export function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    return <div className="flex items-center justify-center">< LoaderIcon size={32} className="animate-spin text-emerald-600" /></div>
  }

  return (
    <>
      {!isSignedIn ? (
        <>
          <SignInButton><Button variant="light">Aanmelden
            <ArrowAnimated /></Button></SignInButton>
          <Button variant="primary">Boek een demo</Button>
        </>
      ) : (
        <>
          <SignOutButton><Button variant="light">Afmelden <ArrowAnimated /></Button></SignOutButton>

          <DropdownUserProfile>
            <Button
              aria-label="User settings"
              variant="ghost"
              className={cx(
                "group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
                focusRing,
              )}
            >
              <span className="flex items-center gap-3">
                {user && (
                  <>
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      aria-hidden="true"
                    >
                      {user.fullName.match(/(^\S\S?|\s\S)?/g)?.map(v => v.trim())?.join("")?.match(/(^\S|\S$)?/g)?.join("")?.toLocaleUpperCase()}
                    </span>
                    <span>{user.primaryEmailAddress?.emailAddress}</span>
                  </>
                )}
              </span>
              <ChevronsUpDown
                className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
                aria-hidden="true"
              />
            </Button>
          </DropdownUserProfile>
        </>
      )
      }

    </>
  )
}

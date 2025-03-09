"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/DropdownMenu";
import { SafeUser } from '@/lib/clerkUserUtils';
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export type DropdownUserProfileProps = {
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  user: null | SafeUser;
}

export function DropdownUserProfile({
  children,
  align = "start",
  user
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="sm:min-w-[calc(var(--radix-dropdown-menu-trigger-width))]!"
        >
          <DropdownMenuLabel>{user && user.emailAddress}</DropdownMenuLabel>
          {/* Theme selector commented out in the original code */}
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Changelog
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500 dark:text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Documentation
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Join Slack community
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
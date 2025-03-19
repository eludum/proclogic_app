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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, render a div with the children to maintain layout
  if (!mounted) {
    return <div>{children}</div>;
  }

  // Important: Ensure we have exactly one React element as children
  // or Radix UI's DropdownMenuTrigger with asChild will throw an error
  let triggerElement = children;

  // If children is an array or not a valid element, wrap in a div
  if (React.Children.count(children) !== 1) {
    triggerElement = <div>{children}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerElement}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="sm:min-w-[calc(var(--radix-dropdown-menu-trigger-width))]!"
      >
        <DropdownMenuLabel>{user && user.emailAddress}</DropdownMenuLabel>
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
  );
}
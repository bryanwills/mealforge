"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

function UserMenuWithAuth() {
  // TODO: Implement better-auth session management
  const session = null;
  const status = "unauthenticated";

  const handleSignOut = async () => {
    try {
      // TODO: Implement better-auth sign-out
      console.log("Sign out");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Since session is null, only show sign-in button
  return (
    <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
      Sign In
    </Button>
  );
}

export function UserMenu() {
  return <UserMenuWithAuth />;
}
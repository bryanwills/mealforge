"use client";

import { useSession, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (status === "loading") {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            ...
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
        Sign In
      </Button>
    );
  }

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-orange-50 dark:hover:bg-gray-800">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-orange-200 dark:border-gray-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-800 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-gray-600 dark:text-gray-300">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-orange-200 dark:bg-gray-700" />
        <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-800 hover:text-orange-700 dark:hover:text-orange-400">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-800 hover:text-orange-700 dark:hover:text-orange-400">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-orange-200 dark:bg-gray-700" />
        <DropdownMenuItem
          className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-800 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  return <UserMenuWithAuth />;
}
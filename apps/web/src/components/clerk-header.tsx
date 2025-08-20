"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
  useClerk,
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

export function ClerkHeader() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log('Redirecting to sign-in...');
      // Don't call signOut() since it's causing Server Action issues
      // Just redirect to sign-in page and let Clerk handle the auth state
      router.push('/sign-in');
    } catch (error) {
      console.error('Error during redirect:', error);
      // Fallback: redirect to sign-in page
      router.push('/sign-in');
    }
  };

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <SignedOut>
        <SignInButton />
        <SignUpButton>
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-orange-50 dark:hover:bg-gray-800">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-orange-200 dark:border-gray-700" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-800 dark:text-white">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs leading-none text-gray-600 dark:text-gray-300">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-orange-200 dark:bg-gray-700" />
            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-400">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-400">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-orange-200 dark:bg-gray-700" />
            <DropdownMenuItem
              className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
    </header>
  );
}

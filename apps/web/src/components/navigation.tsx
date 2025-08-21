"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat, Home, BookOpen, Calendar, ShoppingCart } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/recipes", label: "Recipes", icon: BookOpen },
    { href: "/meal-plans", label: "Meal Plans", icon: Calendar },
    { href: "/grocery-lists", label: "Grocery Lists", icon: ShoppingCart },
  ];

  return (
    <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <ChefHat className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">MealForge</h1>
              </div>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`transition-all duration-200 hover:scale-105 ${
                      isActive
                        ? "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
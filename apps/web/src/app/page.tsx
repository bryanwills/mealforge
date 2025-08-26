import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Calendar, ShoppingCart, ChefHat, Search } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default async function Home() {
  // TODO: Implement proper authentication with better-auth
  // For now, show a simple welcome page

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Welcome to MealForge</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your comprehensive recipe management and meal planning solution
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/recipes">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">Recipes</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Saved recipes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meal-plans">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">Meal Plans</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Active plans
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/grocery-lists">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">Grocery Lists</CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Active lists
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ingredients">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">Ingredients</CardTitle>
                <ChefHat className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Available ingredients
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Authentication Notice */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            Authentication Coming Soon
          </h3>
          <p className="text-orange-700 dark:text-orange-300 mb-4">
            We're currently setting up better-auth for secure authentication. Sign-in functionality will be available shortly.
          </p>
          <Link href="/sign-in">
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-800">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

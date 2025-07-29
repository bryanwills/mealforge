import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Calendar, ShoppingCart, ChefHat, Search } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500 dark:text-orange-400" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">MealForge</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/recipes">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Recipes</Button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Explore</Button>
              </Link>
              <Link href="/meal-plans">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Meal Plans</Button>
              </Link>
              <Link href="/grocery-lists">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Grocery Lists</Button>
              </Link>
              <ThemeToggle />
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

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
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</div>
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
                  In database
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Create Recipe</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Add a new recipe to your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mt-auto">
                <Link href="/recipes/new">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Recipe
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Explore Recipes</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Discover recipes from around the web
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mt-auto">
                <Link href="/explore">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                    <Search className="mr-2 h-4 w-4" />
                    Explore
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Plan Meals</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Create a meal plan for the week
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mt-auto">
                <Link href="/meal-plans/new">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    New Meal Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Grocery List</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Generate a grocery list from your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mt-auto">
                <Link href="/grocery-lists/new">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    New Grocery List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

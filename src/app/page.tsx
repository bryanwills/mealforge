import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Calendar, ShoppingCart, ChefHat } from "lucide-react";
import { UserMenu } from "@/components/user-menu";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="border-b border-orange-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-800">MealForge</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/recipes">
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">Recipes</Button>
              </Link>
              <Link href="/meal-plans">
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">Meal Plans</Button>
              </Link>
              <Link href="/grocery-lists">
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">Grocery Lists</Button>
              </Link>
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to MealForge</h2>
          <p className="text-gray-600">
            Your comprehensive recipe management and meal planning solution
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Recipes</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-gray-600">
                Total recipes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Meal Plans</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-gray-600">
                Active plans
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Grocery Lists</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-gray-600">
                Active lists
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Ingredients</CardTitle>
              <ChefHat className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-gray-600">
                In database
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-gray-800">Create Recipe</CardTitle>
              <CardDescription className="text-gray-600">
                Add a new recipe to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recipes/new">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-gray-800">Plan Meals</CardTitle>
              <CardDescription className="text-gray-600">
                Create a meal plan for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/meal-plans/new">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Meal Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-gray-800">Grocery List</CardTitle>
              <CardDescription className="text-gray-600">
                Generate a grocery list from your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/grocery-lists/new">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  New Grocery List
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

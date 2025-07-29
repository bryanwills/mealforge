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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MealForge</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/recipes">
                <Button variant="ghost">Recipes</Button>
              </Link>
              <Link href="/meal-plans">
                <Button variant="ghost">Meal Plans</Button>
              </Link>
              <Link href="/grocery-lists">
                <Button variant="ghost">Grocery Lists</Button>
              </Link>
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to MealForge</h2>
          <p className="text-muted-foreground">
            Your comprehensive recipe management and meal planning solution
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recipes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total recipes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grocery Lists</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active lists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                In database
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Recipe</CardTitle>
              <CardDescription>
                Add a new recipe to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recipes/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Meals</CardTitle>
              <CardDescription>
                Create a meal plan for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/meal-plans/new">
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Meal Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grocery List</CardTitle>
              <CardDescription>
                Generate a grocery list from your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/grocery-lists/new">
                <Button className="w-full">
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

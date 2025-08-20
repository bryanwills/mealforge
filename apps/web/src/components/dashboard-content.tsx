"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Calendar, ShoppingCart, ChefHat, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  savedRecipes: number;
  mealPlans: number;
  groceryLists: number;
  ingredients: number;
}

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Let's create something delicious today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-orange-500" />
              New Recipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new recipe from scratch
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-blue-500" />
              Import Recipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import from URL or video
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-500" />
              Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plan your weekly meals
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5 text-purple-500" />
              Grocery List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create shopping lists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.savedRecipes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Your recipe collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ingredients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique ingredients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mealPlans || 0}</div>
            <p className="text-xs text-muted-foreground">
              Weekly plans created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grocery Lists</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.groceryLists || 0}</div>
            <p className="text-xs text-muted-foreground">
              Shopping lists made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>
              Your latest culinary creations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">No recent recipes</p>
                  <p className="text-sm text-gray-500">Start cooking to see your activity here</p>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Recipes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/recipes/new">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Recipe
                </Button>
              </Link>
              <Link href="/recipes/import">
                <Button className="w-full" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Import Recipe
                </Button>
              </Link>
              <Link href="/meal-plans">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan Meals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

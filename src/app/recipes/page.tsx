"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Globe, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { RecipeCard, type Recipe } from "@/components/recipe-card"

export default function RecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await fetch('/api/recipes/saved')
        if (response.ok) {
          const data = await response.json()
          // For now, we'll use mock data for the saved recipes
          // In a real app, you'd fetch the full recipe details from your database
          const mockSavedRecipes: Recipe[] = [
            {
              id: 'external-1',
              title: 'Spaghetti Carbonara',
              description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
              image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
              cookingTime: 20,
              servings: 4,
              difficulty: 'Medium',
              tags: ['Italian', 'Pasta', 'Quick'],
              source: 'external',
              externalId: '1',
              externalSource: 'Spoonacular',
              rating: 4.5,
              isSaved: true
            },
            {
              id: 'external-2',
              title: 'Chicken Tikka Masala',
              description: 'Creamy and flavorful Indian curry with tender chicken',
              image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
              cookingTime: 45,
              servings: 6,
              difficulty: 'Medium',
              tags: ['Indian', 'Curry', 'Spicy'],
              source: 'external',
              externalId: '2',
              externalSource: 'Spoonacular',
              rating: 4.8,
              isSaved: true
            }
          ]
          setSavedRecipes(mockSavedRecipes)
        }
      } catch (error) {
        console.error('Failed to fetch saved recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedRecipes()
  }, [])

  const handleSaveRecipe = (recipe: Recipe) => {
    // Remove from saved recipes when unsaved
    setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))
  }

  const handleViewRecipe = (recipe: Recipe) => {
    // Navigate to recipe detail page
    window.location.href = `/recipes/${recipe.id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Link href="/explore">
                <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                  <Globe className="mr-2 h-4 w-4" />
                  Explore
                </Button>
              </Link>
              <Link href="/recipes/new">
                <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">My Recipes</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your saved recipe collection
          </p>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your recipes...</span>
            </div>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Empty State */}
            <Card className="col-span-full text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No saved recipes yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Save recipes from the explore page to see them here
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/recipes/new">
                      <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Recipe
                      </Button>
                    </Link>
                    <Link href="/explore">
                      <Button variant="outline" className="border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                        <Globe className="mr-2 h-4 w-4" />
                        Explore Recipes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSave={handleSaveRecipe}
                onView={handleViewRecipe}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
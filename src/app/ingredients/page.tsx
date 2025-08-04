<<<<<<< Updated upstream
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChefHat, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
=======
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ChefHat, ArrowLeft, Loader2, Package, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { formatShoppingQuantity } from "@/lib/ingredient-conversions"

interface UserIngredient {
  id: string
  name: string
  unit: string
  totalQuantity: number
  recipes: string[]
  category?: string
  originalQuantity?: number
  originalUnit?: string
}
>>>>>>> Stashed changes

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<UserIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ingredients')
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients')
      }
      const data = await response.json()
      setIngredients(data.ingredients || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'protein':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'vegetable':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'fruit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'dairy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'grain':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'spice':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-gray-600 dark:text-gray-300">Loading ingredients...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button onClick={fetchIngredients} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
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
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/ingredients/new">
                <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Ingredients</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ingredients from your saved recipes
          </p>
        </div>

        {/* Ingredients Grid */}
        {ingredients.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Empty State */}
            <Card className="col-span-full text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <ChefHat className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No ingredients yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Add recipes to see your ingredients here
                    </p>
                  </div>
                  <Link href="/recipes">
                    <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                      <Package className="mr-2 h-4 w-4" />
                      View Recipes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ingredients.map((ingredient) => (
              <Card key={`${ingredient.name}-${ingredient.unit}`} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                      {ingredient.name}
                    </CardTitle>
                    <Badge className={getCategoryColor(ingredient.category || 'unknown')}>
                      {ingredient.category || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Needed:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {formatShoppingQuantity(ingredient.totalQuantity, ingredient.unit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Used in:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {ingredient.recipes.length} {ingredient.recipes.length === 1 ? 'recipe' : 'recipes'}
                    </span>
                  </div>
                  {ingredient.recipes.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recipes:</p>
                      <div className="space-y-1">
                        {ingredient.recipes.slice(0, 3).map((recipe, index) => (
                          <p key={index} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            • {recipe}
                          </p>
                        ))}
                        {ingredient.recipes.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{ingredient.recipes.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
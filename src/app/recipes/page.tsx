"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Globe, Loader2, Upload } from "lucide-react"
import { Navigation } from "@/components/navigation"
<<<<<<< Updated upstream
import { RecipeCard, type Recipe } from "@/components/recipe-card"
import { RecipeModal } from "@/components/recipe-modal"
=======
import { Plus, Search, Filter, Globe, Upload, Loader2 } from "lucide-react"
import { RecipeCard, type Recipe } from "@/components/recipe-card"
import { RecipeModal } from "@/components/recipe-modal"

interface DatabaseRecipe {
  id: string
  title: string
  description?: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings: number
  difficulty?: string
  tags: string[]
  instructions: string[]
  sourceUrl?: string
  isPublic: boolean
  importSource?: string
  createdAt: string
  updatedAt: string
  ingredients: Array<{
    id: string
    unit: string
    quantity: number
    notes?: string
    isOptional: boolean
    order: number
    ingredient: {
      id: string
      name: string
      category?: string
    }
  }>
}
>>>>>>> Stashed changes

export default function RecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

<<<<<<< Updated upstream
  const handleSaveRecipe = (recipe: Recipe) => {
    // Remove from saved recipes when unsaved
    setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))
=======
  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recipes')
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      const data = await response.json()
      setRecipes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes')
    } finally {
      setLoading(false)
    }
  }

  const convertDatabaseRecipeToUIRecipe = (dbRecipe: DatabaseRecipe): Recipe => {
    const totalTime = (dbRecipe.prepTime || 0) + (dbRecipe.cookTime || 0)

    return {
      id: dbRecipe.id,
      title: dbRecipe.title,
      description: dbRecipe.description || '',
      image: dbRecipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop',
      cookingTime: totalTime,
      servings: dbRecipe.servings,
      difficulty: dbRecipe.difficulty || 'Medium',
      tags: dbRecipe.tags,
      rating: 4.5, // TODO: Implement rating system
      source: dbRecipe.importSource ? 'external' as const : 'personal' as const,
      isSaved: true, // All recipes on this page are saved by definition
      externalSource: dbRecipe.importSource
    }
>>>>>>> Stashed changes
  }

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

<<<<<<< Updated upstream
=======
  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      // Since these are already saved recipes, this would be an unsave action
      const response = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          action: 'unsave'
        })
      })

      if (response.ok) {
        // Remove the recipe from the list
        setRecipes(prev => prev.filter(r => r.id !== recipe.id))
      } else {
        console.error('Failed to unsave recipe')
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-gray-600 dark:text-gray-300">Loading recipes...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button onClick={fetchRecipes} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">My Recipes</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your saved recipe collection
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
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
          <Link href="/recipes/import">
            <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </Link>
          <Link href="/recipes/new">
            <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Recipe
            </Button>
          </Link>
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

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedRecipe(null)
          }}
          onDelete={(recipe) => {
            // Remove the recipe from the list when deleted
            setRecipes(prev => prev.filter(r => r.id !== recipe.id))
            setIsModalOpen(false)
            setSelectedRecipe(null)
          }}
        />
      )}
    </div>
  )
}
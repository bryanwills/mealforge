"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Globe, Loader2, Upload } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { RecipeCard, type Recipe } from "@/components/recipe-card"
import { RecipeModal } from "@/components/recipe-modal"

export default function RecipesPage() {
  const [personalRecipes, setPersonalRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Fetch personal recipes
        const personalResponse = await fetch('/api/recipes/personal')
        if (personalResponse.ok) {
          const personalData = await personalResponse.json()
          setPersonalRecipes(personalData.recipes)
        }

        // Fetch saved recipes (external recipes)
        const savedResponse = await fetch('/api/recipes/saved')
        if (savedResponse.ok) {
          const savedData = await savedResponse.json()

          // Update saved recipes with proper saved state
          const savedRecipesWithState = savedData.savedRecipes.map((recipe: any) => ({
            ...recipe,
            isSaved: true
          }))

          setSavedRecipes(savedRecipesWithState)
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const handleSaveRecipe = (recipe: Recipe) => {
    // Remove from saved recipes when unsaved
    setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))
  }

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  const allRecipes = [...personalRecipes, ...savedRecipes]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">My Recipes</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your personal recipes and saved favorites
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
        ) : allRecipes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Empty State */}
            <Card className="col-span-full text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No recipes yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create your first recipe or save some from the explore page
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
            {allRecipes.map((recipe) => (
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
        />
      )}
    </div>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Plus, Search, Filter, Globe, Upload } from "lucide-react"
import { RecipeModal } from "@/components/recipe-modal"
import { RecipeCard, type Recipe } from "@/components/recipe-card"

export default function RecipesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Mock data for demonstration
  const savedRecipes: Recipe[] = [
    {
      id: "1",
      title: "Spaghetti Carbonara",
      description: "Classic Italian pasta dish with eggs, cheese, and pancetta",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      cookingTime: 25,
      servings: 4,
      difficulty: "Medium",
      tags: ["Italian", "Pasta", "Quick"],
      rating: 4.5,
      source: "personal" as const
    },
    {
      id: "2",
      title: "Chicken Tikka Masala",
      description: "Creamy and flavorful Indian curry with tender chicken",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
      cookingTime: 45,
      servings: 6,
      difficulty: "Medium",
      tags: ["Indian", "Curry", "Chicken"],
      rating: 4.8,
      source: "personal" as const
    },
    {
      id: "3",
      title: "Chocolate Chip Cookies",
      description: "Soft and chewy cookies with chocolate chips",
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
      cookingTime: 30,
      servings: 24,
      difficulty: "Easy",
      tags: ["Dessert", "Baking", "Chocolate"],
      rating: 4.9,
      source: "personal" as const
    }
  ]

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    // TODO: Implement save functionality
    console.log("Saving recipe:", recipe.title)
  }

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
        {/* loading state removed */}
        {savedRecipes.length === 0 ? (
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
        />
      )}
    </div>
  )
}
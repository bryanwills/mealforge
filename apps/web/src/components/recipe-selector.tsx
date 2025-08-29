"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Clock, Users, Loader2, Plus } from "lucide-react"
import Image from "next/image"

interface Recipe {
  id: string
  title: string
  description?: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings: number
  difficulty?: string
  tags: string[]
}

interface RecipeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recipeId: string, servings: number) => void
}

export function RecipeSelector({ isOpen, onClose, onSelect }: RecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [servings, setServings] = useState(1)

  useEffect(() => {
    if (isOpen) {
      fetchRecipes()
    }
  }, [isOpen])

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        setRecipes(data)
      } else {
        console.error('Failed to fetch recipes')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setServings(recipe.servings) // Default to recipe's serving size
  }

  const handleConfirmSelection = () => {
    if (selectedRecipe) {
      onSelect(selectedRecipe.id, servings)
    }
  }

  if (selectedRecipe) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-white">Confirm Recipe Selection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="border-orange-200 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-800 dark:text-white">{selectedRecipe.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedRecipe.imageUrl && (
                  <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={selectedRecipe.imageUrl}
                      alt={selectedRecipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {selectedRecipe.cookTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedRecipe.cookTime} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedRecipe.servings} servings</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings" className="text-gray-700 dark:text-gray-300">
                    Number of servings needed:
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedRecipe(null)}
                variant="outline"
                className="flex-1 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmSelection}
                className="flex-1 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Meal Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-white">Select a Recipe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No recipes found matching your search.' : 'No saved recipes found.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <Card 
                    key={recipe.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <CardHeader className="pb-2">
                      {recipe.imageUrl && (
                        <div className="relative h-32 w-full mb-2 rounded-lg overflow-hidden">
                          <Image
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-sm text-gray-800 dark:text-white line-clamp-2">
                        {recipe.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {recipe.cookTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{recipe.cookTime}m</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
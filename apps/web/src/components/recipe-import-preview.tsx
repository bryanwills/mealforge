"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, XCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ImportedRecipeData } from "@/lib/url-import-service";

interface RecipeImportPreviewProps {
  recipe: ImportedRecipeData
  onSave: () => void
  onCancel: () => void
  isProcessing: boolean
}

export function RecipeImportPreview({
  recipe,
  onSave,
  onCancel,
  isProcessing
}: RecipeImportPreviewProps) {
  // Ensure all required arrays exist with defaults
  const safeRecipe = {
    ...recipe,
    tags: recipe.tags || [],
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || []
  }

  const [editingRecipe, setEditingRecipe] = useState<ImportedRecipeData>(safeRecipe)
  const [newTag, setNewTag] = useState('')

  const updateField = (field: keyof ImportedRecipeData, value: unknown) => {
    console.log('Updating field:', field, 'with value:', value)
    setEditingRecipe(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addIngredient = () => {
    console.log('Adding ingredient')
    setEditingRecipe(prev => ({
      ...prev,
      ingredients: [
        ...(prev.ingredients || []),
        { quantity: 1, unit: 'piece', name: '', notes: '' }
      ]
    }))
  }

  const updateIngredient = (index: number, field: 'quantity' | 'unit' | 'name' | 'notes', value: string | number) => {
    setEditingRecipe(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }))
  }

  const removeIngredient = (index: number) => {
    setEditingRecipe(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }))
  }

  const addInstruction = () => {
    setEditingRecipe(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setEditingRecipe(prev => ({
      ...prev,
      instructions: (prev.instructions || []).map((instruction, i) =>
        i === index ? value : instruction
      )
    }))
  }

  const removeInstruction = (index: number) => {
    setEditingRecipe(prev => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag && !editingRecipe.tags?.includes(newTag)) {
      setEditingRecipe(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setEditingRecipe(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    // Send the edited recipe data to the parent component
    onSave()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation component would go here if it were defined */}

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Review Imported Recipe</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Review and edit the imported recipe before saving
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Recipe
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information and Tags */}
          <div className="space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    value={editingRecipe.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="border-orange-200 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingRecipe.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    className="border-orange-200 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={editingRecipe.prepTime}
                      onChange={(e) => updateField('prepTime', parseInt(e.target.value) || 0)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      value={editingRecipe.cookTime}
                      onChange={(e) => updateField('cookTime', parseInt(e.target.value) || 0)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={editingRecipe.servings}
                      onChange={(e) => updateField('servings', parseInt(e.target.value) || 1)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={editingRecipe.difficulty}
                      onChange={(e) => updateField('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-orange-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Input
                    id="cuisine"
                    value={editingRecipe.cuisine}
                    onChange={(e) => updateField('cuisine', e.target.value)}
                    className="border-orange-200 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags Card - Moved back to left column */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editingRecipe.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="flex-1 border-orange-200 dark:border-gray-600"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag()
                      }
                    }}
                  />
                  <Button onClick={addTag} size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recipe Image and Nutritional Info */}
          <div className="space-y-6">
            {/* Recipe Image */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Recipe Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-orange-200 dark:border-gray-600 flex items-center justify-center">
                    {editingRecipe.imageUrl ? (
                      <img
                        src={editingRecipe.imageUrl}
                        alt={editingRecipe.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Plus className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <p className="text-sm">No image available</p>
                        <p className="text-xs">Image will be extracted from URL</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Or drag and drop an image here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Information */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Nutritional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carbs">Carbohydrates (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fiber">Fiber (g)</Label>
                      <Input
                        id="fiber"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sugar">Sugar (g)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="border-orange-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Nutritional information will be extracted from the recipe URL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width - Ingredients */}
        <Card className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 dark:text-white">Ingredients</CardTitle>
              <Button
                onClick={addIngredient}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Column Headers - Centered */}
              <div className="grid grid-cols-12 gap-2 items-center font-medium text-sm text-gray-600 dark:text-gray-400 pb-2 border-b border-orange-200 dark:border-gray-600">
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-6 text-center">Ingredient Name</div>
                <div className="col-span-1 text-center">Notes</div>
                <div className="col-span-1"></div>
              </div>

              {editingRecipe.ingredients?.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.25"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-center border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-6">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      value={ingredient.notes}
                      onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                      className="border-orange-200 dark:border-gray-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      onClick={() => removeIngredient(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Width - Instructions */}
        <Card className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 dark:text-white">Instructions</CardTitle>
              <Button
                onClick={addInstruction}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Instruction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editingRecipe.instructions?.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-400">
                    {index + 1}
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 border-orange-200 dark:border-gray-600"
                    rows={2}
                  />
                  <Button
                    onClick={() => removeInstruction(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
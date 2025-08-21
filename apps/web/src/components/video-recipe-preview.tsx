'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CheckCircle, Edit3, Eye, EyeOff } from 'lucide-react'
import { VideoImportResult, ImportedRecipeData } from '@/lib/video-import-service'

interface VideoRecipePreviewProps {
  importResult: VideoImportResult
  onSave: (recipe: ImportedRecipeData) => void
}

interface VideoMetadata {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'custom'
  title: string
  description: string
  creator: string
  duration: number
  aspectRatio: 'vertical' | 'horizontal' | 'square'
  resolution: { width: number; height: number }
  format: string
  size: number
  uploadDate?: Date
  viewCount?: number
  likes?: number
}

export function VideoRecipePreview({ importResult, onSave }: VideoRecipePreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState<ImportedRecipeData>(importResult.recipe)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    onSave(editedRecipe)
  }

  const handleCancel = () => {
    setEditedRecipe(importResult.recipe)
    setIsEditing(false)
  }

  const handleFieldChange = (field: keyof ImportedRecipeData, value: string | number | boolean | string[]) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIngredientChange = (index: number, field: 'quantity' | 'unit' | 'name' | 'notes', value: string | number) => {
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const handleInstructionChange = (index: number, value: string) => {
    setEditedRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      )
    }))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High'
    if (confidence >= 0.7) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  const getVideoMetadata = () => {
    if (!importResult) return null

    return {
      platform: importResult.videoMetadata?.platform || 'custom',
      title: importResult.videoMetadata?.title || 'Unknown',
      creator: importResult.videoMetadata?.creator || 'Unknown',
      duration: importResult.videoMetadata?.duration || 0,
      format: importResult.videoMetadata?.format || 'unknown'
    }
  }

  const metadata = getVideoMetadata()

  return (
    <div className="space-y-6">
      {/* Video Metadata */}
      {metadata && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Video Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Platform</Label>
              <p className="font-medium capitalize">{metadata.platform}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Title</Label>
              <p className="font-medium truncate">{metadata.title}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Creator</Label>
              <p className="font-medium">{metadata.creator}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Duration</Label>
              <p className="font-medium">{Math.round(metadata.duration / 60)}m {metadata.duration % 60}s</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Extraction Confidence
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI analysis confidence score
              </p>
            </div>
            <Badge className={`px-3 py-1 text-sm font-medium ${getConfidenceColor(importResult.confidence)}`}>
              {Math.round(importResult.confidence * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Extracted Recipe</CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={editedRecipe.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.title}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedRecipe.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="mt-1 text-gray-600 dark:text-gray-400">{editedRecipe.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              {isEditing ? (
                <Input
                  id="prepTime"
                  type="number"
                  value={editedRecipe.prepTime}
                  onChange={(e) => handleFieldChange('prepTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.prepTime}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              {isEditing ? (
                <Input
                  id="cookTime"
                  type="number"
                  value={editedRecipe.cookTime}
                  onChange={(e) => handleFieldChange('cookTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.cookTime}</p>
              )}
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              {isEditing ? (
                <Input
                  id="servings"
                  type="number"
                  value={editedRecipe.servings}
                  onChange={(e) => handleFieldChange('servings', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.servings}</p>
              )}
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              {isEditing ? (
                <select
                  id="difficulty"
                  value={editedRecipe.difficulty}
                  onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              ) : (
                <p className="mt-1 font-medium capitalize">{editedRecipe.difficulty}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            {isEditing ? (
              <Input
                id="tags"
                value={editedRecipe.tags.join(', ')}
                onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                className="mt-1"
                placeholder="Enter tags separated by commas"
              />
            ) : (
              <div className="mt-1 flex flex-wrap gap-2">
                {editedRecipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            <div className="mt-2 space-y-2">
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        step="0.25"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        placeholder="Qty"
                      />
                      <Input
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className="w-24"
                        placeholder="Unit"
                      />
                      <Input
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="flex-1"
                        placeholder="Ingredient name"
                      />
                      <Input
                        value={ingredient.notes}
                        onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                        className="w-32"
                        placeholder="Notes"
                      />
                    </>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-medium">{ingredient.quantity}</span>
                      <span className="text-gray-600 dark:text-gray-400">{ingredient.unit}</span>
                      <span className="flex-1">{ingredient.name}</span>
                      {ingredient.notes && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">({ingredient.notes})</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label>Instructions</Label>
            <div className="mt-2 space-y-2">
              {editedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    {index + 1}.
                  </span>
                  {isEditing ? (
                    <Textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                      placeholder="Enter instruction step"
                    />
                  ) : (
                    <p className="flex-1 mt-2">{instruction}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

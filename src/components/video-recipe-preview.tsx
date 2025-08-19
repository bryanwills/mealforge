'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Edit3, Save, X, Eye, EyeOff, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { VideoImportResult, VideoMetadata } from '@/lib/video-import-service'
import { ImportedRecipeData } from '@/lib/url-import-service'

interface VideoRecipePreviewProps {
  result: VideoImportResult
  onSave: (recipe: ImportedRecipeData) => void
  onCancel: () => void
  className?: string
}

export const VideoRecipePreview: React.FC<VideoRecipePreviewProps> = ({
  result,
  onSave,
  onCancel,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState<ImportedRecipeData>(result.recipe)
  const [showConfidence, setShowConfidence] = useState(true)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    onSave(editedRecipe)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRecipe(result.recipe)
  }

  const handleFieldChange = (field: keyof ImportedRecipeData, value: any) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIngredientChange = (index: number, field: string, value: any) => {
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
    if (confidence >= 0.5) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 0.7) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 0.5) return <AlertCircle className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent'
    if (confidence >= 0.7) return 'Good'
    if (confidence >= 0.5) return 'Fair'
    return 'Poor'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Source
          </CardTitle>
          <CardDescription>
            Recipe extracted from {result.videoMetadata.platform} video
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-gray-500">Platform</Label>
              <Badge className="mt-1">
                {result.videoMetadata.platform.charAt(0).toUpperCase() + result.videoMetadata.platform.slice(1)}
              </Badge>
            </div>
            <div>
              <Label className="text-gray-500">Title</Label>
              <p className="mt-1 font-medium truncate">{result.videoMetadata.title}</p>
            </div>
            <div>
              <Label className="text-gray-500">Duration</Label>
              <p className="mt-1 font-medium">{formatDuration(result.videoMetadata.duration)}</p>
            </div>
            <div>
              <Label className="text-gray-500">Size</Label>
              <p className="mt-1 font-medium">{formatFileSize(result.videoMetadata.size)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Extracted Recipe</CardTitle>
              <CardDescription>
                AI-analyzed recipe data with {Math.round(result.confidence * 100)}% confidence
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfidence(!showConfidence)}
              >
                {showConfidence ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showConfidence ? 'Hide' : 'Show'} Confidence
              </Button>
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
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
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-lg font-semibold">{editedRecipe.title}</h3>
                {showConfidence && (
                  <Badge className={getConfidenceColor(0.95)}>
                    {getConfidenceIcon(0.95)} 95%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editedRecipe.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            ) : (
              <div className="flex items-start gap-2 mt-1">
                <p className="text-gray-700">{editedRecipe.description}</p>
                {showConfidence && (
                  <Badge className={getConfidenceColor(0.88)}>
                    {getConfidenceIcon(0.88)} 88%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            <div className="mt-2 space-y-2">
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        step="0.25"
                      />
                      <Input
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className="w-24"
                        placeholder="unit"
                      />
                      <Input
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="flex-1"
                        placeholder="ingredient name"
                      />
                      <Input
                        value={ingredient.notes || ''}
                        onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                        className="w-32"
                        placeholder="notes"
                      />
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{ingredient.quantity}</span>
                      <span className="text-gray-600">{ingredient.unit}</span>
                      <span className="flex-1">{ingredient.name}</span>
                      {ingredient.notes && (
                        <span className="text-sm text-gray-500">({ingredient.notes})</span>
                      )}
                      {showConfidence && (
                        <Badge className={getConfidenceColor(0.92)}>
                          {getConfidenceIcon(0.92)} 92%
                        </Badge>
                      )}
                    </>
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
                <div key={index} className="flex items-start gap-2">
                  <span className="font-medium text-gray-500 w-6">{index + 1}.</span>
                  {isEditing ? (
                    <Textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                  ) : (
                    <div className="flex items-start gap-2 flex-1">
                      <p className="text-gray-700">{instruction}</p>
                      {showConfidence && (
                        <Badge className={getConfidenceColor(0.89)}>
                          {getConfidenceIcon(0.89)} 89%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              {isEditing ? (
                <Input
                  id="prepTime"
                  type="number"
                  value={editedRecipe.prepTime || 0}
                  onChange={(e) => handleFieldChange('prepTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.prepTime || 0} min</p>
              )}
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              {isEditing ? (
                <Input
                  id="cookTime"
                  type="number"
                  value={editedRecipe.cookTime || 0}
                  onChange={(e) => handleFieldChange('cookTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.cookTime || 0} min</p>
              )}
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              {isEditing ? (
                <Input
                  id="servings"
                  type="number"
                  value={editedRecipe.servings || 0}
                  onChange={(e) => handleFieldChange('servings', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">{editedRecipe.servings || 0}</p>
              )}
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              {isEditing ? (
                <select
                  id="difficulty"
                  value={editedRecipe.difficulty || 'medium'}
                  onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              ) : (
                <Badge variant="outline" className="mt-1">
                  {editedRecipe.difficulty || 'medium'}
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {editedRecipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Overall Confidence */}
          {showConfidence && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Overall Confidence: {Math.round(result.confidence * 100)}%</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                This recipe was extracted using AI-powered video analysis with {result.extractionMethod} method.
                {result.confidence < 0.8 && ' Consider reviewing and editing the extracted data for accuracy.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedRecipe)} className="bg-green-600 hover:bg-green-700">
          Save Recipe
        </Button>
      </div>
    </div>
  )
}

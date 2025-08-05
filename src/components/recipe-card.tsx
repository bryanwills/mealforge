"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, Users, ExternalLink, Home, Star } from "lucide-react"
import Image from "next/image"

export interface Recipe {
  id: string
  title: string
  description?: string
  image?: string
  cookingTime?: number
  prepTime?: number
  servings?: number
  difficulty?: string
  tags?: string[]
  source: "personal" | "external"
  externalId?: string
  externalSource?: string
  isSaved?: boolean
  rating?: number
  externalUrl?: string
}

interface RecipeCardProps {
  recipe: Recipe
  onSave?: (recipe: Recipe) => void
  onView?: (recipe: Recipe) => void
  showSourceIndicator?: boolean
}

export function RecipeCard({ recipe, onSave, onView, showSourceIndicator = true }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false)

  // Update the saved state when the recipe prop changes
  useEffect(() => {
    setIsSaved(recipe.isSaved || false)
  }, [recipe.isSaved])

  const handleSave = async () => {
    try {
      const action = isSaved ? 'unsave' : 'save'
      const response = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          action,
          title: recipe.title,
          description: recipe.description,
          imageUrl: recipe.image,
          source: recipe.source,
          externalSource: recipe.externalSource,
          cookingTime: recipe.cookingTime,
          servings: recipe.servings,
          tags: recipe.tags,
          rating: recipe.rating
        })
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        onSave?.(recipe)
      } else {
        console.error('Failed to save/unsave recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    }
  }

  const handleView = () => {
    onView?.(recipe)
  }

  const getSourceIcon = () => {
    if (recipe.source === "external") {
      return <ExternalLink className="h-4 w-4" />
    }
    return <Home className="h-4 w-4" />
  }

  const getSourceColor = () => {
    if (recipe.source === "external") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  }

  const getSourceText = () => {
    if (recipe.source === "external") {
      return recipe.externalSource || "External"
    }
    return "Personal"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        {recipe.image && (
          <div className="relative h-48 w-full">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {showSourceIndicator && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSourceColor()}`}>
                {getSourceIcon()}
                {getSourceText()}
              </div>
            )}
            {recipe.rating && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {recipe.rating.toFixed(1)}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          {recipe.cookingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
        <Button
          onClick={handleView}
          variant="outline"
          className="flex-1 bg-white dark:bg-gray-800 border-2 border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-600 dark:hover:border-orange-300 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          View Recipe
        </Button>
        <Button
          onClick={handleSave}
          variant={isSaved ? "default" : "outline"}
          size="sm"
          className="px-3"
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, ExternalLink, X, Save, Share2 } from "lucide-react";
import { type Recipe } from "@/components/recipe-card";

interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const [isSaved, setIsSaved] = useState(recipe.isSaved);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save/unsave functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-orange-200 dark:border-gray-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{recipe.title}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
                className={isSaved
                  ? "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                  : "text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-orange-500 text-white">
                    <Star className="mr-1 h-3 w-3" />
                    {recipe.rating}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Cook Time</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{recipe.cookingTime} min</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Servings</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{recipe.servings}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Difficulty</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{recipe.difficulty}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Description and Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{recipe.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Ingredients</h3>
                <div className="space-y-2">
                  {/* TODO: Add actual ingredients from recipe data */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-gray-800 dark:text-white">2 cups all-purpose flour</span>
                    <Badge variant="outline" className="text-xs">Main</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-gray-800 dark:text-white">3 large eggs</span>
                    <Badge variant="outline" className="text-xs">Protein</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-gray-800 dark:text-white">1/2 cup olive oil</span>
                    <Badge variant="outline" className="text-xs">Fat</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Instructions</h3>
                <div className="space-y-3">
                  {/* TODO: Add actual instructions from recipe data */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Preheat the oven to 350°F (175°C) and grease a 9x13 inch baking pan.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      In a large bowl, whisk together the flour, sugar, and salt.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Add the eggs and oil, mixing until well combined.
                    </p>
                  </div>
                </div>
              </div>

              {recipe.source === 'external' && (
                <div className="pt-4 border-t border-orange-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="w-full text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
                    onClick={() => window.open(`https://spoonacular.com/recipes/${recipe.externalId}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on {recipe.externalSource}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
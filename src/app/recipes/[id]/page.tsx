"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { ChefHat, ArrowLeft, Clock, Users, Star, Heart, ExternalLink, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Recipe } from "@/components/recipe-card"

interface RecipeDetail extends Recipe {
  ingredients?: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  instructions?: Array<{
    number: number
    step: string
  }>
  nutrition?: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
    }>
  }
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeId = params.id as string

        // Check if it's an external recipe
        if (recipeId.startsWith('external-')) {
          // Fetch from our API
          const response = await fetch(`/api/recipes/${recipeId}`)
          if (response.ok) {
            const data = await response.json()
            setRecipe(data)
          } else {
            // Fallback to mock data
            const mockRecipe: RecipeDetail = {
              id: recipeId,
              title: "Spaghetti Carbonara",
              description: "Classic Italian pasta dish with eggs, cheese, and pancetta. A quick and delicious meal that's perfect for any occasion.",
              image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
              cookingTime: 20,
              servings: 4,
              difficulty: "Medium",
              tags: ["Italian", "Pasta", "Quick"],
              source: "external",
              externalId: "1",
              externalSource: "Spoonacular",
              rating: 4.5,
              externalUrl: "https://spoonacular.com/recipes/spaghetti-carbonara",
              ingredients: [
                { id: 1, name: "Spaghetti", amount: 400, unit: "g", original: "400g spaghetti" },
                { id: 2, name: "Eggs", amount: 4, unit: "large", original: "4 large eggs" },
                { id: 3, name: "Pancetta", amount: 150, unit: "g", original: "150g pancetta, diced" },
                { id: 4, name: "Parmesan cheese", amount: 100, unit: "g", original: "100g Parmesan cheese, grated" },
                { id: 5, name: "Black pepper", amount: 1, unit: "tsp", original: "1 tsp black pepper" },
                { id: 6, name: "Salt", amount: 1, unit: "tsp", original: "1 tsp salt" }
              ],
              instructions: [
                { number: 1, step: "Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente." },
                { number: 2, step: "Meanwhile, cook pancetta in a large skillet over medium heat until crispy, about 5-7 minutes." },
                { number: 3, step: "In a bowl, whisk together eggs, grated Parmesan, and black pepper." },
                { number: 4, step: "Drain pasta, reserving 1 cup of pasta water." },
                { number: 5, step: "Add hot pasta to the skillet with pancetta, remove from heat." },
                { number: 6, step: "Quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce." },
                { number: 7, step: "Serve immediately with extra Parmesan and black pepper." }
              ]
            }
            setRecipe(mockRecipe)
          }
        } else {
          // For personal recipes, fetch from your database
          const response = await fetch(`/api/recipes/${recipeId}`)
          if (response.ok) {
            const data = await response.json()
            setRecipe(data)
          } else {
            console.error('Failed to fetch personal recipe')
            // Handle error appropriately
          }
        }
      } catch (error) {
        console.error("Failed to fetch recipe:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRecipe()
    }
  }, [params.id])

  const handleSave = async () => {
    if (!recipe) return

    try {
      const action = isSaved ? 'unsave' : 'save'
      const response = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          action
        })
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        console.log(`${isSaved ? 'Unsaving' : 'Saving'} recipe:`, recipe.title)
      } else {
        console.error('Failed to save/unsave recipe')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    }
  }

  const handleViewExternal = () => {
    if (recipe?.externalUrl) {
      window.open(recipe.externalUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading recipe...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Recipe Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The recipe you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">MealForge</h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/recipes">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Recipes</Button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Explore</Button>
              </Link>
              <Link href="/meal-plans">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Meal Plans</Button>
              </Link>
              <Link href="/grocery-lists">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Grocery Lists</Button>
              </Link>
              <ThemeToggle />
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Recipe Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{recipe.title}</h1>
                {recipe.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">{recipe.description}</p>
                )}

                {/* Recipe Meta */}
                <div className="flex items-center gap-6 mb-4">
                  {recipe.cookingTime && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="h-5 w-5" />
                      <span>{recipe.cookingTime} minutes</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Users className="h-5 w-5" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                  {recipe.rating && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                      <span>{recipe.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={handleSave}
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  className="px-3"
                >
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
                {recipe.source === "external" && recipe.externalUrl && (
                  <Button
                    onClick={handleViewExternal}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Recipe Image */}
          {recipe.image && (
            <div className="mb-8">
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          )}

          {/* Recipe Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 dark:text-white">{ingredient.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{ingredient.amount}</span>
                            {ingredient.unit && <span className="ml-1">{ingredient.unit}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              {recipe.instructions && recipe.instructions.length > 0 && (
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {recipe.instructions.map((instruction) => (
                        <li key={instruction.number} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {instruction.number}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{instruction.step}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* External Recipe Notice */}
              {recipe.source === "external" && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          This recipe is from <span className="font-medium">{recipe.externalSource}</span>.
                        </p>
                        {recipe.externalUrl && (
                          <Button
                            onClick={handleViewExternal}
                            variant="outline"
                            size="sm"
                            className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Original Recipe
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recipe.difficulty && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Difficulty:</span>
                      <span className="font-medium text-gray-800 dark:text-white">{recipe.difficulty}</span>
                    </div>
                  )}
                  {recipe.cookingTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Cook Time:</span>
                      <span className="font-medium text-gray-800 dark:text-white">{recipe.cookingTime} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Servings:</span>
                      <span className="font-medium text-gray-800 dark:text-white">{recipe.servings}</span>
                    </div>
                  )}
                  {recipe.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Rating:</span>
                      <span className="font-medium text-gray-800 dark:text-white">{recipe.rating.toFixed(1)}/5</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
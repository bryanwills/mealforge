"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Plus, ShoppingCart, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { RecipeSelector } from "@/components/recipe-selector"

interface MealPlanMeal {
  id: string
  recipeId: string
  mealType: string
  servings: number
}

interface MealPlanDay {
  id: string
  date: string
  meals: MealPlanMeal[]
}

interface MealPlan {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  mealPlanDays: MealPlanDay[]
}

export default function MealPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecipeSelector, setShowRecipeSelector] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ date: string, mealType: string } | null>(null)
  const [generatingGroceryList, setGeneratingGroceryList] = useState(false)

  useEffect(() => {
    fetchMealPlan()
  }, [params.id])

  const fetchMealPlan = async () => {
    try {
      const response = await fetch(`/api/meal-plans/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMealPlan(data)
      } else {
        console.error('Failed to fetch meal plan')
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMealToDay = (date: string, mealType: string) => {
    setSelectedDay({ date, mealType })
    setShowRecipeSelector(true)
  }

  const handleRecipeSelected = async (recipeId: string, servings: number = 1) => {
    if (!selectedDay) return

    try {
      const response = await fetch(`/api/meal-plans/${params.id}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDay.date,
          meals: [{
            recipeId,
            mealType: selectedDay.mealType,
            servings
          }]
        })
      })

      if (response.ok) {
        fetchMealPlan() // Refresh the meal plan
        setShowRecipeSelector(false)
        setSelectedDay(null)
      }
    } catch (error) {
      console.error('Error adding meal:', error)
    }
  }

  const removeMeal = async (date: string, mealType: string) => {
    try {
      const response = await fetch(
        `/api/meal-plans/${params.id}/meals?date=${date}&mealType=${mealType}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchMealPlan()
      }
    } catch (error) {
      console.error('Error removing meal:', error)
    }
  }

  const generateGroceryList = async () => {
    setGeneratingGroceryList(true)
    try {
      const response = await fetch(`/api/meal-plans/${params.id}/grocery-list`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/grocery-lists/${data.groceryListId}`)
      } else {
        console.error('Failed to generate grocery list')
      }
    } catch (error) {
      console.error('Error generating grocery list:', error)
    } finally {
      setGeneratingGroceryList(false)
    }
  }

  const getDaysInRange = (startDate: string, endDate: string) => {
    const days = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start)

    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getMealForDayAndType = (date: string, mealType: string) => {
    const day = mealPlan?.mealPlanDays.find(d => 
      new Date(d.date).toDateString() === new Date(date).toDateString()
    )
    return day?.meals.find(m => m.mealType === mealType)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        </main>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Meal plan not found</p>
            <Link href="/meal-plans">
              <Button className="mt-4">Back to Meal Plans</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const days = getDaysInRange(mealPlan.startDate, mealPlan.endDate)
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/meal-plans" 
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{mealPlan.name}</h1>
              {mealPlan.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-2">{mealPlan.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
              </div>
            </div>
            <Button
              onClick={generateGroceryList}
              disabled={generatingGroceryList}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              {generatingGroceryList ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Generate Grocery List
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Meal Plan Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-4 mb-4">
              <div></div> {/* Empty corner */}
              {days.map(day => (
                <Card key={day.toDateString()} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm text-center text-gray-800 dark:text-white">
                      {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {mealTypes.map(mealType => (
              <div key={mealType} className="grid grid-cols-8 gap-4 mb-4">
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
                  <CardContent className="py-4">
                    <Badge variant="outline" className="w-full justify-center">
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>

                {days.map(day => {
                  const dateStr = day.toISOString().split('T')[0]
                  const meal = getMealForDayAndType(dateStr, mealType)

                  return (
                    <Card key={`${dateStr}-${mealType}`} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 min-h-[100px]">
                      <CardContent className="p-2">
                        {meal ? (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-800 dark:text-white truncate">
                              Recipe #{meal.recipeId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {meal.servings} serving{meal.servings !== 1 ? 's' : ''}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMeal(dateStr, mealType)}
                              className="w-full h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addMealToDay(dateStr, mealType)}
                            className="w-full h-full text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-orange-300"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <RecipeSelector
          isOpen={showRecipeSelector}
          onClose={() => {
            setShowRecipeSelector(false)
            setSelectedDay(null)
          }}
          onSelect={handleRecipeSelected}
        />
      )}
    </div>
  )
}
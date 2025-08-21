"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Loader2, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface MealPlan {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  mealPlanDays: Array<{
    meals: Array<{
      mealType: string
    }>
  }>
}

export default function MealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      const response = await fetch('/api/meal-plans')
      if (response.ok) {
        const data = await response.json()
        setMealPlans(data)
      } else {
        console.error('Failed to fetch meal plans')
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMealCount = (mealPlan: MealPlan) => {
    return mealPlan.mealPlanDays.reduce((total, day) => total + day.meals.length, 0)
  }

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Upcoming</Badge>
    } else if (now >= start && now <= end) {
      return <Badge className="bg-green-500 text-white">Active</Badge>
    } else {
      return <Badge variant="outline" className="text-gray-500 border-gray-500">Completed</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-gray-600 dark:text-gray-300">Loading meal plans...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Meal Plans</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Plan your meals for the week ahead
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link href="/meal-plans/new">
            <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Meal Plan
            </Button>
          </Link>
        </div>

        {/* Meal Plans Grid */}
        {mealPlans.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="col-span-full text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No meal plans yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create your first meal plan to get started
                    </p>
                  </div>
                  <Link href="/meal-plans/new">
                    <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Meal Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((mealPlan) => (
              <Card key={mealPlan.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg text-gray-800 dark:text-white line-clamp-2">
                      {mealPlan.name}
                    </CardTitle>
                    {getStatusBadge(mealPlan.startDate, mealPlan.endDate)}
                  </div>
                  {mealPlan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {mealPlan.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{getDaysCount(mealPlan.startDate, mealPlan.endDate)} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getMealCount(mealPlan)} meals</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/meal-plans/${mealPlan.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                        View Plan
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3 border-green-200 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                      title="Generate grocery list"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
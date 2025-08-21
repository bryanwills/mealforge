"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewMealPlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const mealPlan = await response.json()
        router.push(`/meal-plans/${mealPlan.id}`)
      } else {
        console.error('Failed to create meal plan')
      }
    } catch (error) {
      console.error('Error creating meal plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Set default date range (this week)
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  if (!formData.startDate) {
    setFormData(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link 
            href="/meal-plans" 
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Create New Meal Plan</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Plan your meals for the week ahead
          </p>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              Meal Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Plan Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Week of January 15th"
                  required
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any notes or goals for this meal plan..."
                  rows={3}
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.startDate || !formData.endDate}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Meal Plan'
                  )}
                </Button>
                <Link href="/meal-plans">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
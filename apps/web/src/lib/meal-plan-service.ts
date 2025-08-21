import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export interface CreateMealPlanData {
  name: string
  description?: string
  startDate: Date
  endDate: Date
}

export interface MealPlanWithDetails {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  mealPlanDays: Array<{
    id: string
    date: Date
    meals: Array<{
      id: string
      recipeId: string
      mealType: string
      servings: number
    }>
  }>
}

export interface MealPlanMeal {
  recipeId: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servings: number
}

export interface AddMealToPlanData {
  mealPlanId: string
  date: Date
  meals: MealPlanMeal[]
}

export class MealPlanService {
  async createMealPlan(userId: string, data: CreateMealPlanData): Promise<MealPlanWithDetails> {
    try {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: true
        },
        include: {
          mealPlanDays: {
            include: {
              meals: true
            },
            orderBy: { date: 'asc' }
          }
        }
      })

      return mealPlan as MealPlanWithDetails
    } catch (error) {
      logger.error('Error creating meal plan:', error)
      throw error
    }
  }

  async getUserMealPlans(userId: string): Promise<MealPlanWithDetails[]> {
    try {
      const mealPlans = await prisma.mealPlan.findMany({
        where: { userId, isActive: true },
        include: {
          mealPlanDays: {
            include: {
              meals: true
            },
            orderBy: { date: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return mealPlans as MealPlanWithDetails[]
    } catch (error) {
      logger.error('Error fetching user meal plans:', error)
      throw error
    }
  }

  async getMealPlanById(mealPlanId: string, userId: string): Promise<MealPlanWithDetails | null> {
    try {
      const mealPlan = await prisma.mealPlan.findFirst({
        where: { 
          id: mealPlanId, 
          userId,
          isActive: true 
        },
        include: {
          mealPlanDays: {
            include: {
              meals: true
            },
            orderBy: { date: 'asc' }
          }
        }
      })

      return mealPlan as MealPlanWithDetails | null
    } catch (error) {
      logger.error('Error fetching meal plan:', error)
      throw error
    }
  }

  async addMealsToDay(data: AddMealToPlanData): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Create or find the meal plan day
        let mealPlanDay = await tx.mealPlanDay.findUnique({
          where: {
            mealPlanId_date: {
              mealPlanId: data.mealPlanId,
              date: data.date
            }
          }
        })

        if (!mealPlanDay) {
          mealPlanDay = await tx.mealPlanDay.create({
            data: {
              mealPlanId: data.mealPlanId,
              date: data.date
            }
          })
        }

        // Add meals to the day
        for (const meal of data.meals) {
          await tx.mealPlanMeal.upsert({
            where: {
              mealPlanDayId_mealType: {
                mealPlanDayId: mealPlanDay.id,
                mealType: meal.mealType
              }
            },
            update: {
              recipeId: meal.recipeId,
              servings: meal.servings
            },
            create: {
              mealPlanDayId: mealPlanDay.id,
              recipeId: meal.recipeId,
              mealType: meal.mealType,
              servings: meal.servings
            }
          })
        }
      })
    } catch (error) {
      logger.error('Error adding meals to meal plan day:', error)
      throw error
    }
  }

  async removeMealFromDay(mealPlanId: string, date: Date, mealType: string): Promise<void> {
    try {
      const mealPlanDay = await prisma.mealPlanDay.findUnique({
        where: {
          mealPlanId_date: {
            mealPlanId,
            date
          }
        }
      })

      if (mealPlanDay) {
        await prisma.mealPlanMeal.deleteMany({
          where: {
            mealPlanDayId: mealPlanDay.id,
            mealType
          }
        })
      }
    } catch (error) {
      logger.error('Error removing meal from meal plan day:', error)
      throw error
    }
  }

  async deleteMealPlan(mealPlanId: string, userId: string): Promise<void> {
    try {
      await prisma.mealPlan.updateMany({
        where: { id: mealPlanId, userId },
        data: { isActive: false }
      })
    } catch (error) {
      logger.error('Error deleting meal plan:', error)
      throw error
    }
  }

  async generateGroceryList(mealPlanId: string, userId: string): Promise<string> {
    try {
      // Get the meal plan with all meals
      const mealPlan = await this.getMealPlanById(mealPlanId, userId)
      if (!mealPlan) {
        throw new Error('Meal plan not found')
      }

      // Get all unique recipe IDs from the meal plan
      const recipeIds = new Set<string>()
      const recipeServings: { [key: string]: number } = {}
      
      mealPlan.mealPlanDays.forEach(day => {
        day.meals.forEach(meal => {
          recipeIds.add(meal.recipeId)
          recipeServings[meal.recipeId] = (recipeServings[meal.recipeId] || 0) + meal.servings
        })
      })

      // Fetch all recipes and their ingredients
      const recipes = await prisma.recipe.findMany({
        where: { 
          id: { in: Array.from(recipeIds) },
          userId 
        },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      })

      // Combine ingredients from all recipes
      const combinedIngredients: { [key: string]: { quantity: number, unit: string, category?: string } } = {}

      recipes.forEach(recipe => {
        const multiplier = recipeServings[recipe.id] / recipe.servings
        
        recipe.ingredients.forEach(recipeIngredient => {
          const key = `${recipeIngredient.ingredient.name.toLowerCase()}-${recipeIngredient.unit}`
          const adjustedQuantity = recipeIngredient.quantity * multiplier

          if (combinedIngredients[key]) {
            combinedIngredients[key].quantity += adjustedQuantity
          } else {
            combinedIngredients[key] = {
              quantity: adjustedQuantity,
              unit: recipeIngredient.unit,
              category: recipeIngredient.ingredient.category
            }
          }
        })
      })

      // Create grocery list
      const groceryList = await prisma.groceryList.create({
        data: {
          userId,
          mealPlanId,
          name: `${mealPlan.name} - Grocery List`,
          description: `Generated from meal plan: ${mealPlan.name}`
        }
      })

      // Add items to grocery list
      const groceryItems = Object.entries(combinedIngredients).map(([key, data]) => {
        const [ingredientName] = key.split('-')
        return {
          groceryListId: groceryList.id,
          ingredientName: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
          quantity: Math.round(data.quantity * 100) / 100, // Round to 2 decimal places
          unit: data.unit,
          category: data.category,
          isCompleted: false
        }
      })

      await prisma.groceryListItem.createMany({
        data: groceryItems
      })

      return groceryList.id
    } catch (error) {
      logger.error('Error generating grocery list:', error)
      throw error
    }
  }
}

export const mealPlanService = new MealPlanService()
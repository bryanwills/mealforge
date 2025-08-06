import { db as prisma } from './db'
import { DataPersistenceService } from './data-persistence'
import { logger } from './logger'

export interface UserStatistics {
  totalRecipes: number
  savedRecipes: number
  importedRecipes: number
  sharedRecipes: number
  mealPlans: number
  groceryLists: number
  totalIngredients: number
}

export class StatisticsService {
  private dataService: DataPersistenceService

  constructor() {
    this.dataService = new DataPersistenceService()
  }

  // Get user statistics
  async getUserStatistics(clerkUserId: string): Promise<UserStatistics> {
    logger.debug('Getting user statistics', { clerkUserId })

    // Get the database user ID
    const dbUser = await this.dataService.getUserByClerkId(clerkUserId)
    if (!dbUser) {
      logger.warn('User not found in database for statistics', { clerkUserId })
      // Return zero statistics if user not found
      return {
        totalRecipes: 0,
        savedRecipes: 0,
        importedRecipes: 0,
        sharedRecipes: 0,
        mealPlans: 0,
        groceryLists: 0,
        totalIngredients: 0
      }
    }

    logger.debug('Found database user for statistics', {
      clerkUserId,
      dbUserId: dbUser.id
    })

    const [
      totalRecipes,
      savedRecipes,
      importedRecipes,
      sharedRecipes,
      mealPlans,
      groceryLists,
      totalIngredients
    ] = await Promise.all([
      // Total recipes (all user recipes)
      prisma.recipe.count({
        where: { userId: dbUser.id }
      }),

      // TODO: Implement proper recipe source tracking when database schema supports it
      // For now, return 0 for these categories
      0, // savedRecipes
      0, // importedRecipes
      0, // sharedRecipes

      // Meal plans
      prisma.mealPlan.count({
        where: { userId: dbUser.id }
      }),

      // Grocery lists
      prisma.groceryList.count({
        where: { userId: dbUser.id }
      }),

      // Total unique ingredients used by user's recipes
      prisma.recipeIngredient.findMany({
        where: {
          recipe: {
            userId: dbUser.id
          }
        },
        select: {
          ingredientId: true
        },
        distinct: ['ingredientId']
      }).then(ingredients => ingredients.length)
    ])

    logger.debug('Statistics calculated', {
      clerkUserId,
      dbUserId: dbUser.id,
      totalRecipes,
      savedRecipes,
      importedRecipes,
      sharedRecipes,
      mealPlans,
      groceryLists,
      totalIngredients
    })

    return {
      totalRecipes,
      savedRecipes,
      importedRecipes,
      sharedRecipes,
      mealPlans,
      groceryLists,
      totalIngredients
    }
  }

  // Get recipe breakdown by source
  async getRecipeBreakdown(clerkUserId: string) {
    // Get the database user ID
    const dbUser = await this.dataService.getUserByClerkId(clerkUserId)
    if (!dbUser) {
      return {
        spoonacular: 0,
        ocr: 0,
        url: 0,
        manual: 0,
        shared: 0
      }
    }

    // TODO: Implement proper recipe breakdown when database schema supports source tracking
    const breakdown = {
      spoonacular: 0,
      ocr: 0,
      url: 0,
      manual: 0,
      shared: 0
    }

    // TODO: Implement proper recipe breakdown when database schema supports source tracking
    return breakdown
  }

  // Get recent activity
  async getRecentActivity(clerkUserId: string, limit: number = 5) {
    // Get the database user ID
    const dbUser = await this.dataService.getUserByClerkId(clerkUserId)
    if (!dbUser) {
      return {
        recentRecipes: [],
        recentMealPlans: []
      }
    }

    const recentRecipes = await prisma.recipe.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    const recentMealPlans = await prisma.mealPlan.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    return {
      recentRecipes,
      recentMealPlans
    }
  }
}
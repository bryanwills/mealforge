import { logger } from './logger'
import { prisma } from './prisma'

export class DatabaseCleanupService {
  /**
   * Clean up old ingredients that are no longer associated with any recipes
   */
  static async cleanupOrphanedIngredients(): Promise<number> {
    try {
      logger.info('Starting cleanup of orphaned ingredients')

      // Find ingredients that are not used in any RecipeIngredient entries
      const orphanedIngredients = await prisma.ingredient.findMany({
        where: {
          id: {
            notIn: await prisma.recipeIngredient.findMany({
              select: { ingredientId: true }
            }).then(results => results.map(r => r.ingredientId))
          }
        }
      })

      if (orphanedIngredients.length === 0) {
        logger.info('No orphaned ingredients found')
        return 0
      }

      // Delete orphaned ingredients
      const deleteResult = await prisma.ingredient.deleteMany({
        where: {
          id: {
            in: orphanedIngredients.map(ing => ing.id)
          }
        }
      })

      logger.info('Cleaned up orphaned ingredients', {
        deletedCount: deleteResult.count,
        ingredientIds: orphanedIngredients.map(ing => ing.id)
      })

      return deleteResult.count
    } catch (error) {
      logger.error('Error cleaning up orphaned ingredients', { error })
      throw error
    }
  }

  /**
   * Clean up old RecipeIngredient entries for a specific user
   */
  static async cleanupUserRecipeIngredients(userId: string): Promise<number> {
    try {
      logger.info('Starting cleanup of user recipe ingredients', { userId })

      // Find all recipes for the user
      const userRecipes = await prisma.recipe.findMany({
        where: { userId },
        select: { id: true }
      })

      if (userRecipes.length === 0) {
        logger.info('No recipes found for user', { userId })
        return 0
      }

      const recipeIds = userRecipes.map(recipe => recipe.id)

      // Delete all RecipeIngredient entries for the user's recipes
      const deleteResult = await prisma.recipeIngredient.deleteMany({
        where: {
          recipeId: {
            in: recipeIds
          }
        }
      })

      logger.info('Cleaned up user recipe ingredients', {
        userId,
        deletedCount: deleteResult.count,
        recipeIds
      })

      return deleteResult.count
    } catch (error) {
      logger.error('Error cleaning up user recipe ingredients', { userId, error })
      throw error
    }
  }

  /**
   * Clean up old ingredients and recipe data for a specific user
   */
  static async cleanupUserData(userId: string): Promise<{
    orphanedIngredientsDeleted: number
    recipeIngredientsDeleted: number
  }> {
    try {
      logger.info('Starting comprehensive cleanup for user', { userId })

      // First clean up RecipeIngredient entries
      const recipeIngredientsDeleted = await this.cleanupUserRecipeIngredients(userId)

      // Then clean up orphaned ingredients
      const orphanedIngredientsDeleted = await this.cleanupOrphanedIngredients()

      logger.info('Completed user data cleanup', {
        userId,
        orphanedIngredientsDeleted,
        recipeIngredientsDeleted
      })

      return {
        orphanedIngredientsDeleted,
        recipeIngredientsDeleted
      }
    } catch (error) {
      logger.error('Error during user data cleanup', { userId, error })
      throw error
    }
  }

  /**
   * Update ingredient data with proper categories and nutritional information
   */
  static async updateIngredientData(ingredientId: string, updates: {
    category?: string
    caloriesPer100g?: number
    proteinPer100g?: number
    carbsPer100g?: number
    fatPer100g?: number
    commonUnits?: string[]
  }): Promise<void> {
    try {
      logger.info('Updating ingredient data', { ingredientId, updates })

      await prisma.ingredient.update({
        where: { id: ingredientId },
        data: updates
      })

      logger.info('Successfully updated ingredient data', { ingredientId })
    } catch (error) {
      logger.error('Error updating ingredient data', { ingredientId, updates, error })
      throw error
    }
  }
}
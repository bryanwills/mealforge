import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { RecipeService } from "@/lib/recipe-service"
import { DataPersistenceService } from "@/lib/data-persistence"
import { logger } from "@/lib/logger"

const recipeService = new RecipeService()
const dataService = new DataPersistenceService()

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists in database
    const dbUser = await dataService.getUserByClerkId(userId)

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Get user's saved recipes from database
    const userRecipes = await recipeService.getUserRecipes(dbUser.id)
    const savedRecipes = userRecipes.map(recipe => recipe.id)

    return NextResponse.json({
      savedRecipes
    })
  } catch (error) {
    logger.error('Failed to get saved recipes:', error)
    return NextResponse.json(
      { error: 'Failed to get saved recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    logger.debug('Saved recipes POST request', { clerkUserId: userId })

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(userId)
    logger.debug('Saved recipes - User check', {
      clerkUserId: userId,
      existsInDb: !!dbUser,
      dbUserId: dbUser?.id,
      dbClerkId: dbUser?.clerkId
    })

    if (!dbUser) {
      logger.info('User not found in database, attempting to sync...')
      // Try to sync the user first
      try {
        const authService = new (await import('@/lib/auth-service')).AuthService(
          new (await import('@/lib/auth-service')).ClerkAuthProvider()
        )
        const syncedUser = await authService.syncCurrentUser()
        logger.info('User synced successfully', {
          syncedUserId: syncedUser?.id,
          syncedClerkId: syncedUser?.provider === 'clerk' ? userId : null
        })

        // Get the synced user from database
        dbUser = await dataService.getUserByClerkId(userId)
        if (!dbUser) {
          logger.error('User still not found after sync', { clerkUserId: userId })
          return NextResponse.json({
            error: 'Failed to sync user to database. Please try signing out and back in.'
          }, { status: 400 })
        }
      } catch (syncError) {
        logger.error('Failed to sync user', { error: syncError })
        return NextResponse.json({
          error: 'User not found in database. Please try signing out and back in.'
        }, { status: 400 })
      }
    }

    const { recipeId, action, recipeData } = await request.json()

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    if (action === 'save' && recipeData) {
      logger.debug('Attempting to save recipe', {
        clerkUserId: userId,
        dbUserId: dbUser.id,
        recipeId,
        recipeTitle: recipeData.title
      })

      // Save recipe to database with import source using the database user ID
      const savedRecipe = await recipeService.createRecipe(dbUser.id, {
        ...recipeData,
        importSource: 'external', // For recipes saved from explore page
        isPublic: false,
        isShared: false
      })

      logger.info('Recipe saved successfully', {
        recipeId: savedRecipe.id,
        title: savedRecipe.title,
        userId: savedRecipe.userId
      })

      return NextResponse.json({
        success: true,
        recipe: savedRecipe
      })
    } else if (action === 'unsave') {
      // For unsave, we need to find the recipe in the user's database
      const userRecipes = await recipeService.getUserRecipes(dbUser.id)
      const recipeToDelete = userRecipes.find(recipe => recipe.id === recipeId)

      if (!recipeToDelete) {
        logger.warn('Recipe not found for unsave', {
          recipeId,
          dbUserId: dbUser.id,
          userRecipeCount: userRecipes.length
        })
        return NextResponse.json({
          error: 'Recipe not found in your saved collection'
        }, { status: 404 })
      }

      // Remove recipe from database
      await recipeService.deleteRecipe(recipeId)

      logger.info('Recipe unsaved successfully', {
        recipeId: recipeToDelete.id,
        title: recipeToDelete.title,
        userId: recipeToDelete.userId
      })

      return NextResponse.json({
        success: true,
        message: 'Recipe removed from saved collection'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "save" or "unsave"' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Failed to save/unsave recipe', { error })
    return NextResponse.json(
      { error: 'Failed to save/unsave recipe' },
      { status: 500 }
    )
  }
}
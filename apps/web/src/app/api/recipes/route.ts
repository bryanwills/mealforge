import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { RecipeService } from '@/lib/recipe-service'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'

const recipeService = new RecipeService()
const dataService = new DataPersistenceService()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(userId)
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

    const recipes = await recipeService.getUserRecipes(dbUser.id)
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(userId)
    logger.debug('Recipe creation - User check', {
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
            error: 'User not found in database. Please try signing out and back in.'
          }, { status: 400 })
        }
      } catch (syncError) {
        logger.error('Failed to sync user', { error: syncError })
        return NextResponse.json({
          error: 'User not found in database. Please try signing out and back in.'
        }, { status: 400 })
      }
    }

    const data = await request.json()
    const recipe = await recipeService.createRecipe(dbUser.id, data)

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
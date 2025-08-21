import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { RecipeService } from '@/lib/recipe-service'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'

const recipeService = new RecipeService()
const dataService = new DataPersistenceService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(session.user.id)
    logger.debug('Like recipe - User check', {
      clerkUserId: session.user.id,
      existsInDb: !!dbUser,
      dbUserId: dbUser?.id,
      dbClerkId: dbUser?.clerkId
    })

    if (!dbUser) {
      logger.info('User not found in database, attempting to sync...')
      // Try to sync the user first
      try {
        const authService = new (await import('@/lib/auth-service')).AuthService(
          new (await import('@/lib/auth-service')).NextAuthProvider()
        )
        const syncedUser = await authService.syncCurrentUser()
        logger.info('User synced successfully', {
          syncedUserId: syncedUser?.id,
          syncedClerkId: syncedUser?.provider === 'clerk' ? session.user.id : null
        })

        // Get the synced user from database
        dbUser = await dataService.getUserByClerkId(session.user.id)
        if (!dbUser) {
          logger.error('User still not found after sync', { clerkUserId: session.user.id })
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

    const { id } = await params

    // Check if recipe exists
    const existingRecipe = await recipeService.getRecipeById(id)
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // TODO: Implement like functionality when database schema supports it
    // await recipeService.likeRecipe(id, dbUser.id)
    return NextResponse.json({ message: 'Like functionality not yet implemented' })
  } catch (error) {
    console.error('Error liking recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(session.user.id)
    if (!dbUser) {
      logger.info('User not found in database, attempting to sync...')
      // Try to sync the user first
      try {
        const authService = new (await import('@/lib/auth-service')).AuthService(
          new (await import('@/lib/auth-service')).NextAuthProvider()
        )
        const syncedUser = await authService.syncCurrentUser()
        logger.info('User synced successfully', {
          syncedUserId: syncedUser?.id,
          syncedClerkId: syncedUser?.provider === 'clerk' ? session.user.id : null
        })

        // Get the synced user from database
        dbUser = await dataService.getUserByClerkId(session.user.id)
        if (!dbUser) {
          logger.error('User still not found after sync', { clerkUserId: session.user.id })
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

    const { id } = await params

    // TODO: Implement unlike functionality when database schema supports it
    // await recipeService.unlikeRecipe(id, dbUser.id)
    return NextResponse.json({ message: 'Unlike functionality not yet implemented' })
  } catch (error) {
    console.error('Error unliking recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
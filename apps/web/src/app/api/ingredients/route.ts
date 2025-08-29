import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'
import { convertIngredientQuantity } from '@/lib/ingredient-conversions'

const dataService = new DataPersistenceService()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    let dbUser = await dataService.getUserByClerkId(session.user.id)
    if (!dbUser) {
      logger.info('User not found in database, attempting to sync...')
      try {
        const authService = new (await import('@/lib/auth-service')).AuthService(
          new (await import('@/lib/auth-service')).NextAuthProvider()
        )
        const syncedUser = await authService.syncCurrentUser()
        dbUser = await dataService.getUserByClerkId(session.user.id)
        if (!dbUser) {
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

    // Get user's recipes with ingredients
    const { db: prisma } = await import('@/lib/db')

    const userIngredients = await prisma.recipeIngredient.findMany({
      where: {
        recipe: {
          session.user.id: dbUser.id
        }
      },
      include: {
        ingredient: true,
        recipe: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Aggregate ingredients by name and unit, with conversions
    const ingredientMap = new Map<string, {
      id: string
      name: string
      unit: string
      totalQuantity: number
      recipes: string[]
      category?: string
      originalQuantity?: number
      originalUnit?: string
    }>()

    userIngredients.forEach(recipeIngredient => {
      // Convert ingredient quantity to shopping-friendly amount
      const converted = convertIngredientQuantity(
        recipeIngredient.ingredient.name,
        recipeIngredient.quantity,
        recipeIngredient.unit
      )

      const key = `${recipeIngredient.ingredient.name}-${converted.unit}`

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        existing.totalQuantity += converted.quantity
        if (!existing.recipes.includes(recipeIngredient.recipe.title)) {
          existing.recipes.push(recipeIngredient.recipe.title)
        }
      } else {
        ingredientMap.set(key, {
          id: recipeIngredient.ingredient.id,
          name: recipeIngredient.ingredient.name,
          unit: converted.unit,
          totalQuantity: converted.quantity,
          recipes: [recipeIngredient.recipe.title],
          category: recipeIngredient.ingredient.category || 'unknown',
          originalQuantity: converted.originalQuantity,
          originalUnit: converted.originalUnit
        })
      }
    })

    const aggregatedIngredients = Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))

    logger.info('User ingredients retrieved', {
      session.user.id: dbUser.id,
      ingredientCount: aggregatedIngredients.length,
      totalRecipeIngredients: userIngredients.length
    })

    return NextResponse.json({
      ingredients: aggregatedIngredients,
      totalCount: aggregatedIngredients.length
    })
  } catch (error) {
    logger.error('Error fetching user ingredients', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
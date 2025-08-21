import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { RecipeService } from '@/lib/recipe-service'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'

const recipeService = new RecipeService()
const dataService = new DataPersistenceService()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session.user.id = session.user.id
    const recipes = await recipeService.getUserRecipes(session.user.id)
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session.user.id = session.user.id
    const data = await request.json()
    const recipe = await recipeService.createRecipe(session.user.id, data)

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
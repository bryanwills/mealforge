import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipe-service'

const recipeService = new RecipeService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let recipes
    if (query) {
      recipes = await recipeService.searchSharedRecipes(query, limit)
    } else {
      recipes = await recipeService.getSharedRecipes(limit, offset)
    }

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching shared recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { RecipeService } from '@/lib/recipe-service'

const recipeService = new RecipeService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // TODO: Implement proper shared recipes functionality
    // For now, return empty array since sharing functionality is not implemented
    const recipes: Record<string, unknown>[] = []

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching shared recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
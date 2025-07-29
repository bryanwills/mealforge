import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory store (this will reset on server restart)
const savedRecipes = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userSavedRecipes = savedRecipes.get(userId) || new Set()

    return NextResponse.json({
      savedRecipes: Array.from(userSavedRecipes)
    })
  } catch (error) {
    console.error('Failed to get saved recipes:', error)
    return NextResponse.json(
      { error: 'Failed to get saved recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { recipeId, action } = await request.json()

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Get or create user's saved recipes set
    if (!savedRecipes.has(userId)) {
      savedRecipes.set(userId, new Set())
    }

    const userSavedRecipes = savedRecipes.get(userId)!

    if (action === 'save') {
      userSavedRecipes.add(recipeId)
    } else if (action === 'unsave') {
      userSavedRecipes.delete(recipeId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "save" or "unsave"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      savedRecipes: Array.from(userSavedRecipes)
    })
  } catch (error) {
    console.error('Failed to save/unsave recipe:', error)
    return NextResponse.json(
      { error: 'Failed to save/unsave recipe' },
      { status: 500 }
    )
  }
}
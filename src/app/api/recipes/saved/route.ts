import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { mockExternalRecipes } from "@/lib/recipe-api"
import { getSavedRecipesCount, setSavedRecipesCount, incrementSavedRecipesCount, decrementSavedRecipesCount } from "@/lib/saved-recipes-store"
import { loadSavedRecipes, saveSavedRecipes, loadSavedRecipesData, saveSavedRecipesData } from "@/lib/saved-recipes-persistence"

// Load saved recipes from file on each request to ensure we have latest data
function getSavedRecipes() {
  return loadSavedRecipes()
}

function getSavedRecipesData() {
  return loadSavedRecipesData()
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Log the user ID for debugging
    console.log('GET /api/recipes/saved - User ID:', userId)

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get saved recipes from persistent storage (reload from file)
    const savedRecipes = getSavedRecipes()
    const savedRecipesData = getSavedRecipesData()



    const userSavedRecipeIds = savedRecipes.get(userId) || new Set()
    const userSavedRecipesDataMap = savedRecipesData.get(userId) || new Map()

    console.log('Found saved recipes for user:', userId, 'Count:', userSavedRecipeIds.size)

    // Convert saved recipe IDs to full recipe objects
    const savedRecipesDataArray = Array.from(userSavedRecipeIds).map(recipeId => {
      // First check if we have stored full data for this recipe
      const storedData = userSavedRecipesDataMap.get(recipeId)
      if (storedData) {
        return {
          ...storedData,
          isSaved: true
        }
      }

      // Check if it's an external recipe in our mock data
      if (recipeId.startsWith('external-')) {
        const mockRecipe = mockExternalRecipes.find(r => r.id === recipeId)
        if (mockRecipe) {
          return {
            ...mockRecipe,
            isSaved: true
          }
        }
      }

      // For personal recipes, we'd fetch from database
      // For now, return a placeholder
      return {
        id: recipeId,
        title: `Saved Recipe ${recipeId}`,
        description: 'This is a saved recipe',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        cookingTime: 30,
        servings: 4,
        difficulty: 'Medium',
        tags: ['Saved'],
        source: 'external' as const,
        externalId: recipeId.replace('external-', ''),
        externalSource: 'Spoonacular',
        rating: 4.5,
        isSaved: true
      }
    })

    return NextResponse.json({
      savedRecipes: savedRecipesDataArray
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

    // Log the user ID for debugging
    console.log('POST /api/recipes/saved - User ID:', userId)

    const { recipeId, action, title, description, imageUrl, source, externalSource, cookingTime, servings, tags, rating } = await request.json()

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    if (!action || !['save', 'unsave'].includes(action)) {
      return NextResponse.json(
        { error: 'Action is required and must be "save" or "unsave"' },
        { status: 400 }
      )
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get saved recipes from persistent storage (reload from file)
    const savedRecipes = getSavedRecipes()
    const savedRecipesData = getSavedRecipesData()

    // Get or create user's saved recipes
    if (!savedRecipes.has(userId)) {
      savedRecipes.set(userId, new Set())
    }
    if (!savedRecipesData.has(userId)) {
      savedRecipesData.set(userId, new Map())
    }

    const userSavedRecipes = savedRecipes.get(userId)!
    const userSavedRecipesDataMap = savedRecipesData.get(userId)!

    console.log('Before action - Saved recipes count for user:', userId, 'Count:', userSavedRecipes.size)

    if (action === 'save') {
      userSavedRecipes.add(recipeId)
      incrementSavedRecipesCount(userId)

      // Store the full recipe data
      userSavedRecipesDataMap.set(recipeId, {
        id: recipeId,
        title: title || `Saved Recipe ${recipeId}`,
        description: description || 'This is a saved recipe',
        image: imageUrl || 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        cookingTime: cookingTime || 30,
        servings: servings || 4,
        difficulty: 'Medium',
        tags: tags || ['Saved'],
        source: source || 'external',
        externalId: recipeId.replace('external-', ''),
        externalSource: externalSource || 'Spoonacular',
        rating: rating || 4.5
      })
    } else if (action === 'unsave') {
      userSavedRecipes.delete(recipeId)
      userSavedRecipesDataMap.delete(recipeId)
      decrementSavedRecipesCount(userId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "save" or "unsave"' },
        { status: 400 }
      )
    }

    console.log('After action - Saved recipes count for user:', userId, 'Count:', userSavedRecipes.size)

    // Persist the data to file
    saveSavedRecipes(savedRecipes)
    saveSavedRecipesData(savedRecipesData)

    // Return the updated list of saved recipes with full data
    const savedRecipesDataArray = Array.from(userSavedRecipes).map(recipeId => {
      // First check if we have stored full data for this recipe
      const storedData = userSavedRecipesDataMap.get(recipeId)
      if (storedData) {
        return {
          ...storedData,
          isSaved: true
        }
      }

      // Check if it's an external recipe in our mock data
      if (recipeId.startsWith('external-')) {
        const mockRecipe = mockExternalRecipes.find(r => r.id === recipeId)
        if (mockRecipe) {
          return {
            ...mockRecipe,
            isSaved: true
          }
        }
      }

      return {
        id: recipeId,
        title: `Saved Recipe ${recipeId}`,
        description: 'This is a saved recipe',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        cookingTime: 30,
        servings: 4,
        difficulty: 'Medium',
        tags: ['Saved'],
        source: 'external' as const,
        externalId: recipeId.replace('external-', ''),
        externalSource: 'Spoonacular',
        rating: 4.5,
        isSaved: true
      }
    })

    return NextResponse.json({
      success: true,
      savedRecipes: savedRecipesDataArray,
      count: userSavedRecipes.size
    })
  } catch (error) {
    console.error('Failed to save/unsave recipe:', error)
    return NextResponse.json(
      { error: 'Failed to save/unsave recipe' },
      { status: 500 }
    )
  }
}
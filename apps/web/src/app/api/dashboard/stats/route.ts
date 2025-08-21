import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { loadSavedRecipes } from "@/lib/saved-recipes-persistence"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Get saved recipes count from file-based storage
    const savedRecipes = loadSavedRecipes()
    const userSavedRecipes = savedRecipes.get(userId) || new Set()
    const savedCount = userSavedRecipes.size



    // Get other stats from database
    const mealPlansCount = await db.mealPlan.count({
      where: { userId: user.id, isActive: true }
    })

    const groceryListsCount = await db.groceryList.count({
      where: { userId: user.id, isActive: true }
    })

    const ingredientsCount = await db.ingredient.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      savedRecipes: savedCount,
      mealPlans: mealPlansCount,
      groceryLists: groceryListsCount,
      ingredients: ingredientsCount
    })
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    )
  }
}

// Function to update saved recipes count (called from saved recipes API)
// This is now handled by the file-based storage in saved-recipes-persistence
function updateSavedRecipesCount(userId: string, count: number) {
  console.log(`Saved recipes count updated for user ${userId}: ${count}`)
}
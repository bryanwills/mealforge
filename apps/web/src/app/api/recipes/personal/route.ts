import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkId: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch personal recipes for the user
    const recipes = await db.recipe.findMany({
      where: {
        session.user.id: user.id
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert to the expected format
    const convertedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description || '',
      image: recipe.imageUrl || '',
      cookingTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
      servings: recipe.servings,
      difficulty: recipe.difficulty || 'Medium',
      tags: recipe.tags,
      source: 'personal' as const,
      rating: 0, // Personal recipes don't have ratings yet
      ingredients: recipe.ingredients.map((ri, index) => ({
        id: index + 1,
        name: ri.ingredient.name,
        amount: ri.quantity,
        unit: ri.unit,
        original: `${ri.quantity} ${ri.unit} ${ri.ingredient.name}${ri.notes ? ` (${ri.notes})` : ''}`
      })),
      instructions: recipe.instructions.map((instruction, index) => ({
        number: index + 1,
        step: instruction
      }))
    }))

    return NextResponse.json({
      recipes: convertedRecipes
    })
  } catch (error) {
    console.error('Failed to fetch personal recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal recipes' },
      { status: 500 }
    )
  }
}
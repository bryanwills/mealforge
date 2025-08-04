import { NextRequest, NextResponse } from "next/server"
import { recipeAPIService, mockExternalRecipes } from "@/lib/recipe-api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params

    // Check if it's an external recipe
    if (recipeId.startsWith('external-')) {
      // Extract the external ID
      const externalId = recipeId.replace('external-', '')

      // Check if we have a Spoonacular API key
      const apiKey = process.env.SPOONACULAR_API_KEY
      const useRealAPI = apiKey && apiKey !== 'demo-key'

      if (useRealAPI) {
        try {
          const externalRecipe = await recipeAPIService.getRecipeById(parseInt(externalId))
          const convertedRecipe = recipeAPIService.convertToInternalRecipe(externalRecipe)

          // Add ingredients and instructions from the external API
          const detailedRecipe = {
            ...convertedRecipe,
            ingredients: externalRecipe.extendedIngredients?.map((ingredient: unknown, index: number) => ({
              id: index + 1,
              name: (ingredient as { name: string }).name,
              amount: (ingredient as { amount: number }).amount,
              unit: (ingredient as { unit: string }).unit,
              original: (ingredient as { original: string }).original
            })) || [],
            instructions: ((externalRecipe.analyzedInstructions as unknown[])?.[0] as { steps?: unknown[] })?.steps?.map((step: unknown) => ({
              number: (step as { number: number }).number,
              step: (step as { step: string }).step
            })) || []
          }

          return NextResponse.json(detailedRecipe)
        } catch (apiError) {
          console.error('Spoonacular API error:', apiError)
          // Fall back to mock data if API fails
        }
      }

      // Fallback to mock data
      const mockRecipe = mockExternalRecipes.find(recipe => recipe.id === recipeId)
      if (mockRecipe) {
        // Add mock ingredients and instructions based on the recipe
        const detailedMockRecipe = {
          ...mockRecipe,
          ingredients: [
            { id: 1, name: "Main ingredient", amount: 500, unit: "g", original: "500g main ingredient" },
            { id: 2, name: "Seasoning", amount: 1, unit: "tsp", original: "1 tsp seasoning" },
            { id: 3, name: "Oil", amount: 2, unit: "tbsp", original: "2 tbsp oil" }
          ],
          instructions: [
            { number: 1, step: "Prepare the ingredients as specified." },
            { number: 2, step: "Follow the cooking instructions for this recipe." },
            { number: 3, step: "Serve and enjoy your meal!" }
          ]
        }
        return NextResponse.json(detailedMockRecipe)
      }
    } else {
      // For personal recipes, fetch from your database
      // TODO: Implement personal recipe fetching from database
      return NextResponse.json(
        { error: 'Personal recipe fetching not implemented yet' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Recipe fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}
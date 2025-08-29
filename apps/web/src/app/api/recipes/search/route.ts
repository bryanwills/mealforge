import { NextRequest, NextResponse } from "next/server"
import { recipeAPIService, mockExternalRecipes } from "@/lib/recipe-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const cuisine = searchParams.get('cuisine')
    const diet = searchParams.get('diet')
    const maxReadyTime = searchParams.get('maxReadyTime')
    const offset = searchParams.get('offset')
    const number = searchParams.get('number')

    // Check if we have a Spoonacular API key
    const apiKey = process.env.SPOONACULAR_API_KEY
    const useRealAPI = apiKey && apiKey !== 'demo-key'

    if (useRealAPI) {
      try {
        const searchParams = {
          query: query || undefined,
          cuisine: cuisine || undefined,
          diet: diet || undefined,
          maxReadyTime: maxReadyTime ? parseInt(maxReadyTime) : undefined,
          offset: offset ? parseInt(offset) : undefined,
          number: number ? parseInt(number) : undefined,
        }

        const response = await recipeAPIService.searchRecipes(searchParams)
        const convertedResults = response.results.map(recipe =>
          recipeAPIService.convertToInternalRecipe(recipe)
        )

        return NextResponse.json({
          results: convertedResults,
          offset: response.offset,
          number: response.number,
          totalResults: response.totalResults
        })
      } catch (apiError) {
        console.error('Spoonacular API error:', apiError)
        // Fall back to mock data if API fails
      }
    }

    // Fallback to mock data
    const mockResults = mockExternalRecipes.map(recipe => ({
      ...recipe,
      // Add some variety to the mock data
      rating: Math.random() * 2 + 3, // Random rating between 3-5
      cookingTime: Math.floor(Math.random() * 60) + 10, // Random cooking time 10-70 min
    }))

    // Simulate search filtering
    let filteredResults = mockResults
    if (query) {
      filteredResults = filteredResults.filter(recipe =>
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (cuisine) {
      filteredResults = filteredResults.filter(recipe =>
        recipe.tags.some(tag => tag.toLowerCase().includes(cuisine.toLowerCase()))
      )
    }

    if (diet) {
      filteredResults = filteredResults.filter(recipe =>
        recipe.tags.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
      )
    }

    if (maxReadyTime) {
      filteredResults = filteredResults.filter(recipe =>
        recipe.cookingTime <= parseInt(maxReadyTime)
      )
    }

    // Simulate pagination
    const startIndex = parseInt(offset || '0')
    const limit = parseInt(number || '20')
    const paginatedResults = filteredResults.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      results: paginatedResults,
      offset: startIndex,
      number: limit,
      totalResults: filteredResults.length
    })
  } catch (error) {
    console.error('Recipe search error:', error)
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    )
  }
}
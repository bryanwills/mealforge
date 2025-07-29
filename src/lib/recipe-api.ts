// Recipe API service for integrating with external recipe APIs
// Currently using Spoonacular API (free tier: 150 requests/day)

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || 'demo-key'
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes'

interface AnalyzedInstruction {
  name: string
  steps: Array<{
    number: number
    step: string
    ingredients: Array<{
      id: number
      name: string
      localizedName: string
      image: string
    }>
    equipment: Array<{
      id: number
      name: string
      localizedName: string
      image: string
    }>
  }>
}

interface ExtendedIngredient {
  id: number
  aisle: string
  amount: number
  unit: string
  name: string
  original: string
  originalName: string
  meta: string[]
  image: string
}

interface Nutrition {
  nutrients: Array<{
    name: string
    amount: number
    unit: string
  }>
  properties: Array<{
    name: string
    amount: number
    unit: string
  }>
  flavonoids: Array<{
    name: string
    amount: number
    unit: string
  }>
  caloricBreakdown: {
    percentProtein: number
    percentFat: number
    percentCarbs: number
  }
  weightPerServing: {
    amount: number
    unit: string
  }
}

export interface ExternalRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  sourceName: string
  summary: string
  cuisines: string[]
  dishTypes: string[]
  diets: string[]
  instructions: string
  analyzedInstructions: AnalyzedInstruction[]
  extendedIngredients: ExtendedIngredient[]
  nutrition: Nutrition
  pricePerServing: number
  spoonacularScore: number
  healthScore: number
  cheap: boolean
  creditsText: string
  license: string
  imageType: string
}

export interface RecipeSearchParams {
  query?: string
  cuisine?: string
  diet?: string
  intolerances?: string
  type?: string
  maxReadyTime?: number
  minProtein?: number
  maxProtein?: number
  minFat?: number
  maxFat?: number
  minCarbs?: number
  maxCarbs?: number
  addRecipeInformation?: boolean
  fillIngredients?: boolean
  addRecipeNutrition?: boolean
  offset?: number
  number?: number
}

export interface RecipeSearchResponse {
  results: ExternalRecipe[]
  offset: number
  number: number
  totalResults: number
}

interface RecipeByIngredientsResult {
  id: number
  title: string
  image: string
  usedIngredientCount: number
  missedIngredientCount: number
  missedIngredients: Array<{
    id: number
    amount: number
    unit: string
    name: string
  }>
  usedIngredients: Array<{
    id: number
    amount: number
    unit: string
    name: string
  }>
  unusedIngredients: Array<{
    id: number
    amount: number
    unit: string
    name: string
  }>
  likes: number
}

class RecipeAPIService {
  private async makeRequest(endpoint: string, params: Record<string, string | number | boolean> = {}) {
    const url = new URL(`${SPOONACULAR_BASE_URL}${endpoint}`)

    // Add API key
    url.searchParams.set('apiKey', SPOONACULAR_API_KEY)

    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Recipe API request failed:', error)
      throw error
    }
  }

  async searchRecipes(params: RecipeSearchParams = {}): Promise<RecipeSearchResponse> {
    const defaultParams = {
      addRecipeInformation: true,
      fillIngredients: true,
      addRecipeNutrition: true,
      number: 20,
      ...params
    }

    return this.makeRequest('/complexSearch', defaultParams)
  }

  async getRecipeById(id: number): Promise<ExternalRecipe> {
    return this.makeRequest(`/${id}/information`, {
      addRecipeInformation: true,
      fillIngredients: true,
      addRecipeNutrition: true
    })
  }

  async getRandomRecipes(params: { tags?: string; number?: number } = {}): Promise<{ recipes: ExternalRecipe[] }> {
    const defaultParams = {
      number: 10,
      ...params
    }

    return this.makeRequest('/random', defaultParams)
  }

  async getRecipeByIngredients(ingredients: string[], params: { ranking?: number; ignorePantry?: boolean; number?: number } = {}): Promise<RecipeByIngredientsResult[]> {
    const defaultParams = {
      ranking: 2,
      ignorePantry: true,
      number: 20,
      ...params
    }

    return this.makeRequest('/findByIngredients', {
      ...defaultParams,
      ingredients: ingredients.join(',')
    })
  }

  // Convert external recipe to our internal format
  convertToInternalRecipe(externalRecipe: ExternalRecipe) {
    return {
      id: `external-${externalRecipe.id}`,
      title: externalRecipe.title,
      description: this.stripHtmlTags(externalRecipe.summary),
      image: externalRecipe.image,
      cookingTime: externalRecipe.readyInMinutes,
      servings: externalRecipe.servings,
      difficulty: this.calculateDifficulty(externalRecipe.readyInMinutes),
      tags: [
        ...externalRecipe.cuisines,
        ...externalRecipe.dishTypes,
        ...externalRecipe.diets
      ].filter(Boolean),
      source: 'external' as const,
      externalId: externalRecipe.id.toString(),
      externalSource: 'Spoonacular',
      rating: (externalRecipe.spoonacularScore / 100) * 5, // Convert to 5-star scale
      externalUrl: externalRecipe.sourceUrl
    }
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
  }

  private calculateDifficulty(cookingTime: number): string {
    if (cookingTime <= 15) return 'Easy'
    if (cookingTime <= 45) return 'Medium'
    return 'Hard'
  }
}

export const recipeAPIService = new RecipeAPIService()

// Mock data for development when API key is not available
export const mockExternalRecipes = [
  {
    id: 'external-1',
    title: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    cookingTime: 20,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Italian', 'Pasta', 'Quick'],
    source: 'external' as const,
    externalId: '1',
    externalSource: 'Spoonacular',
    rating: 4.5
  },
  {
    id: 'external-2',
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    cookingTime: 45,
    servings: 6,
    difficulty: 'Medium',
    tags: ['Indian', 'Curry', 'Spicy'],
    source: 'external' as const,
    externalId: '2',
    externalSource: 'Spoonacular',
    rating: 4.8
  },
  {
    id: 'external-3',
    title: 'Greek Salad',
    description: 'Fresh Mediterranean salad with olives, feta, and vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    cookingTime: 10,
    servings: 2,
    difficulty: 'Easy',
    tags: ['Salad', 'Healthy', 'Vegetarian'],
    source: 'external' as const,
    externalId: '3',
    externalSource: 'Spoonacular',
    rating: 4.2
  },
  {
    id: 'external-4',
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    cookingTime: 30,
    servings: 24,
    difficulty: 'Easy',
    tags: ['Dessert', 'Baking', 'Cookies'],
    source: 'external' as const,
    externalId: '4',
    externalSource: 'Spoonacular',
    rating: 4.6
  },
  {
    id: 'external-5',
    title: 'Vegan Lentil Soup',
    description: 'Hearty and healthy vegan lentil soup, perfect for a cold day.',
    image: 'https://images.unsplash.com/photo-1590940102956-02121122129b?w=400&h=300&fit=crop',
    cookingTime: 40,
    servings: 6,
    difficulty: 'Medium',
    tags: ['Vegan', 'Soup', 'Healthy', 'Winter'],
    source: 'external' as const,
    externalId: '5',
    externalSource: 'Spoonacular',
    rating: 4.3
  },
  {
    id: 'external-6',
    title: 'Spicy Shrimp Tacos',
    description: 'Quick and flavorful shrimp tacos with a spicy kick.',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop',
    cookingTime: 25,
    servings: 2,
    difficulty: 'Easy',
    tags: ['Mexican', 'Seafood', 'Spicy', 'Tacos'],
    source: 'external' as const,
    externalId: '6',
    externalSource: 'Spoonacular',
    rating: 4.7
  },
  {
    id: 'external-7',
    title: 'Classic Beef Lasagna',
    description: 'Layers of pasta, rich meat sauce, and creamy cheese.',
    image: 'https://images.unsplash.com/photo-1619895092938-1247891d9129?w=400&h=300&fit=crop',
    cookingTime: 90,
    servings: 8,
    difficulty: 'Hard',
    tags: ['Italian', 'Pasta', 'Comfort Food'],
    source: 'external' as const,
    externalId: '7',
    externalSource: 'Spoonacular',
    rating: 4.9
  },
  {
    id: 'external-8',
    title: 'Blueberry Pancakes',
    description: 'Fluffy pancakes loaded with fresh blueberries.',
    image: 'https://images.unsplash.com/photo-1528207776546-367ee310272f?w=400&h=300&fit=crop',
    cookingTime: 20,
    servings: 4,
    difficulty: 'Easy',
    tags: ['Breakfast', 'Sweet', 'Pancakes'],
    source: 'external' as const,
    externalId: '8',
    externalSource: 'Spoonacular',
    rating: 4.4
  },
  {
    id: 'external-9',
    title: 'Roasted Chicken with Vegetables',
    description: 'A simple and delicious roasted chicken with root vegetables.',
    image: 'https://images.unsplash.com/photo-1598103442092-4377432205f2?w=400&h=300&fit=crop',
    cookingTime: 60,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Dinner', 'Healthy', 'Roast'],
    source: 'external' as const,
    externalId: '9',
    externalSource: 'Spoonacular',
    rating: 4.6
  },
  {
    id: 'external-10',
    title: 'Vegetable Stir-fry',
    description: 'Quick and versatile stir-fry with your favorite vegetables.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    cookingTime: 20,
    servings: 3,
    difficulty: 'Easy',
    tags: ['Asian', 'Vegetarian', 'Quick'],
    source: 'external' as const,
    externalId: '10',
    externalSource: 'Spoonacular',
    rating: 4.1
  },
  {
    id: 'external-11',
    title: 'Salmon with Asparagus',
    description: 'Healthy baked salmon with tender asparagus.',
    image: 'https://images.unsplash.com/photo-1519708241834-a97869327f2c?w=400&h=300&fit=crop',
    cookingTime: 30,
    servings: 2,
    difficulty: 'Easy',
    tags: ['Healthy', 'Seafood', 'Dinner'],
    source: 'external' as const,
    externalId: '11',
    externalSource: 'Spoonacular',
    rating: 4.7
  },
  {
    id: 'external-12',
    title: 'Classic Margherita Pizza',
    description: 'Simple and delicious pizza with fresh mozzarella and basil.',
    image: 'https://images.unsplash.com/photo-1593560704563-f176a2d61e0c?w=400&h=300&fit=crop',
    cookingTime: 25,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Italian', 'Pizza', 'Vegetarian'],
    source: 'external' as const,
    externalId: '12',
    externalSource: 'Spoonacular',
    rating: 4.5
  }
]
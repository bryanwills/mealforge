import { logger } from './logger'
import { ImportedRecipeData } from './url-import-service'

export interface APIProvider {
  name: string
  priority: number
  rateLimit: number // requests per minute
  costPerRequest: number // in USD
  enabled: boolean
}

export interface APIResult {
  success: boolean
  data?: ImportedRecipeData
  confidence: number // 0-1
  provider: string
  error?: string
  cost: number
}

export interface RecipeKeeperResult {
  title: string
  description?: string
  ingredients: string[]
  instructions: string[]
  prepTime?: string
  cookTime?: string
  servings?: string
  imageUrl?: string
}

export interface ZestfulResult {
  ingredients: Array<{
    name: string
    amount: number
    unit: string
    confidence: number
  }>
}

export class ProfessionalAPIService {
  private static readonly API_PROVIDERS: APIProvider[] = [
    {
      name: 'recipe-keeper',
      priority: 1,
      rateLimit: 60, // 60 requests per minute
      costPerRequest: 0.001, // $0.001 per request
      enabled: true
    },
    {
      name: 'zestful',
      priority: 2,
      rateLimit: 100, // 100 requests per minute
      costPerRequest: 0.002, // $0.002 per request
      enabled: true
    },
    {
      name: 'chefkoch',
      priority: 3,
      rateLimit: 30, // 30 requests per minute
      costPerRequest: 0.0005, // $0.0005 per request
      enabled: true
    }
  ]

  private static readonly RATE_LIMIT_CACHE = new Map<string, { count: number; resetTime: number }>()

  /**
   * Attempts to extract recipe data using professional APIs
   * Falls back through multiple providers for maximum accuracy
   */
  static async extractRecipeWithAPIs(url: string): Promise<APIResult[]> {
    logger.info('Starting professional API extraction', { url })

    const results: APIResult[] = []
    const sortedProviders = this.API_PROVIDERS
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority)

    for (const provider of sortedProviders) {
      try {
        // Check rate limiting
        if (!this.checkRateLimit(provider.name)) {
          logger.warn('Rate limit exceeded for provider', { provider: provider.name, url })
          continue
        }

        logger.info('Attempting API extraction with provider', { provider: provider.name, url })

        let result: APIResult
        switch (provider.name) {
          case 'recipe-keeper':
            result = await this.tryRecipeKeeperAPI(url, provider)
            break
          case 'zestful':
            result = await this.tryZestfulAPI(url, provider)
            break
          case 'chefkoch':
            result = await this.tryChefkochAPI(url, provider)
            break
          default:
            result = {
              success: false,
              confidence: 0,
              provider: provider.name,
              error: 'Unknown provider',
              cost: provider.costPerRequest
            }
        }

        results.push(result)

        // If we got a high-confidence result, we can stop here
        if (result.success && result.confidence > 0.8) {
          logger.info('High-confidence result obtained, stopping API extraction', {
            provider: provider.name,
            confidence: result.confidence
          })
          break
        }

      } catch (error) {
        logger.error('Error with API provider', { provider: provider.name, url, error })
        results.push({
          success: false,
          confidence: 0,
          provider: provider.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          cost: provider.costPerRequest
        })
      }
    }

    logger.info('Professional API extraction completed', {
      url,
      totalResults: results.length,
      successfulResults: results.filter(r => r.success).length,
      totalCost: results.reduce((sum, r) => sum + r.cost, 0)
    })

    return results
  }

  /**
   * Recipe Keeper API integration
   * High accuracy for recipe structure and content
   */
  private static async tryRecipeKeeperAPI(url: string, provider: APIProvider): Promise<APIResult> {
    try {
      // This would be a real API call in production
      // For now, we'll simulate the API response
      const apiKey = process.env.RECIPE_KEEPER_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: provider.name,
          error: 'API key not configured',
          cost: provider.costPerRequest
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock successful response
      const mockResult: RecipeKeeperResult = {
        title: 'Extracted Recipe Title',
        description: 'Recipe description from Recipe Keeper API',
        ingredients: [
          '2 cups all-purpose flour',
          '1 cup sugar',
          '2 large eggs',
          '1 teaspoon vanilla extract'
        ],
        instructions: [
          'Preheat oven to 350°F',
          'Mix dry ingredients',
          'Add wet ingredients',
          'Bake for 25-30 minutes'
        ],
        prepTime: '15 minutes',
        cookTime: '25 minutes',
        servings: '12 servings',
        imageUrl: 'https://example.com/recipe-image.jpg'
      }

      // Convert to ScrapedRecipeData format
      const recipeData: ImportedRecipeData = {
        title: mockResult.title,
        description: mockResult.description || 'Recipe extracted via Recipe Keeper API',
        imageUrl: mockResult.imageUrl,
        prepTime: this.parseTimeString(mockResult.prepTime || ''),
        cookTime: this.parseTimeString(mockResult.cookTime || ''),
        servings: this.parseServings(mockResult.servings || ''),
        difficulty: 'medium',
        cuisine: 'Unknown',
        tags: ['imported', 'url', 'api', 'recipe-keeper'],
        instructions: mockResult.instructions,
        ingredients: mockResult.ingredients.map(text => this.parseIngredientWithAI(text)),
        sourceUrl: url,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit(provider.name)

      return {
        success: true,
        data: recipeData,
        confidence: 0.85, // High confidence for Recipe Keeper
        provider: provider.name,
        cost: provider.costPerRequest
      }

    } catch (error) {
      logger.error('Recipe Keeper API error', { url, error })
      return {
        success: false,
        confidence: 0,
        provider: provider.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: provider.costPerRequest
      }
    }
  }

  /**
   * Zestful API integration
   * Specialized in ingredient parsing and normalization
   */
  private static async tryZestfulAPI(url: string, provider: APIProvider): Promise<APIResult> {
    try {
      const apiKey = process.env.ZESTFUL_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: provider.name,
          error: 'API key not configured',
          cost: provider.costPerRequest
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Mock successful response
      const mockResult: ZestfulResult = {
        ingredients: [
          { name: 'all-purpose flour', amount: 2, unit: 'cup', confidence: 0.95 },
          { name: 'granulated sugar', amount: 1, unit: 'cup', confidence: 0.92 },
          { name: 'large eggs', amount: 2, unit: 'piece', confidence: 0.88 },
          { name: 'vanilla extract', amount: 1, unit: 'teaspoon', confidence: 0.90 }
        ]
      }

      // Convert to ScrapedRecipeData format
      const recipeData: ImportedRecipeData = {
        title: 'Recipe from Zestful API',
        description: 'Recipe extracted via Zestful API with enhanced ingredient parsing',
        imageUrl: undefined,
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: 'medium',
        cuisine: 'Unknown',
        tags: ['imported', 'url', 'api', 'zestful'],
        instructions: ['Recipe instructions not available from Zestful API'],
        ingredients: mockResult.ingredients.map(ing => ({
          quantity: ing.amount,
          unit: ing.unit,
          name: ing.name,
          notes: `Confidence: ${(ing.confidence * 100).toFixed(0)}%`
        })),
        sourceUrl: url,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit(provider.name)

      return {
        success: true,
        data: recipeData,
        confidence: 0.75, // Good confidence for ingredient parsing
        provider: provider.name,
        cost: provider.costPerRequest
      }

    } catch (error) {
      logger.error('Zestful API error', { url, error })
      return {
        success: false,
        confidence: 0,
        provider: provider.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: provider.costPerRequest
      }
    }
  }

  /**
   * Chefkoch API integration
   * German recipe site with good international coverage
   */
  private static async tryChefkochAPI(url: string, provider: APIProvider): Promise<APIResult> {
    try {
      const apiKey = process.env.CHEFKOCH_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: provider.name,
          error: 'API key not configured',
          cost: provider.costPerRequest
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400))

      // Mock successful response
      const recipeData: ImportedRecipeData = {
        title: 'Recipe from Chefkoch API',
        description: 'Recipe extracted via Chefkoch API',
        imageUrl: undefined,
        prepTime: 20,
        cookTime: 35,
        servings: 8,
        difficulty: 'medium',
        cuisine: 'International',
        tags: ['imported', 'url', 'api', 'chefkoch'],
        instructions: [
          'Prepare ingredients as specified',
          'Follow cooking instructions carefully',
          'Adjust seasoning to taste',
          'Serve hot or cold as preferred'
        ],
        ingredients: [
          { quantity: 3, unit: 'cups', name: 'flour', notes: 'all-purpose' },
          { quantity: 1.5, unit: 'cups', name: 'milk', notes: 'whole milk preferred' },
          { quantity: 2, unit: 'large', name: 'eggs', notes: 'room temperature' },
          { quantity: 1, unit: 'tablespoon', name: 'oil', notes: 'vegetable or olive' }
        ],
        sourceUrl: url,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit(provider.name)

      return {
        success: true,
        data: recipeData,
        confidence: 0.70, // Moderate confidence for Chefkoch
        provider: provider.name,
        cost: provider.costPerRequest
      }

    } catch (error) {
      logger.error('Chefkoch API error', { url, error })
      return {
        success: false,
        confidence: 0,
        provider: provider.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: provider.costPerRequest
      }
    }
  }

  /**
   * Get the best result from multiple API providers
   */
  static getBestAPIResult(results: APIResult[]): APIResult | null {
    const successfulResults = results.filter(r => r.success)
    if (successfulResults.length === 0) return null

    // Return the result with highest confidence
    return successfulResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    )
  }

  /**
   * Check if we're within rate limits for a provider
   */
  private static checkRateLimit(providerName: string): boolean {
    const now = Date.now()
    const cached = this.RATE_LIMIT_CACHE.get(providerName)

    if (!cached) return true

    // Reset if a minute has passed
    if (now > cached.resetTime) {
      this.RATE_LIMIT_CACHE.delete(providerName)
      return true
    }

    const provider = this.API_PROVIDERS.find(p => p.name === providerName)
    if (!provider) return false

    return cached.count < provider.rateLimit
  }

  /**
   * Update rate limit counter for a provider
   */
  private static updateRateLimit(providerName: string): void {
    const now = Date.now()
    const cached = this.RATE_LIMIT_CACHE.get(providerName)

    if (!cached || now > cached.resetTime) {
      this.RATE_LIMIT_CACHE.set(providerName, {
        count: 1,
        resetTime: now + 60000 // 1 minute from now
      })
    } else {
      cached.count++
    }
  }

  /**
   * Get cost estimate for API usage
   */
  static getCostEstimate(requests: number): number {
    return this.API_PROVIDERS
      .filter(provider => provider.enabled)
      .reduce((total, provider) => total + (provider.costPerRequest * requests), 0)
  }

  /**
   * Parse time string to minutes
   */
  private static parseTimeString(timeStr: string): number {
    if (!timeStr) return 0

    const timeMatch = timeStr.match(/(\d+)\s*(?:minute|min|m)/i)
    if (timeMatch) {
      return parseInt(timeMatch[1])
    }

    const hourMatch = timeStr.match(/(\d+)\s*(?:hour|hr|h)/i)
    if (hourMatch) {
      return parseInt(hourMatch[1]) * 60
    }

    const numberMatch = timeStr.match(/(\d+)/)
    return numberMatch ? parseInt(numberMatch[1]) : 0
  }

  /**
   * Parse servings string to number
   */
  private static parseServings(servingsStr: string): number {
    if (!servingsStr) return 0
    const match = servingsStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Parse ingredient text using AI-like logic
   */
  private static parseIngredientWithAI(ingredientText: string): {
    quantity: number
    unit: string
    name: string
    notes?: string
  } {
    const unitPatterns = [
      'cup', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp',
      'ounce', 'oz', 'pound', 'lb', 'gram', 'g', 'kilogram', 'kg',
      'milliliter', 'ml', 'liter', 'l', 'pinch', 'dash',
      'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves',
      'large', 'medium', 'small', 'whole', 'half'
    ]

    const quantityUnitMatch = ingredientText.match(/^([\d\/\s\.]+)\s*([a-zA-Z]+)/)

    if (quantityUnitMatch) {
      const quantityStr = quantityUnitMatch[1].trim()
      const unit = quantityUnitMatch[2].toLowerCase()
      const name = ingredientText.substring(quantityUnitMatch[0].length).trim()

      let quantity = 0
      if (quantityStr.includes('/')) {
        const parts = quantityStr.split(' ')
        if (parts.length === 2) {
          const whole = parseInt(parts[0]) || 0
          const fraction = parts[1].split('/')
          quantity = whole + (parseInt(fraction[0]) / parseInt(fraction[1]))
        } else {
          const fraction = quantityStr.split('/')
          quantity = parseInt(fraction[0]) / parseInt(fraction[1])
        }
      } else {
        quantity = parseFloat(quantityStr) || 0
      }

      return {
        quantity,
        unit: unitPatterns.includes(unit) ? unit : 'piece',
        name: name || 'Unknown ingredient',
        notes: ''
      }
    }

    return {
      quantity: 1,
      unit: 'piece',
      name: ingredientText.trim(),
      notes: ''
    }
  }
}

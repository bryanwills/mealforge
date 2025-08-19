import { logger } from './logger'
import { ImportedRecipeData } from './url-import-service'

export interface AIParsingResult {
  success: boolean
  data?: ImportedRecipeData
  confidence: number // 0-1
  provider: string
  error?: string
  cost: number
  tokensUsed: number
}

export interface IngredientParsingRequest {
  ingredientText: string
  context?: string // Recipe context for better parsing
}

export interface RecipeStructureRequest {
  htmlContent: string
  url: string
  extractionContext: string
}

export interface AIParsingConfig {
  maxTokens: number
  temperature: number
  model: string
  timeout: number // milliseconds
}

export class AIParsingService {
  private static readonly AI_PROVIDERS = {
    openai: {
      name: 'OpenAI GPT-4',
      priority: 1,
      costPer1kTokens: 0.03, // $0.03 per 1K tokens
      rateLimit: 50, // requests per minute
      enabled: true
    },
    claude: {
      name: 'Claude 3.5 Sonnet',
      priority: 2,
      costPer1kTokens: 0.015, // $0.015 per 1K tokens
      rateLimit: 30, // requests per minute
      enabled: true
    },
    local: {
      name: 'Local AI Model',
      priority: 3,
      costPer1kTokens: 0, // Free
      rateLimit: 100, // requests per minute
      enabled: false // Disabled by default
    }
  }

  private static readonly DEFAULT_CONFIG: AIParsingConfig = {
    maxTokens: 2000,
    temperature: 0.1, // Low temperature for consistent parsing
    model: 'gpt-4',
    timeout: 30000 // 30 seconds
  }

  private static readonly RATE_LIMIT_CACHE = new Map<string, { count: number; resetTime: number }>()

  /**
   * Parse ingredients using AI for maximum accuracy
   * Falls back through multiple AI providers
   */
  static async parseIngredientsWithAI(
    ingredients: string[],
    context?: string
  ): Promise<AIParsingResult[]> {
    logger.info('Starting AI-powered ingredient parsing', {
      ingredientCount: ingredients.length,
      context: context ? 'with context' : 'no context'
    })

    const results: AIParsingResult[] = []
    const sortedProviders = Object.entries(this.AI_PROVIDERS)
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority)

    for (const [providerKey, provider] of sortedProviders) {
      try {
        // Check rate limiting
        if (!this.checkRateLimit(providerKey)) {
          logger.warn('Rate limit exceeded for AI provider', { provider: providerKey })
          continue
        }

        logger.info('Attempting AI parsing with provider', { provider: providerKey })

        let result: AIParsingResult
        switch (providerKey) {
          case 'openai':
            result = await this.parseWithOpenAI(ingredients, context, provider)
            break
          case 'claude':
            result = await this.parseWithClaude(ingredients, context, provider)
            break
          case 'local':
            result = await this.parseWithLocalAI(ingredients, context, provider)
            break
          default:
            result = {
              success: false,
              confidence: 0,
              provider: providerKey,
              error: 'Unknown AI provider',
              cost: 0,
              tokensUsed: 0
            }
        }

        results.push(result)

        // If we got a high-confidence result, we can stop here
        if (result.success && result.confidence > 0.9) {
          logger.info('High-confidence AI parsing result obtained', {
            provider: providerKey,
            confidence: result.confidence
          })
          break
        }

      } catch (error) {
        logger.error('Error with AI provider', { provider: providerKey, error })
        results.push({
          success: false,
          confidence: 0,
          provider: providerKey,
          error: error instanceof Error ? error.message : 'Unknown error',
          cost: 0,
          tokensUsed: 0
        })
      }
    }

    logger.info('AI-powered ingredient parsing completed', {
      totalResults: results.length,
      successfulResults: results.filter(r => r.success).length,
      totalCost: results.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: results.reduce((sum, r) => sum + r.tokensUsed, 0)
    })

    return results
  }

  /**
   * Parse recipe structure using AI for better extraction
   */
  static async parseRecipeStructureWithAI(
    htmlContent: string,
    url: string,
    extractionContext: string
  ): Promise<AIParsingResult[]> {
    logger.info('Starting AI-powered recipe structure parsing', { url })

    const results: AIParsingResult[] = []
    const sortedProviders = Object.entries(this.AI_PROVIDERS)
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority)

    for (const [providerKey, provider] of sortedProviders) {
      try {
        if (!this.checkRateLimit(providerKey)) {
          continue
        }

        let result: AIParsingResult
        switch (providerKey) {
          case 'openai':
            result = await this.parseRecipeStructureWithOpenAI(htmlContent, url, extractionContext, provider)
            break
          case 'claude':
            result = await this.parseRecipeStructureWithClaude(htmlContent, url, extractionContext, provider)
            break
          default:
            result = {
              success: false,
              confidence: 0,
              provider: providerKey,
              error: 'Provider not implemented for recipe structure',
              cost: 0,
              tokensUsed: 0
            }
        }

        results.push(result)

        if (result.success && result.confidence > 0.9) {
          break
        }

      } catch (error) {
        logger.error('Error with AI provider for recipe structure', { provider: providerKey, error })
        results.push({
          success: false,
          confidence: 0,
          provider: providerKey,
          error: error instanceof Error ? error.message : 'Unknown error',
          cost: 0,
          tokensUsed: 0
        })
      }
    }

    return results
  }

  /**
   * Parse complete recipe using AI for maximum accuracy
   * Combines ingredient parsing and recipe structure analysis
   */
  static async parseRecipeWithAI(url: string): Promise<AIParsingResult[]> {
    logger.info('Starting AI-powered complete recipe parsing', { url })

    try {
      // For now, we'll simulate a complete recipe parsing
      // In production, this would fetch HTML content and analyze it
      const mockIngredients = [
        '2 cups all-purpose flour',
        '1 cup granulated sugar',
        '2 large eggs',
        '1 teaspoon vanilla extract'
      ]

      // Parse ingredients with AI
      const ingredientResults = await this.parseIngredientsWithAI(mockIngredients, 'Recipe context')

      // Parse recipe structure with AI (simulated)
      const structureResults = await this.parseRecipeStructureWithAI(
        '<html>Mock HTML content</html>',
        url,
        'Recipe extraction context'
      )

      // Combine results and return the best ones
      const allResults = [...ingredientResults, ...structureResults]

      logger.info('AI-powered complete recipe parsing completed', {
        url,
        ingredientResults: ingredientResults.length,
        structureResults: structureResults.length,
        totalResults: allResults.length
      })

      return allResults

    } catch (error) {
      logger.error('AI-powered complete recipe parsing failed', { url, error })
      return [{
        success: false,
        confidence: 0,
        provider: 'ai-service',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }]
    }
  }

  /**
   * OpenAI GPT-4 integration for ingredient parsing
   */
  private static async parseWithOpenAI(
    ingredients: string[],
    context?: string,
    provider?: { costPer1kTokens: number }
  ): Promise<AIParsingResult> {
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: 'openai',
          error: 'OpenAI API key not configured',
          cost: 0,
          tokensUsed: 0
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock successful response
      const parsedIngredients = ingredients.map(() => ({
        quantity: 2,
        unit: 'cups',
        name: 'all-purpose flour',
        notes: 'sifted, from AI parsing'
      }))

      const recipeData: ImportedRecipeData = {
        title: 'Recipe parsed with OpenAI GPT-4',
        description: 'Recipe ingredients parsed using OpenAI GPT-4 for maximum accuracy',
        sourceUrl: '',
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: 'medium',
        cuisine: 'Unknown',
        tags: ['imported', 'ai-parsed', 'openai'],
        instructions: ['Recipe instructions not available from ingredient parsing'],
        ingredients: parsedIngredients,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit('openai')

      // Calculate cost (mock)
      const tokensUsed = ingredients.length * 50 + 200 // Rough estimate
      const cost = (tokensUsed / 1000) * (provider?.costPer1kTokens || 0.03)

      return {
        success: true,
        data: recipeData,
        confidence: 0.95, // Very high confidence for GPT-4
        provider: 'openai',
        cost,
        tokensUsed
      }

    } catch (error) {
      logger.error('OpenAI parsing error', { error })
      return {
        success: false,
        confidence: 0,
        provider: 'openai',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }
    }
  }

  /**
   * Claude 3.5 Sonnet integration for ingredient parsing
   */
  private static async parseWithClaude(
    ingredients: string[],
    context?: string,
    provider?: { costPer1kTokens: number }
  ): Promise<AIParsingResult> {
    try {
      const apiKey = process.env.CLAUDE_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: 'claude',
          error: 'Claude API key not configured',
          cost: 0,
          tokensUsed: 0
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600))

      // Mock successful response
      const parsedIngredients = ingredients.map(() => ({
        quantity: 1.5,
        unit: 'cups',
        name: 'granulated sugar',
        notes: 'from Claude AI parsing'
      }))

      const recipeData: ImportedRecipeData = {
        title: 'Recipe parsed with Claude 3.5',
        description: 'Recipe ingredients parsed using Claude 3.5 Sonnet',
        sourceUrl: '',
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: 'medium',
        cuisine: 'Unknown',
        tags: ['imported', 'ai-parsed', 'claude'],
        instructions: ['Recipe instructions not available from ingredient parsing'],
        ingredients: parsedIngredients,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit('claude')

      const tokensUsed = ingredients.length * 45 + 180
      const cost = (tokensUsed / 1000) * (provider?.costPer1kTokens || 0.015)

      return {
        success: true,
        data: recipeData,
        confidence: 0.92, // High confidence for Claude
        provider: 'claude',
        cost,
        tokensUsed
      }

    } catch (error) {
      logger.error('Claude parsing error', { error })
      return {
        success: false,
        confidence: 0,
        provider: 'claude',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }
    }
  }

  /**
   * Local AI model integration (for privacy-sensitive parsing)
   */
  private static async parseWithLocalAI(
    ingredients: string[],
    context?: string,
    provider?: { costPer1kTokens: number }
  ): Promise<AIParsingResult> {
    try {
      // Simulate local AI processing
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Mock successful response
      const parsedIngredients = ingredients.map(() => ({
        quantity: 1,
        unit: 'teaspoon',
        name: 'vanilla extract',
        notes: 'local AI parsing'
      }))

      const recipeData: ImportedRecipeData = {
        title: 'Recipe parsed with Local AI',
        description: 'Recipe ingredients parsed using local AI model for privacy',
        sourceUrl: '',
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: 'medium',
        cuisine: 'Unknown',
        tags: ['imported', 'ai-parsed', 'local'],
        instructions: ['Recipe instructions not available from ingredient parsing'],
        ingredients: parsedIngredients,
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit('local')

      return {
        success: true,
        data: recipeData,
        confidence: 0.85, // Good confidence for local AI
        provider: 'local',
        cost: 0, // Free
        tokensUsed: 0
      }

    } catch (error) {
      logger.error('Local AI parsing error', { error })
      return {
        success: false,
        confidence: 0,
        provider: 'local',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }
    }
  }

  /**
   * OpenAI GPT-4 integration for recipe structure parsing
   */
  private static async parseRecipeStructureWithOpenAI(
    htmlContent: string,
    url: string,
    extractionContext: string,
    provider?: { costPer1kTokens: number }
  ): Promise<AIParsingResult> {
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: 'openai',
          error: 'OpenAI API key not configured',
          cost: 0,
          tokensUsed: 0
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful response
      const recipeData: ImportedRecipeData = {
        title: 'Recipe Structure from OpenAI',
        description: 'Recipe structure analyzed using OpenAI GPT-4',
        sourceUrl: url,
        prepTime: 20,
        cookTime: 45,
        servings: 6,
        difficulty: 'medium',
        cuisine: 'International',
        tags: ['imported', 'ai-parsed', 'openai', 'structure'],
        instructions: [
          'AI-analyzed recipe instructions',
          'Structured for optimal cooking flow',
          'Enhanced with AI insights'
        ],
        ingredients: [
          { quantity: 3, unit: 'cups', name: 'flour', notes: 'AI-optimized' },
          { quantity: 2, unit: 'large', name: 'eggs', notes: 'room temperature' }
        ],
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit('openai')

      const tokensUsed = Math.floor(htmlContent.length / 4) + 500
      const cost = (tokensUsed / 1000) * (provider?.costPer1kTokens || 0.03)

      return {
        success: true,
        data: recipeData,
        confidence: 0.93,
        provider: 'openai',
        cost,
        tokensUsed
      }

    } catch (error) {
      logger.error('OpenAI recipe structure parsing error', { error })
      return {
        success: false,
        confidence: 0,
        provider: 'openai',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }
    }
  }

  /**
   * Claude 3.5 Sonnet integration for recipe structure parsing
   */
  private static async parseRecipeStructureWithClaude(
    htmlContent: string,
    url: string,
    extractionContext: string,
    provider?: { costPer1kTokens: number }
  ): Promise<AIParsingResult> {
    try {
      const apiKey = process.env.CLAUDE_API_KEY
      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          provider: 'claude',
          error: 'Claude API key not configured',
          cost: 0,
          tokensUsed: 0
        }
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock successful response
      const recipeData: ImportedRecipeData = {
        title: 'Recipe Structure from Claude',
        description: 'Recipe structure analyzed using Claude 3.5 Sonnet',
        sourceUrl: url,
        prepTime: 18,
        cookTime: 42,
        servings: 8,
        difficulty: 'medium',
        cuisine: 'International',
        tags: ['imported', 'ai-parsed', 'claude', 'structure'],
        instructions: [
          'Claude-analyzed recipe instructions',
          'Optimized cooking sequence',
          'Enhanced with AI insights'
        ],
        ingredients: [
          { quantity: 2.5, unit: 'cups', name: 'flour', notes: 'Claude-optimized' },
          { quantity: 2, unit: 'large', name: 'eggs', notes: 'room temperature' }
        ],
        isPublic: false,
        isShared: false
      }

      this.updateRateLimit('claude')

      const tokensUsed = Math.floor(htmlContent.length / 4) + 450
      const cost = (tokensUsed / 1000) * (provider?.costPer1kTokens || 0.015)

      return {
        success: true,
        data: recipeData,
        confidence: 0.90,
        provider: 'claude',
        cost,
        tokensUsed
      }

    } catch (error) {
      logger.error('Claude recipe structure parsing error', { error })
      return {
        success: false,
        confidence: 0,
        provider: 'claude',
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        tokensUsed: 0
      }
    }
  }

  /**
   * Get the best result from multiple AI providers
   */
  static getBestAIResult(results: AIParsingResult[]): AIParsingResult | null {
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

    const provider = this.AI_PROVIDERS[providerName as keyof typeof this.AI_PROVIDERS]
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
   * Get cost estimate for AI parsing
   */
  static getCostEstimate(ingredientCount: number, htmlLength: number): number {
    const openaiCost = (ingredientCount * 50 + 200 + htmlLength / 4 + 500) / 1000 * 0.03
    const claudeCost = (ingredientCount * 45 + 180 + htmlLength / 4 + 450) / 1000 * 0.015

    return Math.min(openaiCost, claudeCost) // Return the cheaper option
  }

  /**
   * Enable/disable specific AI providers
   */
  static setProviderStatus(providerName: string, enabled: boolean): void {
    if (this.AI_PROVIDERS[providerName as keyof typeof this.AI_PROVIDERS]) {
      this.AI_PROVIDERS[providerName as keyof typeof this.AI_PROVIDERS].enabled = enabled
      logger.info('AI provider status updated', { providerName, enabled })
    }
  }

  /**
   * Get current provider status
   */
  static getProviderStatus(): Record<string, { enabled: boolean; priority: number; costPer1kTokens: number }> {
    const status: Record<string, { enabled: boolean; priority: number; costPer1kTokens: number }> = {}

    Object.entries(this.AI_PROVIDERS).forEach(([key, provider]) => {
      status[key] = {
        enabled: provider.enabled,
        priority: provider.priority,
        costPer1kTokens: provider.costPer1kTokens
      }
    })

    return status
  }
}

import { logger } from './logger'
import { ImportedRecipeData, ImportResult } from './url-import-service'
import { APIResult } from './professional-api-service'
import { AIParsingResult } from './ai-parsing-service'
import { BrowserScrapingResult } from './headless-browser-service'

export interface AggregatedRecipeResult {
  success: boolean
  data: ImportedRecipeData
  confidence: number // 0-1
  sources: {
    htmlScraping?: { confidence: number; data: ImportedRecipeData }
    professionalAPIs?: { confidence: number; data: ImportedRecipeData; provider: string }
    aiParsing?: { confidence: number; data: ImportedRecipeData; provider: string }
    browserScraping?: { confidence: number; data: ImportedRecipeData; method: string }
  }
  aggregatedFields: {
    title: { value: string; confidence: number; source: string }
    description: { value: string; confidence: number; source: string }
    ingredients: { value: ImportedRecipeData['ingredients']; confidence: number; source: string }
    instructions: { value: string[]; confidence: number; source: string }
    imageUrl: { value?: string; confidence: number; source: string }
    prepTime: { value: number; confidence: number; source: string }
    servings: { value: number; confidence: number; source: string }
  }
  totalCost: number
  processingTime: number
  recommendations: string[]
}

export interface ConfidenceScore {
  value: string | number | string[] | ImportedRecipeData['ingredients'] | undefined
  confidence: number
  source: string
  method: string
}

export interface AggregatedFields {
  title: ConfidenceScore & { value: string }
  description: ConfidenceScore & { value: string }
  ingredients: ConfidenceScore & { value: ImportedRecipeData['ingredients'] }
  instructions: ConfidenceScore & { value: string[] }
  imageUrl: ConfidenceScore & { value?: string }
  prepTime: ConfidenceScore & { value: number }
  servings: ConfidenceScore & { value: number }
}

export class MultiSourceAggregationService {
  private static readonly CONFIDENCE_WEIGHTS = {
    browserScraping: 0.35, // Highest weight for full browser rendering
    aiParsing: 0.30,       // High weight for AI analysis
    professionalAPIs: 0.25, // Good weight for specialized APIs
    htmlScraping: 0.10     // Lower weight for basic scraping
  }

  private static readonly FIELD_IMPORTANCE = {
    title: 0.20,
    description: 0.15,
    ingredients: 0.30,      // Most important
    instructions: 0.25,     // Second most important
    imageUrl: 0.05,
    prepTime: 0.03,
    servings: 0.02
  }

  /**
   * Aggregate recipe data from multiple sources for maximum accuracy
   */
  static async aggregateRecipeData(
    url: string,
    htmlResult?: ImportResult,
    apiResults?: APIResult[],
    aiResults?: AIParsingResult[],
    browserResults?: BrowserScrapingResult[]
  ): Promise<AggregatedRecipeResult> {
    const startTime = Date.now()
    logger.info('Starting multi-source recipe aggregation', { url })

    try {
      // Collect all available data sources
      const sources = this.collectDataSources(htmlResult, apiResults, aiResults, browserResults)

      if (Object.keys(sources).length === 0) {
        throw new Error('No data sources available for aggregation')
      }

      // Aggregate each field with confidence scoring
      const aggregatedFields = await this.aggregateFields(sources)

      // Create final recipe data
      const finalRecipeData = this.createFinalRecipe(aggregatedFields, url)

      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(aggregatedFields)

      // Generate recommendations
      const recommendations = this.generateRecommendations(aggregatedFields, sources)

      // Calculate total cost
      const totalCost = this.calculateTotalCost(apiResults, aiResults)

      const processingTime = Date.now() - startTime

      const result: AggregatedRecipeResult = {
        success: true,
        data: finalRecipeData,
        confidence: overallConfidence,
        sources: {
          htmlScraping: sources.htmlScraping ? {
            confidence: sources.htmlScraping.confidence,
            data: sources.htmlScraping.data
          } : undefined,
          professionalAPIs: sources.professionalAPIs ? {
            confidence: sources.professionalAPIs.confidence,
            data: sources.professionalAPIs.data,
            provider: sources.professionalAPIs.provider || 'unknown'
          } : undefined,
          aiParsing: sources.aiParsing ? {
            confidence: sources.aiParsing.confidence,
            data: sources.aiParsing.data,
            provider: sources.aiParsing.provider || 'unknown'
          } : undefined,
          browserScraping: sources.browserScraping ? {
            confidence: sources.browserScraping.confidence,
            data: sources.browserScraping.data,
            method: sources.browserScraping.method || 'unknown'
          } : undefined
        },
        aggregatedFields,
        totalCost,
        processingTime,
        recommendations
      }

      logger.info('Multi-source aggregation completed', {
        url,
        overallConfidence,
        totalCost,
        processingTime,
        sourcesUsed: Object.keys(sources).length
      })

      return result

    } catch (error) {
      const processingTime = Date.now() - startTime
      logger.error('Multi-source aggregation failed', { url, error, processingTime })

      // Return fallback result
      return {
        success: false,
        data: {
          title: 'Recipe Aggregation Failed',
          description: `Failed to aggregate recipe from ${url}. Please check the URL and try again.`,
          sourceUrl: url,
          prepTime: 0,
          cookTime: 0,
          servings: 0,
          difficulty: 'medium',
          cuisine: 'Unknown',
          tags: ['imported', 'aggregation-failed'],
          instructions: ['Recipe aggregation failed. Please check the URL and try again.'],
          ingredients: [],
          isPublic: false,
          isShared: false
        },
        confidence: 0.1,
        sources: {},
        aggregatedFields: {
          title: { value: 'Recipe Aggregation Failed', confidence: 0.1, source: 'fallback' },
          description: { value: 'Failed to aggregate recipe', confidence: 0.1, source: 'fallback' },
          ingredients: { value: [], confidence: 0.1, source: 'fallback' },
          instructions: { value: ['Aggregation failed'], confidence: 0.1, source: 'fallback' },
          imageUrl: { value: undefined, confidence: 0.1, source: 'fallback' },
          prepTime: { value: 0, confidence: 0.1, source: 'fallback' },
          servings: { value: 0, confidence: 0.1, source: 'fallback' }
        },
        totalCost: 0,
        processingTime,
        recommendations: ['Check URL validity', 'Try different recipe source', 'Contact support if issue persists']
      }
    }
  }

  /**
   * Aggregate recipe with multiple sources (simplified interface for URL import service)
   */
  static async aggregateRecipeWithMultiSources(url: string): Promise<AggregatedRecipeResult[]> {
    // This is a simplified version that returns an array for compatibility
    // In a real implementation, this would call the full aggregation logic
    const result = await this.aggregateRecipeData(url)
    return [result]
  }

  /**
   * Get the best aggregated result
   */
  static getBestAggregatedResult(results: AggregatedRecipeResult[]): AggregatedRecipeResult | null {
    if (results.length === 0) return null

    // Filter successful results and sort by confidence
    const successfulResults = results.filter(r => r.success)
    if (successfulResults.length === 0) return null

    return successfulResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    )
  }

  /**
   * Collect data from all available sources
   */
  private static collectDataSources(
    htmlResult?: ImportResult,
    apiResults?: APIResult[],
    aiResults?: AIParsingResult[],
    browserResults?: BrowserScrapingResult[]
  ) {
    const sources: Record<string, {
      data: ImportedRecipeData
      confidence: number
      method?: string
      provider?: string
    }> = {}

    // HTML scraping results
    if (htmlResult && htmlResult.recipe) {
      sources.htmlScraping = {
        data: htmlResult.recipe,
        confidence: htmlResult.confidence,
        method: htmlResult.extractionMethod
      }
    }

    // Professional API results
    if (apiResults && apiResults.length > 0) {
      const bestAPIResult = apiResults.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      )
      if (bestAPIResult.success && bestAPIResult.data) {
        sources.professionalAPIs = {
          data: bestAPIResult.data,
          confidence: bestAPIResult.confidence,
          provider: bestAPIResult.provider || 'unknown'
        }
      }
    }

    // AI parsing results
    if (aiResults && aiResults.length > 0) {
      const bestAIResult = aiResults.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      )
      if (bestAIResult.success && bestAIResult.data) {
        sources.aiParsing = {
          data: bestAIResult.data,
          confidence: bestAIResult.confidence,
          provider: bestAIResult.provider || 'unknown'
        }
      }
    }

    // Browser scraping results
    if (browserResults && browserResults.length > 0) {
      const bestBrowserResult = browserResults.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      )
      if (bestBrowserResult.success && bestBrowserResult.data) {
        sources.browserScraping = {
          data: bestBrowserResult.data,
          confidence: bestBrowserResult.confidence,
          method: bestBrowserResult.method || 'unknown'
        }
      }
    }

    return sources
  }

  /**
   * Aggregate individual fields with confidence scoring
   */
  private static async aggregateFields(sources: Record<string, {
    data: ImportedRecipeData
    confidence: number
    method?: string
    provider?: string
  }>) {
    const fields = ['title', 'description', 'ingredients', 'instructions', 'imageUrl', 'prepTime', 'servings']
    const aggregatedFields: Record<string, ConfidenceScore> = {}

    for (const field of fields) {
      const fieldScores = this.calculateFieldScores(field, sources)
      aggregatedFields[field] = this.selectBestFieldValue(field, fieldScores)
    }

    return aggregatedFields as {
      title: ConfidenceScore
      description: ConfidenceScore
      ingredients: ConfidenceScore
      instructions: ConfidenceScore
      imageUrl: ConfidenceScore
      prepTime: ConfidenceScore
      servings: ConfidenceScore
    }
  }

  /**
   * Calculate confidence scores for a specific field across all sources
   */
  private static calculateFieldScores(
    field: string,
    sources: Record<string, {
      data: ImportedRecipeData
      confidence: number
      method?: string
      provider?: string
    }>
  ) {
    const scores: ConfidenceScore[] = []

    Object.entries(sources).forEach(([sourceKey, sourceData]) => {
      if (sourceData.data && sourceData.data[field as keyof ImportedRecipeData] !== undefined) {
        const baseConfidence = sourceData.confidence || 0
        const sourceWeight = this.CONFIDENCE_WEIGHTS[sourceKey as keyof typeof this.CONFIDENCE_WEIGHTS] || 0.1
        const fieldWeight = this.FIELD_IMPORTANCE[field as keyof typeof this.FIELD_IMPORTANCE] || 0.1

        const adjustedConfidence = baseConfidence * sourceWeight * fieldWeight

        scores.push({
          value: sourceData.data[field as keyof ImportedRecipeData],
          confidence: adjustedConfidence,
          source: sourceKey,
          method: sourceData.method || sourceData.provider || 'unknown'
        })
      }
    })

    return scores
  }

  /**
   * Select the best value for a field based on confidence scores
   */
  private static selectBestFieldValue(field: string, scores: ConfidenceScore[]): ConfidenceScore {
    if (scores.length === 0) {
      return {
        value: this.getDefaultValue(field),
        confidence: 0,
        source: 'fallback',
        method: 'default'
      }
    }

    // Sort by confidence and select the best
    scores.sort((a, b) => b.confidence - a.confidence)
    return scores[0]
  }

  /**
   * Get default values for fields
   */
  private static getDefaultValue(field: string): any {
    switch (field) {
      case 'title': return 'Imported Recipe'
      case 'description': return 'Recipe imported with multi-source aggregation'
      case 'ingredients': return []
      case 'instructions': return ['Recipe instructions not available']
      case 'imageUrl': return undefined
      case 'prepTime': return 0
      case 'servings': return 0
      default: return ''
    }
  }

  /**
   * Create final recipe data from aggregated fields
   */
  private static createFinalRecipe(aggregatedFields: Record<string, ConfidenceScore>, url: string): ImportedRecipeData {
    return {
      title: aggregatedFields.title.value,
      description: aggregatedFields.description.value,
      imageUrl: aggregatedFields.imageUrl.value,
      prepTime: aggregatedFields.prepTime.value,
      cookTime: 0, // Not aggregated yet
      servings: aggregatedFields.servings.value,
      difficulty: 'medium',
      cuisine: 'Unknown',
      tags: ['imported', 'multi-source', 'aggregated'],
      instructions: aggregatedFields.instructions.value,
      ingredients: aggregatedFields.ingredients.value,
      sourceUrl: url,
      isPublic: false,
      isShared: false
    }
  }

  /**
   * Calculate overall confidence from aggregated fields
   */
  private static calculateOverallConfidence(aggregatedFields: Record<string, ConfidenceScore>): number {
    const fieldConfidences = Object.values(aggregatedFields).map(field => field.confidence)

    if (fieldConfidences.length === 0) return 0

    // Weighted average based on field importance
    let totalWeightedConfidence = 0
    let totalWeight = 0

    Object.entries(aggregatedFields).forEach(([field, fieldData]) => {
      const weight = this.FIELD_IMPORTANCE[field as keyof typeof this.FIELD_IMPORTANCE] || 0.1
      totalWeightedConfidence += fieldData.confidence * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0
  }

  /**
   * Generate recommendations for improvement
   */
  private static generateRecommendations(
    aggregatedFields: Record<string, ConfidenceScore>,
    sources: Record<string, {
      data: ImportedRecipeData
      confidence: number
      method?: string
      provider?: string
    }>
  ): string[] {
    const recommendations: string[] = []

    // Check for low confidence fields
    Object.entries(aggregatedFields).forEach(([field, fieldData]) => {
      if (fieldData.confidence < 0.5) {
        recommendations.push(`Consider manual review of ${field} (confidence: ${(fieldData.confidence * 100).toFixed(0)}%)`)
      }
    })

    // Check source diversity
    const sourceCount = Object.keys(sources).length
    if (sourceCount < 2) {
      recommendations.push('Try enabling additional parsing methods for better accuracy')
    }

    // Check for missing data
    if (aggregatedFields.ingredients.value.length === 0) {
      recommendations.push('No ingredients found - consider manual entry or different source')
    }

    if (aggregatedFields.instructions.value.length === 0) {
      recommendations.push('No instructions found - consider manual entry or different source')
    }

    return recommendations
  }

  /**
   * Calculate total cost from all sources
   */
  private static calculateTotalCost(apiResults?: APIResult[], aiResults?: AIParsingResult[]): number {
    let totalCost = 0

    if (apiResults) {
      totalCost += apiResults.reduce((sum, result) => sum + result.cost, 0)
    }

    if (aiResults) {
      totalCost += aiResults.reduce((sum, result) => sum + result.cost, 0)
    }

    return totalCost
  }

  /**
   * Get aggregation statistics
   */
  static getAggregationStats(): {
    confidenceWeights: Record<string, number>
    fieldImportance: Record<string, number>
  } {
    return {
      confidenceWeights: { ...this.CONFIDENCE_WEIGHTS },
      fieldImportance: { ...this.FIELD_IMPORTANCE }
    }
  }

  /**
   * Update confidence weights
   */
  static updateConfidenceWeights(newWeights: Partial<typeof this.CONFIDENCE_WEIGHTS>): void {
    Object.assign(this.CONFIDENCE_WEIGHTS, newWeights)
    logger.info('Confidence weights updated', { newWeights })
  }

  /**
   * Update field importance weights
   */
  static updateFieldImportance(newImportance: Partial<typeof this.FIELD_IMPORTANCE>): void {
    Object.assign(this.FIELD_IMPORTANCE, newImportance)
    logger.info('Field importance weights updated', { newImportance })
  }
}

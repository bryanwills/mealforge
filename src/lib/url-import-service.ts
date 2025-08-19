import { logger } from './logger'
import { IngredientParser } from './ingredient-parser'
import { RecipeValidationService, ValidationResult } from './recipe-validation-service'
import { ProfessionalAPIService, APIResult } from './professional-api-service'
import { AIParsingService, AIParsingResult } from './ai-parsing-service'

export interface ImportedRecipeData {
  title: string
  description: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  tags: string[]
  instructions: string[]
  sourceUrl: string
  ingredients: {
    quantity: number
    unit: string
    name: string
    notes?: string
  }[]
  isPublic: boolean
  isShared: boolean
}

export interface ImportResult {
  recipe: ImportedRecipeData
  validation: ValidationResult
  extractionMethod: 'html-scraping' | 'professional-api' | 'ai-parsing' | 'fallback'
  confidence: number
  apiResults?: APIResult[]
  aiResults?: AIParsingResult[]
}

interface PrintURLPattern {
  pattern: RegExp
  replacement: string
  priority: number
}

export class URLImportService {
  private static readonly PRINT_URL_PATTERNS: PrintURLPattern[] = [
    {
      pattern: /^https:\/\/[^\/]+\/([^\/]+)$/,
      replacement: 'https://$1/wprm_print/$2',
      priority: 1
    },
    {
      pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
      replacement: 'https://$1/print/$2',
      priority: 2
    },
    {
      pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
      replacement: 'https://$1/print-recipe/$2',
      priority: 3
    },
    {
      pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
      replacement: 'https://$1/print-friendly/$2',
      priority: 4
    },
    {
      pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
      replacement: 'https://$1/printable/$2',
      priority: 5
    }
  ]

  private static readonly RECIPE_SELECTORS = {
    // Common recipe title selectors
    title: [
      'h1[class*="recipe"]',
      'h1[class*="title"]',
      '.recipe-title',
      '.recipe-header h1',
      'h1',
      '[data-testid="recipe-title"]',
      '[itemprop="name"]'
    ],

    // Description selectors
    description: [
      '.recipe-description',
      '.recipe-summary',
      '[itemprop="description"]',
      '.recipe-intro',
      '.recipe-excerpt'
    ],

    // Image selectors
    images: [
      '.recipe-image img',
      '.recipe-photo img',
      '.recipe-header img',
      '[itemprop="image"]',
      '.recipe-gallery img',
      '.recipe-hero img'
    ],

    // Time selectors
    prepTime: [
      '[itemprop="prepTime"]',
      '.prep-time',
      '.recipe-prep-time',
      '[data-testid="prep-time"]'
    ],

    cookTime: [
      '[itemprop="cookTime"]',
      '.cook-time',
      '.recipe-cook-time',
      '[data-testid="cook-time"]'
    ],

    servings: [
      '[itemprop="recipeYield"]',
      '.recipe-servings',
      '.servings',
      '[data-testid="servings"]'
    ],

    // Ingredient selectors
    ingredients: [
      '.recipe-ingredients li',
      '.ingredients li',
      '[itemprop="recipeIngredient"]',
      '.recipe-ingredient',
      '.ingredient-item'
    ],

    // Instruction selectors
    instructions: [
      '.recipe-instructions li',
      '.instructions li',
      '[itemprop="recipeInstructions"]',
      '.recipe-step',
      '.instruction-step'
    ]
  }

  static generatePrintURLs(originalUrl: string): string[] {
    const printUrls: string[] = []

    try {
      const urlObj = new URL(originalUrl)
      const hostname = urlObj.hostname
      const pathname = urlObj.pathname

      // Extract the recipe slug from the path
      const pathParts = pathname.split('/').filter(part => part.length > 0)
      if (pathParts.length === 0) return printUrls

      const recipeSlug = pathParts[pathParts.length - 1]

      // Generate print URLs based on common patterns
      const printPatterns = [
        `https://${hostname}/wprm_print/${recipeSlug}`,
        `https://${hostname}/print/${recipeSlug}`,
        `https://${hostname}/print-recipe/${recipeSlug}`,
        `https://${hostname}/print-friendly/${recipeSlug}`,
        `https://${hostname}/printable/${recipeSlug}`,
        `https://${hostname}/print/${recipeSlug}`,
        `https://${hostname}/recipe/print/${recipeSlug}`,
        `https://${hostname}/recipes/print/${recipeSlug}`
      ]

      printUrls.push(...printPatterns)

      logger.debug('Generated print URLs', {
        originalUrl,
        printUrls,
        recipeSlug
      })

    } catch (error) {
      logger.error('Error generating print URLs', { originalUrl, error })
    }

    return printUrls
  }

  static async checkPrintURLAvailability(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MealForge/1.0)'
        }
      })

      if (response.ok) {
        logger.info('Print URL available', { url })
        return url
      }
    } catch (error) {
      logger.debug('Print URL not available', { url, error })
    }

    return null
  }

  static async findBestPrintURL(originalUrl: string): Promise<string> {
    logger.info('Looking for print-friendly URL', { originalUrl })

    const printUrls = this.generatePrintURLs(originalUrl)

    // Check each print URL in order of preference
    for (const printUrl of printUrls) {
      const available = await this.checkPrintURLAvailability(printUrl)
      if (available) {
        logger.info('Found available print URL', {
          originalUrl,
          printUrl: available
        })
        return available
      }
    }

    logger.info('No print URL available, using original', { originalUrl })
    return originalUrl
  }

  static extractTitleFromURL(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)

      if (pathParts.length === 0) return 'Imported Recipe'

      // Get the last part of the path (most likely the recipe name)
      let title = pathParts[pathParts.length - 1]

      // Remove file extensions
      title = title.replace(/\.(html|htm|php|asp|aspx)$/i, '')

      // Replace hyphens and underscores with spaces
      title = title.replace(/[-_]/g, ' ')

      // Capitalize first letter of each word
      title = title.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      return title || 'Imported Recipe'
    } catch (error) {
      logger.error('Error extracting title from URL', { url, error })
      return 'Imported Recipe'
    }
  }

  static cleanURL(url: string): string {
    try {
      const urlObj = new URL(url)

      // Remove referral parameters
      const paramsToRemove = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'ref', 'referrer', 'source', 'fbclid', 'gclid', 'msclkid'
      ]

      paramsToRemove.forEach(param => {
        urlObj.searchParams.delete(param)
      })

      // Remove trailing slash
      let cleanPath = urlObj.pathname
      if (cleanPath.endsWith('/') && cleanPath !== '/') {
        cleanPath = cleanPath.slice(0, -1)
      }

      return `${urlObj.protocol}//${urlObj.host}${cleanPath}${urlObj.search}`
    } catch (error) {
      logger.error('Error cleaning URL', { url, error })
      return url
    }
  }

  static parseTimeString(timeStr: string): number {
    if (!timeStr) return 0

    // Handle ISO 8601 duration format (PT15M, PT1H30M, etc.)
    const isoMatch = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || '0')
      const minutes = parseInt(isoMatch[2] || '0')
      return hours * 60 + minutes
    }

    // Handle common time formats
    const timeMatch = timeStr.match(/(\d+)\s*(?:hour|hr|h)/i)
    if (timeMatch) {
      return parseInt(timeMatch[1]) * 60
    }

    const minuteMatch = timeStr.match(/(\d+)\s*(?:minute|min|m)/i)
    if (minuteMatch) {
      return parseInt(minuteMatch[1])
    }

    // Try to extract just numbers
    const numberMatch = timeStr.match(/(\d+)/)
    if (numberMatch) {
      return parseInt(numberMatch[1])
    }

    return 0
  }

  static createButterfingerBarsMock(): ImportedRecipeData {
    const ingredientsText = [
      "1 cup (2 sticks / 227 g) unsalted butter, room temperature",
      "1 ½ cups (300 g) granulated sugar",
      "1 tablespoon vanilla",
      "2 large eggs, room temperature",
      "2 ½ cups (312 g) all-purpose flour",
      "1 teaspoon baking soda",
      "½ teaspoon kosher salt",
      "2 cups chopped butterfingers"
    ]
    const parsedIngredients = ingredientsText.map(text => IngredientParser.parseIngredient(text))
    return {
      title: "Butterfinger Bars",
      description: "Everyone will want to 'lay a finger' on these Butterfinger Bars! They are too good not to share, and you will prefer these bars to the candy bar.\n\nOriginal recipe available at https://iambaker.net/butterfinger-bars/",
      sourceUrl: "https://iambaker.net/butterfinger-bars/",
      prepTime: 15,
      cookTime: 18,
      servings: 16,
      difficulty: "medium",
      cuisine: "American",
      tags: ["imported", "url", "dessert", "bars"],
      instructions: [
        "Preheat oven to 350°F (175°C). Line a 9x13 inch baking pan with parchment paper or grease with butter.",
        "In a large bowl, cream together the butter and sugar until light and fluffy, about 2-3 minutes.",
        "Add the vanilla extract and mix until combined.",
        "Add the eggs one at a time, mixing well after each addition.",
        "In a separate bowl, whisk together the flour, baking soda, and salt.",
        "Gradually add the dry ingredients to the wet ingredients, mixing just until combined.",
        "Fold in the chopped Butterfinger pieces.",
        "Spread the batter evenly into the prepared baking pan.",
        "Bake for 18-20 minutes, or until a toothpick inserted into the center comes out clean.",
        "Allow to cool completely in the pan before cutting into bars.",
        "Store in an airtight container at room temperature for up to 5 days."
      ],
      ingredients: parsedIngredients,
      isPublic: false,
      isShared: false
    }
  }

  static async importFromURL(url: string): Promise<ImportResult> {
    logger.info('Starting URL import with enhanced fallback chain', { url })

    try {
      const cleanUrl = this.cleanURL(url)
      const bestUrl = await this.findBestPrintURL(cleanUrl)

      logger.info('Attempting recipe extraction with fallback chain', {
        originalUrl: url,
        cleanUrl,
        bestUrl
      })

      // Phase 1: Try HTML scraping first (highest accuracy, lowest cost)
      let recipeData: ImportedRecipeData | null = null
      let extractionMethod: 'html-scraping' | 'professional-api' | 'ai-parsing' | 'fallback' = 'html-scraping'
      let confidence = 0.6 // Base confidence for HTML scraping
      let apiResults: APIResult[] | undefined
      let aiResults: AIParsingResult[] | undefined

      try {
        const htmlContent = await this.fetchHTMLContent(bestUrl)
        if (htmlContent) {
          recipeData = await this.parseRecipeFromHTML(htmlContent, bestUrl)

          // Check if we got meaningful data
          if (recipeData.ingredients.length > 0 && recipeData.instructions.length > 0) {
            confidence = 0.75 // Good confidence for successful HTML scraping
            logger.info('HTML scraping successful', {
              url: bestUrl,
              title: recipeData.title,
              ingredientCount: recipeData.ingredients.length,
              instructionCount: recipeData.instructions.length
            })
          } else {
            throw new Error('Insufficient data from HTML scraping')
          }
        } else {
          throw new Error('Failed to fetch HTML content')
        }
      } catch (htmlError) {
        logger.warn('HTML scraping failed, falling back to professional APIs', {
          url: bestUrl,
          error: htmlError instanceof Error ? htmlError.message : 'Unknown error'
        })

        // Phase 2: Try professional APIs (high accuracy, moderate cost)
        try {
          apiResults = await ProfessionalAPIService.extractRecipeWithAPIs(bestUrl)
          const bestAPIResult = ProfessionalAPIService.getBestAPIResult(apiResults)

          if (bestAPIResult && bestAPIResult.data) {
            recipeData = bestAPIResult.data
            extractionMethod = 'professional-api'
            confidence = bestAPIResult.confidence

            logger.info('Professional API extraction successful', {
              url: bestUrl,
              provider: bestAPIResult.provider,
              confidence: bestAPIResult.confidence,
              cost: bestAPIResult.cost
            })
          } else {
            throw new Error('All professional APIs failed')
          }
        } catch (apiError) {
          logger.warn('Professional API extraction failed, falling back to AI parsing', {
            url: bestUrl,
            error: apiError instanceof Error ? apiError.message : 'Unknown error'
          })

          // Phase 3: Fallback to AI parsing
          try {
            aiResults = await AIParsingService.parseRecipeWithAI(bestUrl)
            const bestAIResult = AIParsingService.getBestAIResult(aiResults || [])

            if (bestAIResult && bestAIResult.data) {
              recipeData = bestAIResult.data
              extractionMethod = 'ai-parsing'
              confidence = bestAIResult.confidence

              logger.info('AI parsing successful', {
                url: bestUrl,
                provider: bestAIResult.provider,
                confidence: bestAIResult.confidence,
                cost: bestAIResult.cost
              })
            } else {
              throw new Error('All AI parsing services failed')
            }
          } catch (aiError) {
            logger.warn('AI parsing failed, using fallback', {
              url: bestUrl,
              error: aiError instanceof Error ? aiError.message : 'Unknown error'
            })

            // Phase 4: Fallback to basic recipe with URL title
            extractionMethod = 'fallback'
            confidence = 0.3
            recipeData = {
              title: this.extractTitleFromURL(bestUrl),
              description: `Failed to extract recipe from ${bestUrl}. Using basic fallback data.`,
              sourceUrl: cleanUrl,
              prepTime: 0,
              cookTime: 0,
              servings: 0,
              difficulty: "medium",
              cuisine: "Unknown",
              tags: ["imported", "url", "fallback"],
              instructions: ["Recipe extraction failed. Please check the original source and edit manually."],
              ingredients: [],
              isPublic: false,
              isShared: false
            }
          }
        }
      }

      // Ensure we have a recipe data object
      if (!recipeData) {
        throw new Error('Failed to extract recipe data from all methods')
      }

      // Set source URL
      recipeData.sourceUrl = cleanUrl

      // Validate the extracted recipe
      const validation = RecipeValidationService.validateExtractedRecipe(recipeData, url)

      logger.info('URL import completed with fallback chain', {
        url: cleanUrl,
        title: recipeData.title,
        ingredientCount: recipeData.ingredients.length,
        instructionCount: recipeData.instructions.length,
        extractionMethod,
        confidence,
        validationIssues: validation.issues.length,
        isValid: validation.isValid,
        totalCost: apiResults ? apiResults.reduce((sum, r) => sum + r.cost, 0) : 0,
        aiCost: aiResults ? aiResults.reduce((sum, r) => sum + r.cost, 0) : 0
      })

      return {
        recipe: recipeData,
        validation,
        extractionMethod,
        confidence,
        apiResults,
        aiResults
      }
    } catch (error) {
      logger.error('All URL import methods failed', { url, error })

      // Ultimate fallback
      const fallbackRecipe: ImportedRecipeData = {
        title: this.extractTitleFromURL(url) || "Imported Recipe",
        description: `Failed to import recipe from ${url}. Please check the URL and try again.`,
        sourceUrl: url,
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: "medium",
        cuisine: "Unknown",
        tags: ["imported", "url", "failed"],
        instructions: ["Recipe import failed. Please check the URL and try again."],
        ingredients: [],
        isPublic: false,
        isShared: false
      }

      const validation = RecipeValidationService.validateExtractedRecipe(fallbackRecipe, url)

      return {
        recipe: fallbackRecipe,
        validation,
        extractionMethod: 'fallback',
        confidence: 0.1,
        apiResults: [],
        aiResults: []
      }
    }
  }

  private static async fetchHTMLContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MealForge/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })

      if (!response.ok) {
        logger.warn('Failed to fetch HTML content', {
          url,
          status: response.status,
          statusText: response.statusText
        })
        return null
      }

      const html = await response.text()
      logger.debug('Successfully fetched HTML content', {
        url,
        contentLength: html.length
      })

      return html
    } catch (error) {
      logger.error('Error fetching HTML content', { url, error })
      return null
    }
  }

  private static async parseRecipeFromHTML(html: string, url: string): Promise<ImportedRecipeData> {
    try {
      // Create a DOM parser (this will work in Node.js environment)
      const { JSDOM } = await import('jsdom')
      const dom = new JSDOM(html)
      const document = dom.window.document

      // Extract recipe data using selectors
      const title = this.extractTextFromSelectors(document, this.RECIPE_SELECTORS.title, this.RECIPE_SELECTORS.title)
      const description = this.extractTextFromSelectors(document, this.RECIPE_SELECTORS.description, this.RECIPE_SELECTORS.description)
      const imageUrl = this.extractImageFromSelectors(document, this.RECIPE_SELECTORS.images, url)
      const prepTime = this.extractTimeFromSelectors(document, this.RECIPE_SELECTORS.prepTime, this.RECIPE_SELECTORS.prepTime)
      const cookTime = this.extractTimeFromSelectors(document, this.RECIPE_SELECTORS.cookTime, this.RECIPE_SELECTORS.cookTime)
      const servings = this.extractServingsFromSelectors(document, this.RECIPE_SELECTORS.servings, this.RECIPE_SELECTORS.servings)
      const ingredients = this.extractIngredientsFromSelectors(document, this.RECIPE_SELECTORS.ingredients, this.RECIPE_SELECTORS.ingredients)
      const instructions = this.extractInstructionsFromSelectors(document, this.RECIPE_SELECTORS.instructions, this.RECIPE_SELECTORS.instructions)

      // Create recipe data object
      const recipeData: ImportedRecipeData = {
        title: title || this.extractTitleFromURL(url),
        description: description || `Recipe imported from ${url}`,
        imageUrl,
        prepTime,
        cookTime,
        servings,
        difficulty: "medium",
        cuisine: "Unknown",
        tags: ["imported", "url", "scraped"],
        instructions: instructions.length > 0 ? instructions : ["Recipe instructions could not be extracted. Please check the original source."],
        ingredients: ingredients.length > 0 ? ingredients : [],
        sourceUrl: url,
        isPublic: false,
        isShared: false
      }

      logger.info('Successfully parsed recipe from HTML', {
        url,
        title: recipeData.title,
        ingredientCount: recipeData.ingredients.length,
        instructionCount: recipeData.instructions.length
      })

      return recipeData
    } catch (error) {
      logger.error('Error parsing recipe from HTML', { url, error })

      // Return fallback recipe data
      return {
        title: this.extractTitleFromURL(url),
        description: `Recipe imported from ${url}. Parsing failed, please review manually.`,
        sourceUrl: url,
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: "medium",
        cuisine: "Unknown",
        tags: ["imported", "url", "parsing-failed"],
        instructions: ["Recipe parsing failed. Please check the original source."],
        ingredients: [],
        isPublic: false,
        isShared: false
      }
    }
  }

  private static extractTextFromSelectors(document: Document, schemaSelectors: string[], commonSelectors: string[]): string {
    // Try schema.org selector first
    try {
      const schemaElement = document.querySelector(schemaSelectors[0])
      if (schemaElement && schemaElement.textContent) {
        const text = schemaElement.textContent.trim()
        if (text.length > 0) {
          return text
        }
      }
    } catch (error) {
      logger.debug('Error with schema selector', { schemaSelectors, error })
    }

    // Fallback to common selectors
    for (const selector of commonSelectors) {
      try {
        const element = document.querySelector(selector)
        if (element && element.textContent) {
          const text = element.textContent.trim()
          if (text.length > 0) {
            return text
          }
        }
      } catch (error) {
        logger.debug('Error with common selector', { selector, error })
      }
    }

    return ''
  }

  private static extractImageFromSelectors(document: Document, selectors: string[], baseUrl: string): string | undefined {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLImageElement
        if (element && element.src) {
          const imageUrl = element.src
          // Convert relative URLs to absolute URLs
          if (imageUrl.startsWith('/')) {
            const urlObj = new URL(baseUrl)
            return `${urlObj.protocol}//${urlObj.host}${imageUrl}`
          } else if (imageUrl.startsWith('http')) {
            return imageUrl
          }
        }
      } catch (error) {
        logger.debug('Error with image selector', { selector, error })
      }
    }
    return undefined
  }

  private static extractTimeFromSelectors(document: Document, schemaSelectors: string[], commonSelectors: string[]): number {
    const timeText = this.extractTextFromSelectors(document, schemaSelectors, commonSelectors)
    return this.parseTimeString(timeText)
  }

  private static extractServingsFromSelectors(document: Document, schemaSelectors: string[], commonSelectors: string[]): number {
    const servingsText = this.extractTextFromSelectors(document, schemaSelectors, commonSelectors)
    if (!servingsText) return 0

    // Extract numbers from servings text
    const match = servingsText.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  private static extractIngredientsFromSelectors(document: Document, schemaSelectors: string[], commonSelectors: string[]): ImportedRecipeData['ingredients'] {
    const ingredients: ImportedRecipeData['ingredients'] = []

    // Try schema.org selector first
    try {
      const elements = document.querySelectorAll(schemaSelectors[0])
      if (elements.length > 0) {
        for (const element of elements) {
          if (element.textContent) {
            const ingredientText = element.textContent.trim()
            if (ingredientText.length > 0) {
              const parsed = IngredientParser.parseIngredient(ingredientText)
              if (parsed.name) {
                ingredients.push(parsed)
              }
            }
          }
        }
        if (ingredients.length > 0) {
          return ingredients
        }
      }
    } catch (error) {
      logger.debug('Error with schema ingredient selector', { schemaSelectors, error })
    }

    // Fallback to common selectors
    for (const selector of commonSelectors) {
      try {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          for (const element of elements) {
            if (element.textContent) {
              const ingredientText = element.textContent.trim()
              if (ingredientText.length > 0) {
                const parsed = IngredientParser.parseIngredient(ingredientText)
                if (parsed.name) {
                  ingredients.push(parsed)
                }
              }
            }
          }
          if (ingredients.length > 0) {
            break
          }
        }
      } catch (error) {
        logger.debug('Error with common ingredient selector', { selector, error })
      }
    }

    return ingredients
  }

  private static extractInstructionsFromSelectors(document: Document, schemaSelectors: string[], commonSelectors: string[]): string[] {
    const instructions: string[] = []

    // Try schema.org selector first
    try {
      const elements = document.querySelectorAll(schemaSelectors[0])
      if (elements.length > 0) {
        for (const element of elements) {
          if (element.textContent) {
            const instructionText = element.textContent.trim()
            if (instructionText.length > 0) {
              instructions.push(instructionText)
            }
          }
        }
        if (instructions.length > 0) {
          return instructions
        }
      }
    } catch (error) {
      logger.debug('Error with schema instruction selector', { schemaSelectors, error })
    }

    // Fallback to common selectors
    for (const selector of commonSelectors) {
      try {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          for (const element of elements) {
            if (element.textContent) {
              const instructionText = element.textContent.trim()
              if (instructionText.length > 0) {
                instructions.push(instructionText)
              }
            }
          }
          if (instructions.length > 0) {
            break
          }
        }
      } catch (error) {
        logger.debug('Error with common instruction selector', { selector, error })
      }
    }

    return instructions
  }
}
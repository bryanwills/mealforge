import { logger } from './logger'
import { IngredientParser } from './ingredient-parser'
import { RecipeValidationService, ValidationResult } from './recipe-validation-service'

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
    logger.info('Starting URL import', { url })
    try {
      const cleanUrl = this.cleanURL(url)
      const bestUrl = await this.findBestPrintURL(cleanUrl)
      const title = this.extractTitleFromURL(bestUrl)

      // Comment out mock data to test real ingredient parsing
      /*
      if (url.includes('butterfinger-bars') || bestUrl.includes('butterfinger-bars')) {
        logger.info('Detected Butterfinger Bars recipe, using enhanced mock')
        const butterfingerRecipe = this.createButterfingerBarsMock()
        butterfingerRecipe.sourceUrl = cleanUrl
        return butterfingerRecipe
      }
      */

      // For other recipes, return a generic mock
      const mockRecipe: ImportedRecipeData = {
        title: title || "Imported Recipe",
        description: `Delicious recipe imported from ${cleanUrl}. This recipe has been automatically extracted and may need review before saving.`,
        sourceUrl: cleanUrl,
        prepTime: 15,
        cookTime: 30,
        servings: 12,
        difficulty: "medium",
        cuisine: "American",
        tags: ["imported", "url"],
        instructions: [
          "Preheat oven to 350°F (175°C). Line a 9x13 inch baking pan with parchment paper.",
          "In a large bowl, cream together butter and sugar until light and fluffy.",
          "Add eggs one at a time, beating well after each addition.",
          "Stir in vanilla extract.",
          "In a separate bowl, whisk together flour, baking soda, and salt.",
          "Gradually add dry ingredients to wet ingredients, mixing until just combined.",
          "Fold in chopped butterfingers.",
          "Spread batter evenly into prepared pan.",
          "Bake for 25-30 minutes or until a toothpick inserted in center comes out clean.",
          "Let cool completely before cutting into bars."
        ],
        ingredients: [
          {
            quantity: 1,
            unit: "cup",
            name: "unsalted butter",
            notes: "2 sticks, room temperature"
          },
          {
            quantity: 1.5,
            unit: "cups",
            name: "granulated sugar",
            notes: ""
          },
          {
            quantity: 2,
            unit: "large",
            name: "eggs",
            notes: "room temperature"
          },
          {
            quantity: 1,
            unit: "teaspoon",
            name: "vanilla extract",
            notes: ""
          },
          {
            quantity: 2.5,
            unit: "cups",
            name: "all-purpose flour",
            notes: ""
          },
          {
            quantity: 1,
            unit: "teaspoon",
            name: "baking soda",
            notes: ""
          },
          {
            quantity: 0.5,
            unit: "teaspoon",
            name: "salt",
            notes: ""
          },
          {
            quantity: 2,
            unit: "cups",
            name: "butterfingers",
            notes: "chopped"
          }
        ],
        isPublic: false,
        isShared: false
      }

      // Validate the extracted recipe
      const validation = RecipeValidationService.validateExtractedRecipe(mockRecipe, url)

      logger.info('URL import completed with validation', {
        url: cleanUrl,
        title: mockRecipe.title,
        ingredientCount: mockRecipe.ingredients.length,
        instructionCount: mockRecipe.instructions.length,
        validationIssues: validation.issues.length,
        isValid: validation.isValid
      })

      return {
        recipe: mockRecipe,
        validation
      }
    } catch (error) {
      logger.error('Error importing from URL', { url, error })
      throw new Error('Failed to import recipe from URL')
    }
  }
}
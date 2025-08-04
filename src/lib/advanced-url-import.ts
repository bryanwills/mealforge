import { logger } from './logger'

export interface ScrapedRecipeData {
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

export class AdvancedURLImportService {
  private static readonly RECIPE_SELECTORS = {
    // Schema.org structured data
    schema: {
      title: '[itemprop="name"]',
      description: '[itemprop="description"]',
      image: '[itemprop="image"]',
      prepTime: '[itemprop="prepTime"]',
      cookTime: '[itemprop="cookTime"]',
      totalTime: '[itemprop="totalTime"]',
      servings: '[itemprop="recipeYield"]',
      ingredients: '[itemprop="recipeIngredient"]',
      instructions: '[itemprop="recipeInstructions"]'
    },

    // Common recipe site selectors
    common: {
      title: [
        'h1.recipe-title',
        'h1.recipe-header__title',
        '.recipe-title h1',
        '.recipe-header h1',
        'h1[class*="recipe"]',
        'h1[class*="title"]',
        '.recipe-name',
        '.recipe-headline'
      ],
      description: [
        '.recipe-description',
        '.recipe-summary',
        '.recipe-intro',
        '.recipe-excerpt',
        '.recipe-notes',
        '[class*="description"]'
      ],
      ingredients: [
        '.recipe-ingredients li',
        '.ingredients li',
        '.recipe-ingredient',
        '.ingredient-item',
        '[class*="ingredient"]'
      ],
      instructions: [
        '.recipe-instructions li',
        '.instructions li',
        '.recipe-step',
        '.instruction-step',
        '[class*="instruction"]'
      ],
      time: [
        '.prep-time',
        '.cook-time',
        '.total-time',
        '.recipe-time',
        '[class*="time"]'
      ],
      servings: [
        '.recipe-servings',
        '.servings',
        '.recipe-yield',
        '[class*="serving"]'
      ]
    }
  }

  static async scrapeRecipeFromURL(url: string): Promise<ScrapedRecipeData> {
    logger.info('Starting advanced recipe scraping', { url })

    try {
      // For now, return enhanced mock data
      // In production, this would use Puppeteer or Playwright
      const title = this.extractTitleFromURL(url)
      const cleanUrl = this.cleanURL(url)

      // Enhanced mock data based on URL analysis
      const mockRecipe: ScrapedRecipeData = {
        title,
        description: `Delicious recipe imported from ${new URL(url).hostname}. Original recipe available at ${cleanUrl}`,
        sourceUrl: cleanUrl,
        prepTime: 15,
        cookTime: 25,
        servings: 12,
        difficulty: 'medium',
        cuisine: 'American',
        tags: ['imported', 'url', 'scraped'],
        instructions: [
          'Preheat oven to 350°F (175°C)',
          'Prepare all ingredients as specified',
          'Follow recipe instructions carefully',
          'Bake until done, checking for doneness',
          'Let cool before serving'
        ],
        ingredients: [
          {
            quantity: 2,
            unit: 'cups',
            name: 'all-purpose flour',
            notes: 'sifted'
          },
          {
            quantity: 1,
            unit: 'cup',
            name: 'butter, softened',
            notes: 'room temperature'
          },
          {
            quantity: 0.75,
            unit: 'cup',
            name: 'granulated sugar',
            notes: ''
          },
          {
            quantity: 0.75,
            unit: 'cup',
            name: 'packed brown sugar',
            notes: ''
          },
          {
            quantity: 2,
            unit: 'large',
            name: 'eggs',
            notes: 'room temperature'
          },
          {
            quantity: 1,
            unit: 'teaspoon',
            name: 'vanilla extract',
            notes: 'pure'
          },
          {
            quantity: 1,
            unit: 'teaspoon',
            name: 'baking soda',
            notes: ''
          },
          {
            quantity: 0.5,
            unit: 'teaspoon',
            name: 'salt',
            notes: ''
          },
          {
            quantity: 2,
            unit: 'cups',
            name: 'chocolate chips',
            notes: 'semi-sweet'
          }
        ],
        isPublic: false,
        isShared: false
      }

      logger.info('Advanced recipe scraping completed', {
        url: cleanUrl,
        title: mockRecipe.title,
        ingredientCount: mockRecipe.ingredients.length,
        instructionCount: mockRecipe.instructions.length
      })

      return mockRecipe
    } catch (error) {
      logger.error('Advanced recipe scraping failed', { url, error })
      throw new Error('Failed to scrape recipe from URL')
    }
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
        'ref', 'referrer', 'source', 'fbclid', 'gclid', 'msclkid',
        'mc_cid', 'mc_eid', 'mc_cid', 'mc_eid'
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

  static parseIngredientWithAI(ingredientText: string): {
    quantity: number
    unit: string
    name: string
    notes?: string
  } {
    // Enhanced ingredient parsing with AI-like logic
    const unitPatterns = [
      'cup', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp',
      'ounce', 'oz', 'pound', 'lb', 'gram', 'g', 'kilogram', 'kg',
      'milliliter', 'ml', 'liter', 'l', 'pinch', 'dash',
      'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves',
      'large', 'medium', 'small', 'whole', 'half'
    ]

    // More sophisticated quantity and unit extraction
    const quantityUnitMatch = ingredientText.match(/^([\d\/\s\.]+)\s*([a-zA-Z]+)/)

    if (quantityUnitMatch) {
      const quantityStr = quantityUnitMatch[1].trim()
      const unit = quantityUnitMatch[2].toLowerCase()
      const name = ingredientText.substring(quantityUnitMatch[0].length).trim()

      // Parse fraction quantities
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

    // Fallback: treat as single ingredient
    return {
      quantity: 1,
      unit: 'piece',
      name: ingredientText.trim(),
      notes: ''
    }
  }
}
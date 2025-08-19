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

export class URLImportService {
  private static readonly PRINT_URL_PATTERNS = [
    'wprm_print',
    'print',
    'print-recipe',
    'print-friendly',
    'printable',
    'recipe/print',
    'recipes/print'
  ]

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
      const cleanUrl = this.cleanURL(url)
      const bestUrl = await this.findBestPrintURL(cleanUrl)

      logger.info('Attempting to scrape recipe from URL', {
        originalUrl: url,
        cleanUrl,
        bestUrl
      })

      // Fetch and parse the HTML content
      const htmlContent = await this.fetchHTMLContent(bestUrl)
      if (!htmlContent) {
        throw new Error('Failed to fetch HTML content from URL')
      }

      // Parse recipe data from HTML
      const recipeData = await this.parseRecipeFromHTML(htmlContent, bestUrl)

      // Extract title from URL as fallback if HTML parsing fails
      if (!recipeData.title) {
        recipeData.title = this.extractTitleFromURL(bestUrl)
      }

      // Set source URL
      recipeData.sourceUrl = cleanUrl

      logger.info('Advanced recipe scraping completed', {
        url: cleanUrl,
        title: recipeData.title,
        ingredientCount: recipeData.ingredients.length,
        instructionCount: recipeData.instructions.length
      })

      return recipeData
    } catch (error) {
      logger.error('Advanced recipe scraping failed', { url, error })

      // Fallback to enhanced mock data
      const title = this.extractTitleFromURL(url)
      const cleanUrl = this.cleanURL(url)

      const fallbackRecipe: ScrapedRecipeData = {
        title,
        description: `Failed to scrape recipe from ${cleanUrl}. Using enhanced fallback data.`,
        sourceUrl: cleanUrl,
        prepTime: 15,
        cookTime: 25,
        servings: 12,
        difficulty: 'medium',
        cuisine: 'American',
        tags: ['imported', 'url', 'fallback'],
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

      return fallbackRecipe
    }
  }

  static async findBestPrintURL(originalUrl: string): Promise<string> {
    logger.info('Looking for print-friendly URL', { originalUrl })

    try {
      const urlObj = new URL(originalUrl)
      const hostname = urlObj.hostname
      const pathname = urlObj.pathname

      // Extract the recipe slug from the path
      const pathParts = pathname.split('/').filter(part => part.length > 0)
      if (pathParts.length === 0) return originalUrl

      const recipeSlug = pathParts[pathParts.length - 1]

      // Generate print URLs based on common patterns
      const printUrls = this.PRINT_URL_PATTERNS.map(pattern =>
        `https://${hostname}/${pattern}/${recipeSlug}`
      )

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
    } catch (error) {
      logger.error('Error finding print URL', { originalUrl, error })
      return originalUrl
    }
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

  private static async parseRecipeFromHTML(html: string, url: string): Promise<ScrapedRecipeData> {
    try {
      // Create a DOM parser (this will work in Node.js environment)
      const { JSDOM } = await import('jsdom')
      const dom = new JSDOM(html)
      const document = dom.window.document

      // Extract recipe data using selectors
      const title = this.extractTextFromSelectors(document, this.RECIPE_SELECTORS.schema.title, this.RECIPE_SELECTORS.common.title)
      const description = this.extractTextFromSelectors(document, this.RECIPE_SELECTORS.schema.description, this.RECIPE_SELECTORS.common.description)
      const imageUrl = this.extractImageFromSelectors(document, this.RECIPE_SELECTORS.schema.image, url)
      const prepTime = this.extractTimeFromSelectors(document, this.RECIPE_SELECTORS.schema.prepTime, this.RECIPE_SELECTORS.common.time)
      const cookTime = this.extractTimeFromSelectors(document, this.RECIPE_SELECTORS.schema.cookTime, this.RECIPE_SELECTORS.common.time)
      const servings = this.extractServingsFromSelectors(document, this.RECIPE_SELECTORS.schema.servings, this.RECIPE_SELECTORS.common.servings)
      const ingredients = this.extractIngredientsFromSelectors(document, this.RECIPE_SELECTORS.schema.ingredients, this.RECIPE_SELECTORS.common.ingredients)
      const instructions = this.extractInstructionsFromSelectors(document, this.RECIPE_SELECTORS.schema.instructions, this.RECIPE_SELECTORS.common.instructions)

      // Create recipe data object
      const recipeData: ScrapedRecipeData = {
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

  private static extractTextFromSelectors(document: Document, schemaSelector: string, commonSelectors: string[]): string {
    // Try schema.org selector first
    try {
      const schemaElement = document.querySelector(schemaSelector)
      if (schemaElement && schemaElement.textContent) {
        const text = schemaElement.textContent.trim()
        if (text.length > 0) {
          return text
        }
      }
    } catch (error) {
      logger.debug('Error with schema selector', { schemaSelector, error })
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

  private static extractImageFromSelectors(document: Document, selector: string, baseUrl: string): string | undefined {
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
    return undefined
  }

  private static extractTimeFromSelectors(document: Document, schemaSelector: string, commonSelectors: string[]): number {
    const timeText = this.extractTextFromSelectors(document, schemaSelector, commonSelectors)
    return this.parseTimeString(timeText)
  }

  private static extractServingsFromSelectors(document: Document, schemaSelector: string, commonSelectors: string[]): number {
    const servingsText = this.extractTextFromSelectors(document, schemaSelector, commonSelectors)
    if (!servingsText) return 0

    // Extract numbers from servings text
    const match = servingsText.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  private static extractIngredientsFromSelectors(document: Document, schemaSelector: string, commonSelectors: string[]): ScrapedRecipeData['ingredients'] {
    const ingredients: ScrapedRecipeData['ingredients'] = []

    // Try schema.org selector first
    try {
      const elements = document.querySelectorAll(schemaSelector)
      if (elements.length > 0) {
        for (const element of elements) {
          if (element.textContent) {
            const ingredientText = element.textContent.trim()
            if (ingredientText.length > 0) {
              const parsed = this.parseIngredientWithAI(ingredientText)
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
      logger.debug('Error with schema ingredient selector', { schemaSelector, error })
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
                const parsed = this.parseIngredientWithAI(ingredientText)
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

  private static extractInstructionsFromSelectors(document: Document, schemaSelector: string, commonSelectors: string[]): string[] {
    const instructions: string[] = []

    // Try schema.org selector first
    try {
      const elements = document.querySelectorAll(schemaSelector)
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
      logger.debug('Error with schema instruction selector', { schemaSelector, error })
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

  private static parseTimeString(timeStr: string): number {
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
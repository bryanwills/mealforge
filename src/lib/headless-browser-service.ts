import { logger } from './logger'
import { ImportedRecipeData } from './url-import-service'

export interface BrowserScrapingResult {
  success: boolean
  data?: ImportedRecipeData
  confidence: number // 0-1
  method: 'puppeteer' | 'playwright' | 'fallback'
  error?: string
  screenshotPath?: string
  renderTime: number // milliseconds
  contentLength: number // characters
}

export interface BrowserScrapingConfig {
  timeout: number // milliseconds
  viewport: { width: number; height: number }
  userAgent: string
  waitForSelector: string
  screenshotEnabled: boolean
  javascriptEnabled: boolean
  stealthMode: boolean
}

export class HeadlessBrowserService {
  private static readonly DEFAULT_CONFIG: BrowserScrapingConfig = {
    timeout: 30000, // 30 seconds
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    waitForSelector: '.recipe-content, .recipe-ingredients, [itemprop="recipeIngredient"]',
    screenshotEnabled: true,
    javascriptEnabled: true,
    stealthMode: true
  }

  private static readonly STEALTH_SCRIPTS = [
    // Hide automation indicators
    'Object.defineProperty(navigator, "webdriver", { get: () => undefined })',
    // Override permissions
    'Object.defineProperty(navigator, "permissions", { get: () => ({ query: () => Promise.resolve({ state: "granted" }) }) })',
    // Override plugins
    'Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] })',
    // Override languages
    'Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] })',
    // Override platform
    'Object.defineProperty(navigator, "platform", { get: () => "MacIntel" })'
  ]

  /**
   * Scrape recipe using headless browser for maximum accuracy
   * Falls back through multiple methods: Playwright → Puppeteer → Basic
   */
  static async scrapeRecipeWithBrowser(
    url: string,
    config?: Partial<BrowserScrapingConfig>
  ): Promise<BrowserScrapingResult[]> {
    logger.info('Starting headless browser scraping', { url })

    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    const results: BrowserScrapingResult[] = []

    // Try Playwright first (most reliable)
    try {
      const playwrightResult = await this.scrapeWithPlaywright(url, finalConfig)
      results.push(playwrightResult)

      if (playwrightResult.success && playwrightResult.confidence > 0.95) {
        logger.info('Playwright scraping successful with high confidence', {
          url,
          confidence: playwrightResult.confidence,
          renderTime: playwrightResult.renderTime
        })
        return results
      }
    } catch (error) {
      logger.warn('Playwright scraping failed', { url, error })
    }

    // Try Puppeteer as fallback
    try {
      const puppeteerResult = await this.scrapeWithPuppeteer(url, finalConfig)
      results.push(puppeteerResult)

      if (puppeteerResult.success && puppeteerResult.confidence > 0.95) {
        logger.info('Puppeteer scraping successful with high confidence', {
          url,
          confidence: puppeteerResult.confidence,
          renderTime: puppeteerResult.renderTime
        })
        return results
      }
    } catch (error) {
      logger.warn('Puppeteer scraping failed', { url, error })
    }

    // Basic fallback
    const fallbackResult: BrowserScrapingResult = {
      success: false,
      confidence: 0.3,
      method: 'fallback',
      error: 'All browser scraping methods failed',
      renderTime: 0,
      contentLength: 0
    }
    results.push(fallbackResult)

    logger.info('Headless browser scraping completed', {
      url,
      totalResults: results.length,
      successfulResults: results.filter(r => r.success).length,
      bestConfidence: Math.max(...results.map(r => r.confidence))
    })

    return results
  }

  /**
   * Scrape using Playwright (most reliable)
   */
  private static async scrapeWithPlaywright(
    url: string,
    config: BrowserScrapingConfig
  ): Promise<BrowserScrapingResult> {
    const startTime = Date.now()

    try {
      // Check if Playwright is available
      const { chromium } = await this.importPlaywright()

      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })

      const context = await browser.newContext({
        viewport: config.viewport,
        userAgent: config.userAgent,
        javaScriptEnabled: config.javascriptEnabled
      })

      // Add stealth scripts
      if (config.stealthMode) {
        await context.addInitScript(() => {
          this.STEALTH_SCRIPTS.forEach(script => {
            try {
              eval(script)
            } catch (e) {
              // Ignore script errors
            }
          })
        })
      }

      const page = await context.newPage()

      // Set timeout
      page.setDefaultTimeout(config.timeout)

      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle' })

      // Wait for recipe content
      try {
        await page.waitForSelector(config.waitForSelector, { timeout: 10000 })
      } catch (error) {
        logger.warn('Recipe content selector not found, proceeding anyway', { url, selector: config.waitForSelector })
      }

      // Take screenshot if enabled
      let screenshotPath: string | undefined
      if (config.screenshotEnabled) {
        screenshotPath = await this.captureScreenshot(page, url)
      }

      // Extract recipe data
      const recipeData = await this.extractRecipeFromPage(page, url)

      const renderTime = Date.now() - startTime
      const contentLength = recipeData.description?.length || 0

      await browser.close()

      return {
        success: true,
        data: recipeData,
        confidence: 0.98, // Very high confidence for Playwright
        method: 'puppeteer',
        screenshotPath,
        renderTime,
        contentLength
      }

    } catch (error) {
      const renderTime = Date.now() - startTime
      logger.error('Playwright scraping error', { url, error, renderTime })

      return {
        success: false,
        confidence: 0,
        method: 'puppeteer',
        error: error instanceof Error ? error.message : 'Unknown error',
        renderTime,
        contentLength: 0
      }
    }
  }

  /**
   * Scrape using Puppeteer (fallback)
   */
  private static async scrapeWithPuppeteer(
    url: string,
    config: BrowserScrapingConfig
  ): Promise<BrowserScrapingResult> {
    const startTime = Date.now()

    try {
      // Check if Puppeteer is available
      const puppeteer = await this.importPuppeteer()

      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })

      const page = await browser.newPage()

      // Set viewport and user agent
      await page.setViewport(config.viewport)
      await page.setUserAgent(config.userAgent)

      // Set timeout
      page.setDefaultTimeout(config.timeout)

      // Add stealth scripts
      if (config.stealthMode) {
        await page.evaluateOnNewDocument(() => {
          this.STEALTH_SCRIPTS.forEach(script => {
            try {
              eval(script)
            } catch (e) {
              // Ignore script errors
            }
          })
        })
      }

      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2' })

      // Wait for recipe content
      try {
        await page.waitForSelector(config.waitForSelector, { timeout: 10000 })
      } catch (error) {
        logger.warn('Recipe content selector not found, proceeding anyway', { url, selector: config.waitForSelector })
      }

      // Take screenshot if enabled
      let screenshotPath: string | undefined
      if (config.screenshotEnabled) {
        screenshotPath = await this.captureScreenshotPuppeteer(page, url)
      }

      // Extract recipe data
      const recipeData = await this.extractRecipeFromPagePuppeteer(page, url)

      const renderTime = Date.now() - startTime
      const contentLength = recipeData.description?.length || 0

      await browser.close()

      return {
        success: true,
        data: recipeData,
        confidence: 0.95, // High confidence for Puppeteer
        method: 'puppeteer',
        screenshotPath,
        renderTime,
        contentLength
      }

    } catch (error) {
      const renderTime = Date.now() - startTime
      logger.error('Puppeteer scraping error', { url, error, renderTime })

      return {
        success: false,
        confidence: 0,
        method: 'puppeteer',
        error: error instanceof Error ? error.message : 'Unknown error',
        renderTime,
        contentLength: 0
      }
    }
  }

  /**
   * Extract recipe data from Playwright page
   */
  private static async extractRecipeFromPage(page: any, url: string): Promise<ImportedRecipeData> {
    const recipeData = await page.evaluate(() => {
      // Enhanced selectors for maximum coverage
      const selectors = {
        title: [
          'h1[class*="recipe"]',
          'h1[class*="title"]',
          '.recipe-title',
          '.recipe-header h1',
          'h1',
          '[data-testid="recipe-title"]',
          '[itemprop="name"]',
          'h1.recipe-name',
          '.recipe-headline'
        ],
        description: [
          '.recipe-description',
          '.recipe-summary',
          '[itemprop="description"]',
          '.recipe-intro',
          '.recipe-excerpt',
          '.recipe-notes'
        ],
        ingredients: [
          '.recipe-ingredients li',
          '.ingredients li',
          '[itemprop="recipeIngredient"]',
          '.recipe-ingredient',
          '.ingredient-item',
          '.ingredient'
        ],
        instructions: [
          '.recipe-instructions li',
          '.instructions li',
          '[itemprop="recipeInstructions"]',
          '.recipe-step',
          '.instruction-step',
          '.direction'
        ],
        time: [
          '[itemprop="prepTime"]',
          '[itemprop="cookTime"]',
          '.prep-time',
          '.cook-time',
          '.recipe-time'
        ],
        servings: [
          '[itemprop="recipeYield"]',
          '.recipe-servings',
          '.servings',
          '.yield'
        ],
        image: [
          '.recipe-image img',
          '.recipe-photo img',
          '[itemprop="image"]',
          '.recipe-hero img'
        ]
      }

      const extractText = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const element = document.querySelector(selector)
          if (element && element.textContent) {
            return element.textContent.trim()
          }
        }
        return ''
      }

      const extractList = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            return Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text.length > 0)
          }
        }
        return []
      }

      const extractImage = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const element = document.querySelector(selector) as HTMLImageElement
          if (element && element.src) {
            return element.src
          }
        }
        return ''
      }

      return {
        title: extractText(selectors.title),
        description: extractText(selectors.description),
        ingredients: extractList(selectors.ingredients),
        instructions: extractList(selectors.instructions),
        prepTime: extractText(selectors.time),
        servings: extractText(selectors.servings),
        imageUrl: extractImage(selectors.image)
      }
    })

    // Convert to ImportedRecipeData format
    return {
      title: recipeData.title || 'Recipe from Browser Scraping',
      description: recipeData.description || 'Recipe extracted using headless browser for maximum accuracy',
      imageUrl: recipeData.imageUrl,
      prepTime: this.parseTimeString(recipeData.prepTime),
      cookTime: 0,
      servings: this.parseServings(recipeData.servings),
      difficulty: 'medium',
      cuisine: 'Unknown',
      tags: ['imported', 'browser-scraped', 'playwright'],
      instructions: recipeData.instructions.length > 0 ? recipeData.instructions : ['Recipe instructions extracted via browser scraping'],
      ingredients: recipeData.ingredients.map((text: string) => this.parseIngredientText(text)),
      sourceUrl: url,
      isPublic: false,
      isShared: false
    }
  }

  /**
   * Extract recipe data from Puppeteer page
   */
  private static async extractRecipeFromPagePuppeteer(page: any, url: string): Promise<ImportedRecipeData> {
    const recipeData = await page.evaluate(() => {
      // Same extraction logic as Playwright
      const selectors = {
        title: [
          'h1[class*="recipe"]',
          'h1[class*="title"]',
          '.recipe-title',
          '.recipe-header h1',
          'h1',
          '[data-testid="recipe-title"]',
          '[itemprop="name"]'
        ],
        description: [
          '.recipe-description',
          '.recipe-summary',
          '[itemprop="description"]',
          '.recipe-intro',
          '.recipe-excerpt'
        ],
        ingredients: [
          '.recipe-ingredients li',
          '.ingredients li',
          '[itemprop="recipeIngredient"]',
          '.recipe-ingredient',
          '.ingredient-item'
        ],
        instructions: [
          '.recipe-instructions li',
          '.instructions li',
          '[itemprop="recipeInstructions"]',
          '.recipe-step',
          '.instruction-step'
        ],
        time: [
          '[itemprop="prepTime"]',
          '.prep-time',
          '.recipe-time'
        ],
        servings: [
          '[itemprop="recipeYield"]',
          '.recipe-servings',
          '.servings'
        ],
        image: [
          '.recipe-image img',
          '.recipe-photo img',
          '[itemprop="image"]'
        ]
      }

      const extractText = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const element = document.querySelector(selector)
          if (element && element.textContent) {
            return element.textContent.trim()
          }
        }
        return ''
      }

      const extractList = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            return Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text.length > 0)
          }
        }
        return []
      }

      const extractImage = (selectorList: string[]) => {
        for (const selector of selectorList) {
          const element = document.querySelector(selector) as HTMLImageElement
          if (element && element.src) {
            return element.src
          }
        }
        return ''
      }

      return {
        title: extractText(selectors.title),
        description: extractText(selectors.description),
        ingredients: extractList(selectors.ingredients),
        instructions: extractList(selectors.instructions),
        prepTime: extractText(selectors.time),
        servings: extractText(selectors.servings),
        imageUrl: extractImage(selectors.image)
      }
    })

    // Convert to ImportedRecipeData format
    return {
      title: recipeData.title || 'Recipe from Browser Scraping',
      description: recipeData.description || 'Recipe extracted using headless browser for maximum accuracy',
      imageUrl: recipeData.imageUrl,
      prepTime: this.parseTimeString(recipeData.prepTime),
      cookTime: 0,
      servings: this.parseServings(recipeData.servings),
      difficulty: 'medium',
      cuisine: 'Unknown',
      tags: ['imported', 'browser-scraped', 'puppeteer'],
      instructions: recipeData.instructions.length > 0 ? recipeData.instructions : ['Recipe instructions extracted via browser scraping'],
      ingredients: recipeData.ingredients.map((text: string) => this.parseIngredientText(text)),
      sourceUrl: url,
      isPublic: false,
      isShared: false
    }
  }

  /**
   * Capture screenshot using Playwright
   */
  private static async captureScreenshot(page: any, url: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const filename = `recipe-screenshot-${timestamp}.png`
      const path = `./public/screenshots/${filename}`

      await page.screenshot({
        path,
        fullPage: true,
        quality: 90
      })

      return path
    } catch (error) {
      logger.warn('Failed to capture screenshot', { url, error })
      return ''
    }
  }

  /**
   * Capture screenshot using Puppeteer
   */
  private static async captureScreenshotPuppeteer(page: any, url: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const filename = `recipe-screenshot-${timestamp}.png`
      const path = `./public/screenshots/${filename}`

      await page.screenshot({
        path,
        fullPage: true,
        quality: 90
      })

      return path
    } catch (error) {
      logger.warn('Failed to capture screenshot', { url, error })
      return ''
    }
  }

  /**
   * Dynamic imports for optional dependencies
   */
  private static async importPlaywright() {
    try {
      return await import('playwright')
    } catch (error) {
      throw new Error('Playwright not installed. Run: npm install playwright')
    }
  }

  private static async importPuppeteer() {
    try {
      return await import('puppeteer')
    } catch (error) {
      throw new Error('Puppeteer not installed. Run: npm install puppeteer')
    }
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
   * Parse ingredient text to structured format
   */
  private static parseIngredientText(text: string): {
    quantity: number
    unit: string
    name: string
    notes?: string
  } {
    const unitPatterns = [
      'cup', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp',
      'ounce', 'oz', 'pound', 'lb', 'gram', 'g', 'kilogram', 'kg',
      'milliliter', 'ml', 'liter', 'l', 'pinch', 'dash'
    ]

    const quantityUnitMatch = text.match(/^([\d\/\s\.]+)\s*([a-zA-Z]+)/)

    if (quantityUnitMatch) {
      const quantityStr = quantityUnitMatch[1].trim()
      const unit = quantityUnitMatch[2].toLowerCase()
      const name = text.substring(quantityUnitMatch[0].length).trim()

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
      name: text.trim(),
      notes: ''
    }
  }

  /**
   * Get the best browser scraping result
   */
  static getBestBrowserResult(results: BrowserScrapingResult[]): BrowserScrapingResult | null {
    if (results.length === 0) return null

    // Filter successful results and sort by confidence
    const successfulResults = results.filter(r => r.success)
    if (successfulResults.length === 0) return null

    return successfulResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    )
  }

  /**
   * Get browser scraping configuration
   */
  static getDefaultConfig(): BrowserScrapingConfig {
    return { ...this.DEFAULT_CONFIG }
  }

  /**
   * Update browser scraping configuration
   */
  static updateConfig(newConfig: Partial<BrowserScrapingConfig>): void {
    Object.assign(this.DEFAULT_CONFIG, newConfig)
    logger.info('Browser scraping configuration updated', { newConfig })
  }
}

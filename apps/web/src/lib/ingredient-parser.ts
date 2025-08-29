import { logger } from './logger'

export interface ParsedIngredient {
  quantity: number
  unit: string
  name: string
  notes: string
  displayQuantity: string
}

export class IngredientParser {
  private static readonly UNIT_PATTERNS = {
    volume: ['cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons', 'ml', 'l'],
    weight: ['pound', 'pounds', 'lb', 'lbs', 'ounce', 'ounces', 'oz', 'gram', 'grams', 'g', 'kg'],
    count: ['piece', 'pieces', 'whole', 'wholes', 'large', 'medium', 'small'],
    size: ['large', 'medium', 'small', 'extra large', 'xl'],
    other: ['pinch', 'dash', 'sprinkle', 'to taste']
  }

  private static readonly FRACTION_MAP: Record<string, number> = {
    '½': 0.5,
    '⅓': 0.333,
    '⅔': 0.667,
    '¼': 0.25,
    '¾': 0.75,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 0.167,
    '⅚': 0.833,
    '⅐': 0.143,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
    '⅑': 0.111,
    '⅒': 0.1
  }

  static parseIngredient(ingredientText: string): ParsedIngredient {
    const cleanedText = this.cleanIngredientText(ingredientText)
    const parsed = this.extractQuantityAndUnit(cleanedText)

    if (parsed) {
      return parsed
    }

    // Fallback: return basic structure
    return {
      quantity: 1,
      unit: 'piece',
      name: cleanedText,
      notes: '',
      displayQuantity: '1'
    }
  }

  private static cleanIngredientText(text: string): string {
    // Remove leading/trailing asterisks and normalize whitespace
    return text.replace(/^\*+\s*/, '').replace(/\s*$/, '').replace(/\s+/g, ' ').trim()
  }

  private static parseQuantity(quantityStr: string): number {
    const trimmed = quantityStr.trim()

    // Handle Unicode fractions
    for (const [fraction, value] of Object.entries(this.FRACTION_MAP)) {
      if (trimmed.includes(fraction)) {
        return value
      }
    }

    // Handle mixed numbers like "1 1/2"
    const mixedNumberMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixedNumberMatch) {
      const whole = parseInt(mixedNumberMatch[1])
      const numerator = parseInt(mixedNumberMatch[2])
      const denominator = parseInt(mixedNumberMatch[3])
      return whole + (numerator / denominator)
    }

    // Handle simple fractions like "1/2"
    const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/)
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1])
      const denominator = parseInt(fractionMatch[2])
      return numerator / denominator
    }

    // Handle decimals
    const decimalMatch = trimmed.match(/^(\d+\.\d+)$/)
    if (decimalMatch) {
      return parseFloat(decimalMatch[1])
    }

    // Handle whole numbers
    const wholeNumberMatch = trimmed.match(/^(\d+)$/)
    if (wholeNumberMatch) {
      return parseInt(wholeNumberMatch[1])
    }

    return 1 // Default fallback
  }

  private static formatQuantityForDisplay(quantity: number): string {
    // Convert decimal back to fraction for display
    const commonFractions: Record<number, string> = {
      0.25: '1/4',
      0.333: '1/3',
      0.5: '1/2',
      0.667: '2/3',
      0.75: '3/4',
      0.167: '1/6',
      0.833: '5/6',
      0.125: '1/8',
      0.375: '3/8',
      0.625: '5/8',
      0.875: '7/8'
    }

    // Check for exact matches
    for (const [decimal, fraction] of Object.entries(commonFractions)) {
      if (Math.abs(quantity - parseFloat(decimal)) < 0.01) {
        return fraction
      }
    }

    // Handle mixed numbers (e.g., 1.5 -> "1 1/2")
    const whole = Math.floor(quantity)
    const decimal = quantity - whole

    if (whole > 0 && decimal > 0) {
      for (const [decimalVal, fraction] of Object.entries(commonFractions)) {
        if (Math.abs(decimal - parseFloat(decimalVal)) < 0.01) {
          return `${whole} ${fraction}`
        }
      }
    }

    // Return as decimal if no fraction match
    return quantity.toString()
  }

  private static extractQuantityAndUnit(text: string): ParsedIngredient | null {
    // Remove metric units in parentheses from the text first
    const textWithoutMetrics = text.replace(/\s*\([^)]*\d+\s*g[^)]*\)/g, '')

    // Pattern 1: "1 cup (2 sticks / 227 g) unsalted butter, room temperature"
    const pattern1 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s*\(([^)]+)\)\s+(.+?)(?:,\s*(.+))?$/
    const match1 = text.match(pattern1)

    if (match1) {
      const quantity = this.parseQuantity(match1[1])
      const unit = this.normalizeUnit(match1[2])
      const name = match1[4].trim()
      const notes = [match1[3].trim(), match1[5]?.trim()].filter(Boolean).join(', ')

      return {
        quantity,
        unit,
        name,
        notes,
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    // Pattern 2: "1 ½ cups (300 g) granulated sugar" - FIXED
    const pattern2 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s*\([^)]*\)\s+(.+?)(?:,\s*(.+))?$/
    const match2 = textWithoutMetrics.match(pattern2)

    if (match2) {
      const quantity = this.parseQuantity(match2[1])
      const unit = this.normalizeUnit(match2[2])
      const name = match2[3].trim()
      const notes = match2[4]?.trim() || ''

      return {
        quantity,
        unit,
        name,
        notes,
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    // Pattern 3: "2 large eggs, room temperature"
    const pattern3 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s+(.+?)(?:,\s*(.+))?$/
    const match3 = textWithoutMetrics.match(pattern3)

    if (match3) {
      const quantity = this.parseQuantity(match3[1])
      const unit = this.normalizeUnit(match3[2])
      const name = match3[3].trim()
      const notes = match3[4]?.trim() || ''

      return {
        quantity,
        unit,
        name,
        notes,
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    // Pattern 4: "2 cups chopped butterfingers" - FIXED
    const pattern4 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s+(.+?)(?:,\s*(.+))?$/
    const match4 = textWithoutMetrics.match(pattern4)

    if (match4) {
      const quantity = this.parseQuantity(match4[1])
      const unit = this.normalizeUnit(match4[2])
      let name = match4[3].trim()
      let notes = match4[4]?.trim() || ''

      // Check if the name contains descriptive words that should be moved to notes
      const descriptiveWords = ['chopped', 'diced', 'minced', 'sliced', 'grated', 'shredded', 'crushed', 'crumbled']
      const words = name.split(' ')

      if (words.length > 1) {
        const firstWord = words[0].toLowerCase()
        if (descriptiveWords.includes(firstWord)) {
          notes = notes ? `${firstWord}, ${notes}` : firstWord
          name = words.slice(1).join(' ')
        } else if (descriptiveWords.includes(words[words.length - 1].toLowerCase())) {
          const lastWord = words[words.length - 1].toLowerCase()
          notes = notes ? `${notes}, ${lastWord}` : lastWord
          name = words.slice(0, -1).join(' ')
        }
      }

      return {
        quantity,
        unit,
        name,
        notes,
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    // Pattern 5: "1 tablespoon vanilla"
    const pattern5 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s+(.+)$/
    const match5 = textWithoutMetrics.match(pattern5)

    if (match5) {
      const quantity = this.parseQuantity(match5[1])
      const unit = this.normalizeUnit(match5[2])
      const name = match5[3].trim()

      return {
        quantity,
        unit,
        name,
        notes: '',
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    // Pattern 6: "½ teaspoon kosher salt"
    const pattern6 = /^([\d\/\s\.]+)\s+([a-zA-Z]+)\s+(.+)$/
    const match6 = textWithoutMetrics.match(pattern6)

    if (match6) {
      const quantity = this.parseQuantity(match6[1])
      const unit = this.normalizeUnit(match6[2])
      const name = match6[3].trim()

      return {
        quantity,
        unit,
        name,
        notes: '',
        displayQuantity: this.formatQuantityForDisplay(quantity)
      }
    }

    return null
  }

  private static normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase().trim()

    // Handle common abbreviations
    const unitMap: Record<string, string> = {
      'tbsp': 'tablespoon',
      'tbsps': 'tablespoons',
      'tsp': 'teaspoon',
      'tsps': 'teaspoons',
      'lb': 'pound',
      'lbs': 'pounds',
      'oz': 'ounce',
      'ozs': 'ounces',
      'g': 'gram',
      'gs': 'grams',
      'kg': 'kilogram',
      'kgs': 'kilograms',
      'ml': 'milliliter',
      'l': 'liter',
      'pt': 'pint',
      'pts': 'pints',
      'qt': 'quart',
      'qts': 'quarts',
      'gal': 'gallon',
      'gals': 'gallons'
    }

    return unitMap[normalized] || normalized
  }

  static parseIngredientsFromText(ingredientsText: string): ParsedIngredient[] {
    const lines = ingredientsText.split('\n').filter(line => line.trim())
    return lines.map(line => this.parseIngredient(line))
  }

  static parseIngredientsFromList(ingredientsList: string[]): ParsedIngredient[] {
    return ingredientsList.map(ingredient => this.parseIngredient(ingredient))
  }

  static parsePrintFormatIngredients(ingredientsText: string): ParsedIngredient[] {
    // Extract ingredients from the print format
    const ingredientMatches = ingredientsText.match(/\*\s*(.+?)(?=\n\*|$)/g)

    if (ingredientMatches) {
      return ingredientMatches.map(match => {
        const cleanedMatch = match.replace(/^\*\s*/, '').trim()
        return this.parseIngredient(cleanedMatch)
      })
    }

    // Fallback to regular parsing
    return this.parseIngredientsFromText(ingredientsText)
  }
}
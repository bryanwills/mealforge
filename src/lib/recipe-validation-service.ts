import { ImportedRecipeData } from './url-import-service'
import { logger } from './logger'

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  suggestions: string[]
}

export interface ValidationIssue {
  field: string
  expected: any
  actual: any
  severity: 'error' | 'warning' | 'info'
  message: string
}

export class RecipeValidationService {
  private static butterfingerExpectedData: ImportedRecipeData = {
    title: "Butterfinger Bars",
    description: "Everyone will want to 'lay a finger' on these Butterfinger Bars! They are too good not to share, and you will prefer these bars to the candy bar.\n\nOriginal recipe available at https://iambaker.net/butterfinger-bars/",
    sourceUrl: "https://iambaker.net/butterfinger-bars/",
    prepTime: 15,
    cookTime: 25,
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

  static validateExtractedRecipe(extractedData: ImportedRecipeData, url: string): ValidationResult {
    const issues: ValidationIssue[] = []
    const suggestions: string[] = []

    logger.info('Starting recipe validation', { url })

    // Check if this is the Butterfinger Bars recipe
    if (url.includes('butterfinger-bars')) {
      return this.validateAgainstButterfinger(extractedData)
    }

    // Generic validation for other recipes
    return this.validateGenericRecipe(extractedData)
  }

  private static validateAgainstButterfinger(extractedData: ImportedRecipeData): ValidationResult {
    const issues: ValidationIssue[] = []
    const suggestions: string[] = []
    const expected = this.butterfingerExpectedData

    // Validate title
    if (extractedData.title !== expected.title) {
      issues.push({
        field: 'title',
        expected: expected.title,
        actual: extractedData.title,
        severity: 'error',
        message: `Expected title "${expected.title}", got "${extractedData.title}"`
      })
      suggestions.push('Title should be "Butterfinger Bars"')
    }

    // Validate description
    if (!extractedData.description.includes('Butterfinger Bars')) {
      issues.push({
        field: 'description',
        expected: 'Contains "Butterfinger Bars"',
        actual: extractedData.description,
        severity: 'warning',
        message: 'Description should mention Butterfinger Bars'
      })
      suggestions.push('Description should include recipe context')
    }

    // Validate ingredient count
    if (extractedData.ingredients.length !== expected.ingredients.length) {
      issues.push({
        field: 'ingredients',
        expected: `${expected.ingredients.length} ingredients`,
        actual: `${extractedData.ingredients.length} ingredients`,
        severity: 'error',
        message: `Expected ${expected.ingredients.length} ingredients, got ${extractedData.ingredients.length}`
      })
      suggestions.push(`Should have ${expected.ingredients.length} ingredients`)
    }

    // Validate specific ingredients
    const expectedIngredients = expected.ingredients
    const actualIngredients = extractedData.ingredients

    // Check for key ingredients
    const keyIngredients = ['butter', 'sugar', 'eggs', 'flour', 'butterfingers']
    for (const keyIngredient of keyIngredients) {
      const found = actualIngredients.some(ing =>
        ing.name.toLowerCase().includes(keyIngredient)
      )
      if (!found) {
        issues.push({
          field: 'ingredients',
          expected: `Contains ${keyIngredient}`,
          actual: 'Missing',
          severity: 'error',
          message: `Missing key ingredient: ${keyIngredient}`
        })
        suggestions.push(`Should include ${keyIngredient}`)
      }
    }

    // Validate specific ingredient details
    const sugarIngredient = actualIngredients.find(ing =>
      ing.name.toLowerCase().includes('sugar')
    )
    if (sugarIngredient) {
      if (sugarIngredient.quantity !== 1.5) {
        issues.push({
          field: 'ingredients',
          expected: '1.5 cups sugar',
          actual: `${sugarIngredient.quantity} ${sugarIngredient.unit} ${sugarIngredient.name}`,
          severity: 'error',
          message: 'Sugar should be 1.5 cups'
        })
        suggestions.push('Sugar quantity should be 1.5 cups')
      }
      if (sugarIngredient.name !== 'granulated sugar') {
        issues.push({
          field: 'ingredients',
          expected: 'granulated sugar',
          actual: sugarIngredient.name,
          severity: 'warning',
          message: 'Sugar should be "granulated sugar"'
        })
        suggestions.push('Sugar should be specified as "granulated sugar"')
      }
    }

    // Validate instructions count
    if (extractedData.instructions.length < 8) {
      issues.push({
        field: 'instructions',
        expected: 'At least 8 instructions',
        actual: `${extractedData.instructions.length} instructions`,
        severity: 'warning',
        message: 'Should have detailed step-by-step instructions'
      })
      suggestions.push('Instructions should be more detailed')
    }

    logger.info('Recipe validation completed', {
      issuesCount: issues.length,
      suggestionsCount: suggestions.length
    })

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    }
  }

  private static validateGenericRecipe(extractedData: ImportedRecipeData): ValidationResult {
    const issues: ValidationIssue[] = []
    const suggestions: string[] = []

    // Basic validation for any recipe
    if (!extractedData.title || extractedData.title.length < 3) {
      issues.push({
        field: 'title',
        expected: 'Non-empty title',
        actual: extractedData.title,
        severity: 'error',
        message: 'Recipe title is too short or missing'
      })
      suggestions.push('Recipe should have a descriptive title')
    }

    if (extractedData.ingredients.length === 0) {
      issues.push({
        field: 'ingredients',
        expected: 'At least 1 ingredient',
        actual: '0 ingredients',
        severity: 'error',
        message: 'No ingredients found'
      })
      suggestions.push('Recipe should have ingredients')
    }

    if (extractedData.instructions.length === 0) {
      issues.push({
        field: 'instructions',
        expected: 'At least 1 instruction',
        actual: '0 instructions',
        severity: 'error',
        message: 'No instructions found'
      })
      suggestions.push('Recipe should have cooking instructions')
    }

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    }
  }

  static getCorrectionSuggestions(issues: ValidationIssue[]): string[] {
    return issues.map(issue => issue.message)
  }
}
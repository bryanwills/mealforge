import { URLImportService, ScrapedRecipeData } from './url-import-service'
import { logger } from './logger'

export interface ExtractedRecipe {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  imageUrl?: string
}

export interface RecipeData {
  title: string
  description: string
  sourceUrl?: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: string
  cuisine: string
  tags: string[]
  instructions: string[]
  ingredients: {
    quantity: number
    unit: string
    name: string
    notes: string
  }[]
  isPublic: boolean
  isShared: boolean
}

export interface ImportResult {
  recipe: ScrapedRecipeData
  validation: { isValid: boolean; issues: string[] }
}

export class RecipeImportService {
  static async importFromURL(url: string): Promise<ImportResult> {
    logger.info('RecipeImportService: Starting URL import', { url })
    try {
      const result = await URLImportService.scrapeRecipeFromURL(url)

      // Convert ScrapedRecipeData to ImportResult format
      const importResult: ImportResult = {
        recipe: result,
        validation: {
          isValid: result.ingredients.length > 0 && result.instructions.length > 0,
          issues: []
        }
      }

      logger.info('RecipeImportService: URL import completed', {
        title: result.title,
        ingredientCount: result.ingredients.length,
        validationIssues: importResult.validation.issues.length
      })
      return importResult
    } catch (error) {
      logger.error('RecipeImportService: Error importing from URL', { url, error })
      throw error
    }
  }

  static async importFromImage(imageFile: File): Promise<ScrapedRecipeData> {
    logger.info('RecipeImportService: Starting image import', { fileName: imageFile.name })

    // Mock OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockRecipe: ScrapedRecipeData = {
      title: "Extracted Recipe",
      description: "Recipe extracted from uploaded image. Please review and edit as needed.",
      sourceUrl: "",
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: "medium",
      cuisine: "American",
      tags: ["imported", "image"],
      instructions: [
        "Preheat oven to 350°F (175°C).",
        "Mix all ingredients in a large bowl.",
        "Pour into prepared baking dish.",
        "Bake for 25-30 minutes or until done.",
        "Let cool before serving."
      ],
      ingredients: [
        {
          quantity: 2,
          unit: "cups",
          name: "all-purpose flour",
          notes: ""
        },
        {
          quantity: 1,
          unit: "cup",
          name: "sugar",
          notes: ""
        },
        {
          quantity: 2,
          unit: "large",
          name: "eggs",
          notes: "room temperature"
        }
      ],
      isPublic: false,
      isShared: false
    }

    logger.info('RecipeImportService: Image import completed', {
      title: mockRecipe.title,
      ingredientCount: mockRecipe.ingredients.length
    })

    return mockRecipe
  }

  static convertToRecipeData(scrapedData: ScrapedRecipeData): RecipeData {
    return {
      title: scrapedData.title,
      description: scrapedData.description,
      sourceUrl: scrapedData.sourceUrl,
      prepTime: scrapedData.prepTime || 0,
      cookTime: scrapedData.cookTime || 0,
      servings: scrapedData.servings || 0,
      difficulty: scrapedData.difficulty || 'medium',
      cuisine: scrapedData.cuisine || 'Unknown',
      tags: scrapedData.tags,
      instructions: scrapedData.instructions,
      ingredients: scrapedData.ingredients.map((ing: { quantity: number; unit: string; name: string; notes?: string }) => ({
        quantity: ing.quantity,
        unit: ing.unit,
        name: ing.name,
        notes: ing.notes || ''
      })),
      isPublic: scrapedData.isPublic,
      isShared: scrapedData.isShared
    }
  }
}
import { URLImportService, ImportedRecipeData, ImportResult } from './url-import-service'
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

export class RecipeImportService {
  static async importFromURL(url: string): Promise<ImportResult> {
    logger.info('RecipeImportService: Starting URL import', { url })
    try {
      const result = await URLImportService.importFromURL(url)
      logger.info('RecipeImportService: URL import completed', {
        title: result.recipe.title,
        ingredientCount: result.recipe.ingredients.length,
        validationIssues: result.validation.issues.length
      })
      return result
    } catch (error) {
      logger.error('RecipeImportService: Error importing from URL', { url, error })
      throw error
    }
  }

  static async importFromImage(imageFile: File): Promise<ImportedRecipeData> {
    logger.info('RecipeImportService: Starting image import', { fileName: imageFile.name })

    // Mock OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockRecipe: ImportedRecipeData = {
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

  static convertExtractedRecipeToDatabaseFormat(recipe: ImportedRecipeData): RecipeData {
    return {
      title: recipe.title,
      description: recipe.description,
      sourceUrl: recipe.sourceUrl,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      servings: recipe.servings || 1,
      difficulty: recipe.difficulty || "medium",
      cuisine: recipe.cuisine || "American",
      tags: recipe.tags,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients.map(ing => ({
        quantity: ing.quantity,
        unit: ing.unit,
        name: ing.name,
        notes: ing.notes || ""
      })),
      isPublic: recipe.isPublic,
      isShared: recipe.isShared
    }
  }
}
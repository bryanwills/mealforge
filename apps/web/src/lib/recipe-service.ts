import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export interface CreateRecipeData {
  title: string
  description?: string
  servings?: number
  prepTime?: number
  cookTime?: number
  difficulty?: string
  cuisine?: string
  tags?: string[]
  ingredients?: {
    name: string
    quantity: number
    unit: string
    notes?: string
    isOptional?: boolean
  }[]
  instructions: string[]
  imageUrl?: string
  sourceUrl?: string
  isPublic?: boolean
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string
}

export interface RecipeWithIngredients {
  id: string
  userId: string
  title: string
  description?: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings: number
  difficulty?: string
  cuisine?: string
  tags: string[]
  instructions: string[]
  sourceUrl?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  ingredients: Array<{
    id: string
    recipeId: string
    ingredientId: string
    unit: string
    quantity: number
    notes?: string
    isOptional: boolean
    order: number
    ingredient: {
      id: string
      name: string
      category?: string
    }
  }>
}

export class RecipeService {
  async createRecipe(userId: string, data: CreateRecipeData): Promise<RecipeWithIngredients> {
    return await prisma.$transaction(async (tx) => {
      // Create the recipe
      const recipe = await tx.recipe.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          servings: data.servings ?? 1,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          difficulty: data.difficulty,
          cuisine: data.cuisine,
          tags: data.tags ?? [],
          instructions: data.instructions ?? [],
          imageUrl: data.imageUrl,
          sourceUrl: data.sourceUrl,
          isPublic: data.isPublic ?? false,
          externalId: (data as any).externalId,
          importSource: (data as any).importSource
        }
      })

      // Create or find ingredients and create recipe ingredients (only if ingredients are provided)
      if (data.ingredients && data.ingredients.length > 0) {
        for (let i = 0; i < data.ingredients.length; i++) {
        const ingredientData = data.ingredients[i]

        // Find or create the ingredient
        let ingredient = await tx.ingredient.findUnique({
          where: { name: ingredientData.name.toLowerCase() }
        })

        if (!ingredient) {
          ingredient = await tx.ingredient.create({
            data: {
              name: ingredientData.name.toLowerCase(),
              category: 'unknown',
              commonUnits: [ingredientData.unit]
            }
          })
        }

        // Create recipe ingredient
        await tx.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId: ingredient.id,
            unit: ingredientData.unit,
            quantity: ingredientData.quantity,
            notes: ingredientData.notes,
            isOptional: ingredientData.isOptional ?? false,
            order: i
          }
        })
        }
      }

      // Return the recipe (with ingredients if they exist)
      return await tx.recipe.findUnique({
        where: { id: recipe.id }
      }) as RecipeWithIngredients
    })
  }

  // Get a recipe by ID
  async getRecipeById(id: string): Promise<RecipeWithIngredients | null> {
    return await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        }
      }
    }) as RecipeWithIngredients | null
  }

  // Get all recipes for a user
  async getUserRecipes(userId: string): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }) as RecipeWithIngredients[]
  }

  // Get public recipes
  async getPublicRecipes(limit: number = 20, offset: number = 0): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }) as RecipeWithIngredients[]
  }

  // Update a recipe
  async updateRecipe(data: UpdateRecipeData): Promise<RecipeWithIngredients> {
    const { id, ingredients, ...recipeData } = data

    return await prisma.$transaction(async (tx) => {
      // Update the recipe
      const recipe = await tx.recipe.update({
        where: { id },
        data: recipeData
      })

      // If ingredients are provided, update them
      if (ingredients) {
        // Delete existing ingredients
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: id }
        })

        // Create new ingredients
        for (let i = 0; i < ingredients.length; i++) {
          const ingredientData = ingredients[i]

          // Find or create the ingredient
          let ingredient = await tx.ingredient.findUnique({
            where: { name: ingredientData.name.toLowerCase() }
          })

          if (!ingredient) {
            ingredient = await tx.ingredient.create({
              data: {
                name: ingredientData.name.toLowerCase(),
                category: 'unknown',
                commonUnits: [ingredientData.unit]
              }
            })
          }

          // Create recipe ingredient
          await tx.recipeIngredient.create({
            data: {
              recipeId: id,
              ingredientId: ingredient.id,
              unit: ingredientData.unit,
              quantity: ingredientData.quantity,
              notes: ingredientData.notes,
              isOptional: ingredientData.isOptional ?? false,
              order: i
            }
          })
        }
      }

      // Return the updated recipe with ingredients
      return await tx.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }) as RecipeWithIngredients
    })
  }

  // Delete a recipe
  async deleteRecipe(id: string): Promise<void> {
    await prisma.recipe.delete({
      where: { id }
    })
  }

  // Search recipes
  async searchRecipes(userId: string, query: string): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as RecipeWithIngredients[]
  }
}

export const recipeService = new RecipeService()
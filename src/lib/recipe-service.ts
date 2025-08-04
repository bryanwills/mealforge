import { PrismaClient, Recipe, RecipeIngredient, Ingredient } from '@prisma/client'
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
  ingredients: {
    name: string
    quantity: number
    unit: string
    notes?: string
    isOptional?: boolean
  }[]
  instructions: string[]
  nutrition?: Record<string, number>
  imageUrl?: string
  sourceUrl?: string
  isPublic?: boolean
  isShared?: boolean
  importSource?: string
  calories?: number
  importAccuracy?: number
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string
}

export interface RecipeShare {
  id: string
  recipeId: string
  userId: string
  sharedAt: Date
}

export interface RecipeLike {
  id: string
  recipeId: string
  userId: string
  likedAt: Date
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient
  })[]
  shares?: RecipeShare[]
  likes?: RecipeLike[]
  _count?: {
    shares: number
    likes: number
  }
}

export class RecipeService {
  // Create a new recipe
  async createRecipe(userId: string, data: CreateRecipeData): Promise<RecipeWithIngredients> {
    logger.debug('Creating recipe', { userId, title: data.title })

    return await prisma.$transaction(async (tx) => {
      // First verify the user exists
      const user = await tx.user.findUnique({
        where: { id: userId }
      })

      logger.debug('User verification for recipe creation', {
        requestedUserId: userId,
        userExists: !!user,
        userClerkId: user?.clerkId
      })

      if (!user) {
        logger.error('User not found for recipe creation', { userId })
        throw new Error(`User with ID ${userId} not found`)
      }

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
          instructions: data.instructions,
          imageUrl: data.imageUrl,
          sourceUrl: data.sourceUrl,
          isPublic: data.isPublic ?? false,
          isShared: data.isShared ?? false,
          calories: data.calories,
          nutrition: data.nutrition,
          importSource: data.importSource,
          importAccuracy: data.importAccuracy
        }
      })

      logger.debug('Recipe created successfully', {
        recipeId: recipe.id,
        userId: recipe.userId,
        title: recipe.title
      })

      // Create or find ingredients and create recipe ingredients
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

      logger.debug('Recipe ingredients created', {
        recipeId: recipe.id,
        ingredientCount: data.ingredients.length
      })

      // Return the recipe with ingredients
      return await tx.recipe.findUnique({
        where: { id: recipe.id },
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
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      }
    })
  }

  // Get all recipes for a user
  async getUserRecipes(userId: string): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get shared recipes (community recipes)
  async getSharedRecipes(limit: number = 20, offset: number = 0): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: { isShared: true },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })
  }

  // Share a recipe
  async shareRecipe(recipeId: string, userId: string, isPublic: boolean = true): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update recipe to be shared
      await tx.recipe.update({
        where: { id: recipeId },
        data: { isShared: true }
      })

      // Create share record
      await tx.recipeShare.create({
        data: {
          recipeId,
          userId,
          isPublic
        }
      })
    })
  }

  // Unshare a recipe
  async unshareRecipe(recipeId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update recipe to not be shared
      await tx.recipe.update({
        where: { id: recipeId },
        data: { isShared: false }
      })

      // Remove share record
      await tx.recipeShare.deleteMany({
        where: {
          recipeId,
          userId
        }
      })
    })
  }

  // Like a recipe
  async likeRecipe(recipeId: string, userId: string): Promise<void> {
    await prisma.recipeLike.create({
      data: {
        recipeId,
        userId
      }
    })
  }

  // Unlike a recipe
  async unlikeRecipe(recipeId: string, userId: string): Promise<void> {
    await prisma.recipeLike.deleteMany({
      where: {
        recipeId,
        userId
      }
    })
  }

  // Update a recipe
  async updateRecipe(data: UpdateRecipeData): Promise<RecipeWithIngredients> {
    return await prisma.$transaction(async (tx) => {
      // Update the recipe
      await tx.recipe.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          cuisine: data.cuisine,
          tags: data.tags,
          instructions: data.instructions,
          sourceUrl: data.sourceUrl,
          isPublic: data.isPublic,
          isShared: data.isShared,
          calories: data.calories,
          nutrition: data.nutrition,
          importSource: data.importSource,
          importAccuracy: data.importAccuracy,
        },
      })

      // If ingredients are provided, update them
      if (data.ingredients) {
        // Delete existing recipe ingredients
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: data.id }
        })

        // Create new recipe ingredients
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
                commonUnits: [ingredientData.unit],
              }
            })
          }

          // Create recipe ingredient
          await tx.recipeIngredient.create({
            data: {
              recipeId: data.id,
              ingredientId: ingredient.id,
              unit: ingredientData.unit,
              quantity: ingredientData.quantity,
              notes: ingredientData.notes,
              isOptional: ingredientData.isOptional ?? false,
              order: i,
            }
          })
        }
      }

      // Return the updated recipe with ingredients
      return await tx.recipe.findUnique({
        where: { id: data.id },
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
          { tags: { hasSome: [query] } },
          { cuisine: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Search shared recipes
  async searchSharedRecipes(query: string, limit: number = 20): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: {
        isShared: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
          { cuisine: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Get recipes by tag
  async getRecipesByTag(userId: string, tag: string): Promise<RecipeWithIngredients[]> {
    return await prisma.recipe.findMany({
      where: {
        userId,
        tags: { has: tag }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            shares: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Save import correction for ML improvement
  async saveImportCorrection(
    userId: string,
    originalText: string,
    correctedText: string,
    correctionType: string,
    importSource: string,
    confidence: number
  ): Promise<void> {
    await prisma.importCorrection.create({
      data: {
        userId,
        originalText,
        correctedText,
        correctionType,
        importSource,
        confidence
      }
    })
  }
}
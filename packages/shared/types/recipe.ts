import { z } from 'zod';

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  prepTime: z.number().default(0),
  cookTime: z.number().default(0),
  servings: z.number().default(0),
  difficulty: z.string().default('medium'),
  cuisine: z.string().optional(),
  tags: z.array(z.string()),
  instructions: z.array(z.string()),
  ingredients: z.array(z.any()), // JSON ingredients
  sourceUrl: z.string().optional(),
  isPublic: z.boolean().default(false),
  isShared: z.boolean().default(false),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const SavedRecipeSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
});

export type SavedRecipe = z.infer<typeof SavedRecipeSchema>;
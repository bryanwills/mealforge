// Simple file-based storage for saved recipes count
// This is temporary until we resolve the database connection issue

import { loadSavedRecipes } from './saved-recipes-persistence'

function getSavedRecipesCountFromFile(userId: string): number {
  try {
    const savedRecipes = loadSavedRecipes()
    const userSavedRecipes = savedRecipes.get(userId) || new Set()
    return userSavedRecipes.size
  } catch (error) {
    console.error('Error getting saved recipes count from file:', error)
    return 0
  }
}

export function getSavedRecipesCount(userId: string): number {
  return getSavedRecipesCountFromFile(userId)
}

export function setSavedRecipesCount(userId: string, count: number): void {
  // This is handled by the saved recipes API now
  console.log(`Setting saved recipes count for user ${userId} to ${count}`)
}

export function incrementSavedRecipesCount(userId: string): void {
  // This is handled by the saved recipes API now
  console.log(`Incrementing saved recipes count for user ${userId}`)
}

export function decrementSavedRecipesCount(userId: string): void {
  // This is handled by the saved recipes API now
  console.log(`Decrementing saved recipes count for user ${userId}`)
}
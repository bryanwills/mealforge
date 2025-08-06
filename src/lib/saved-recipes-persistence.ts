import fs from 'fs'
import path from 'path'

const SAVED_RECIPES_FILE = path.join(process.cwd(), 'data', 'saved-recipes.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(SAVED_RECIPES_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load saved recipes from file
export function loadSavedRecipes(): Map<string, Set<string>> {
  try {
    ensureDataDir()
    if (!fs.existsSync(SAVED_RECIPES_FILE)) {
      console.log('No saved recipes file found, starting with empty data')
      return new Map()
    }

    const data = fs.readFileSync(SAVED_RECIPES_FILE, 'utf8')
    const parsed = JSON.parse(data)

    console.log('Loading saved recipes from file:', parsed)

    // Convert back to Map and Set
    const result = new Map()
    for (const [userId, recipeIds] of Object.entries(parsed)) {
      result.set(userId, new Set(recipeIds as string[]))
      console.log(`Loaded ${(recipeIds as string[]).length} recipes for user ${userId}`)
    }

    return result
  } catch (error) {
    console.error('Error loading saved recipes:', error)
    return new Map()
  }
}

// Save recipes to file
export function saveSavedRecipes(savedRecipes: Map<string, Set<string>>): void {
  try {
    ensureDataDir()

    // Convert Map and Set to plain objects for JSON serialization
    const data: Record<string, string[]> = {}
    for (const [userId, recipeIds] of savedRecipes.entries()) {
      data[userId] = Array.from(recipeIds)
    }

    console.log('Saving saved recipes to file:', data)
    fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving saved recipes:', error)
  }
}

// Load saved recipes data from file
export function loadSavedRecipesData(): Map<string, Map<string, any>> {
  try {
    ensureDataDir()
    const dataFile = SAVED_RECIPES_FILE.replace('.json', '-data.json')

    if (!fs.existsSync(dataFile)) {
      return new Map()
    }

    const data = fs.readFileSync(dataFile, 'utf8')
    const parsed = JSON.parse(data)

    // Convert back to nested Maps
    const result = new Map()
    for (const [userId, recipes] of Object.entries(parsed)) {
      const userRecipes = new Map()
      for (const [recipeId, recipeData] of Object.entries(recipes as Record<string, any>)) {
        userRecipes.set(recipeId, recipeData)
      }
      result.set(userId, userRecipes)
    }

    return result
  } catch (error) {
    console.error('Error loading saved recipes data:', error)
    return new Map()
  }
}

// Save recipes data to file
export function saveSavedRecipesData(savedRecipesData: Map<string, Map<string, any>>): void {
  try {
    ensureDataDir()
    const dataFile = SAVED_RECIPES_FILE.replace('.json', '-data.json')

    // Convert nested Maps to plain objects for JSON serialization
    const data: Record<string, Record<string, any>> = {}
    for (const [userId, recipes] of savedRecipesData.entries()) {
      data[userId] = {}
      for (const [recipeId, recipeData] of recipes.entries()) {
        data[userId][recipeId] = recipeData
      }
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving saved recipes data:', error)
  }
}
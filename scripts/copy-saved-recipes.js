const fs = require('fs')
const path = require('path')

const SAVED_RECIPES_FILE = path.join(process.cwd(), 'data', 'saved-recipes.json')
const SAVED_RECIPES_DATA_FILE = path.join(process.cwd(), 'data', 'saved-recipes-data.json')

function copySavedRecipes(fromUserId, toUserId) {
  try {
    // Read current data
    let savedRecipes = {}
    let savedRecipesData = {}

    if (fs.existsSync(SAVED_RECIPES_FILE)) {
      savedRecipes = JSON.parse(fs.readFileSync(SAVED_RECIPES_FILE, 'utf8'))
    }

    if (fs.existsSync(SAVED_RECIPES_DATA_FILE)) {
      savedRecipesData = JSON.parse(fs.readFileSync(SAVED_RECIPES_DATA_FILE, 'utf8'))
    }

    // Copy data from source user to target user
    if (savedRecipes[fromUserId]) {
      savedRecipes[toUserId] = savedRecipes[fromUserId]
      console.log(`Copied ${savedRecipes[fromUserId].length} saved recipes from ${fromUserId} to ${toUserId}`)
    }

    if (savedRecipesData[fromUserId]) {
      savedRecipesData[toUserId] = savedRecipesData[fromUserId]
      console.log(`Copied saved recipes data from ${fromUserId} to ${toUserId}`)
    }

    // Write back to files
    fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(savedRecipes, null, 2))
    fs.writeFileSync(SAVED_RECIPES_DATA_FILE, JSON.stringify(savedRecipesData, null, 2))

    console.log('Successfully copied saved recipes!')
    console.log('Files updated:')
    console.log('- data/saved-recipes.json')
    console.log('- data/saved-recipes-data.json')

  } catch (error) {
    console.error('Error copying saved recipes:', error)
  }
}

// Check if command line arguments are provided
if (process.argv[2] && process.argv[3]) {
  const fromUserId = process.argv[2]
  const toUserId = process.argv[3]
  copySavedRecipes(fromUserId, toUserId)
} else {
  console.log('Usage: node scripts/copy-saved-recipes.js <from-user-id> <to-user-id>')
  console.log('Example: node scripts/copy-saved-recipes.js user_2example YOUR_ACTUAL_USER_ID')
}
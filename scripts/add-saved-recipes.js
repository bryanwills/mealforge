const fs = require('fs')
const path = require('path')

const SAVED_RECIPES_FILE = path.join(process.cwd(), 'data', 'saved-recipes.json')
const SAVED_RECIPES_DATA_FILE = path.join(process.cwd(), 'data', 'saved-recipes-data.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(SAVED_RECIPES_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Add some test saved recipes
function addTestSavedRecipes() {
  ensureDataDir()

  // Example user ID (replace with your actual Clerk user ID)
  const userId = 'user_2example' // Replace with your actual user ID

  const savedRecipes = {
    [userId]: [
      'external-1',
      'external-2',
      'external-716004' // The one you just saved
    ]
  }

  const savedRecipesData = {
    [userId]: {
      'external-1': {
        id: 'external-1',
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        cookingTime: 20,
        servings: 4,
        difficulty: 'Medium',
        tags: ['Italian', 'Pasta', 'Quick'],
        source: 'external',
        externalId: '1',
        externalSource: 'Spoonacular',
        rating: 4.5
      },
      'external-2': {
        id: 'external-2',
        title: 'Chicken Tikka Masala',
        description: 'Creamy and flavorful Indian curry with tender chicken',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        cookingTime: 45,
        servings: 6,
        difficulty: 'Medium',
        tags: ['Indian', 'Curry', 'Spicy'],
        source: 'external',
        externalId: '2',
        externalSource: 'Spoonacular',
        rating: 4.8
      },
      'external-716004': {
        id: 'external-716004',
        title: 'Pasta with Meat and Vegetables',
        description: 'A delicious pasta dish with tender meat and fresh vegetables in a creamy sauce',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        cookingTime: 35,
        servings: 4,
        difficulty: 'Medium',
        tags: ['Pasta', 'Meat', 'Vegetables'],
        source: 'external',
        externalId: '716004',
        externalSource: 'Spoonacular',
        rating: 4.5
      }
    }
  }

  fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(savedRecipes, null, 2))
  fs.writeFileSync(SAVED_RECIPES_DATA_FILE, JSON.stringify(savedRecipesData, null, 2))

  console.log('Test saved recipes added successfully!')
  console.log('Files created:')
  console.log('- data/saved-recipes.json')
  console.log('- data/saved-recipes-data.json')
  console.log('\nNote: You may need to replace the userId with your actual Clerk user ID')
}

addTestSavedRecipes()
const fs = require('fs')
const path = require('path')

const SAVED_RECIPES_FILE = path.join(process.cwd(), 'data', 'saved-recipes.json')
const SAVED_RECIPES_DATA_FILE = path.join(process.cwd(), 'data', 'saved-recipes-data.json')

// Read existing data
function readSavedRecipesData() {
  try {
    if (fs.existsSync(SAVED_RECIPES_FILE)) {
      return JSON.parse(fs.readFileSync(SAVED_RECIPES_FILE, 'utf8'))
    }
    return {}
  } catch (error) {
    console.error('Error reading saved recipes data:', error)
    return {}
  }
}

function readSavedRecipesDataFile() {
  try {
    if (fs.existsSync(SAVED_RECIPES_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(SAVED_RECIPES_DATA_FILE, 'utf8'))
    }
    return {}
  } catch (error) {
    console.error('Error reading saved recipes data file:', error)
    return {}
  }
}

// Show current data
function showCurrentData() {
  const data = readSavedRecipesData()
  const dataFile = readSavedRecipesDataFile()

  console.log('Current saved recipes data:')
  console.log(JSON.stringify(data, null, 2))

  console.log('\nUser IDs found:')
  Object.keys(data).forEach(userId => {
    console.log(`- ${userId} (${data[userId].length} saved recipes)`)
  })

  console.log('\nData file user IDs:')
  Object.keys(dataFile).forEach(userId => {
    console.log(`- ${userId} (${Object.keys(dataFile[userId]).length} saved recipes)`)
  })
}

// Add a new user ID with the same data
function addNewUserId(newUserId) {
  const data = readSavedRecipesData()
  const dataFile = readSavedRecipesDataFile()

  // Get the first user's data as template
  const firstUserId = Object.keys(data)[0]
  if (!firstUserId) {
    console.log('No existing user data found to copy from')
    return
  }

  // Copy the data for the new user
  data[newUserId] = [...data[firstUserId]]
  dataFile[newUserId] = { ...dataFile[firstUserId] }

  // Write the updated data
  fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(data, null, 2))
  fs.writeFileSync(SAVED_RECIPES_DATA_FILE, JSON.stringify(dataFile, null, 2))

  console.log(`Added user ${newUserId} with ${data[newUserId].length} saved recipes`)
}

// Main execution
const args = process.argv.slice(2)

if (args.length === 0) {
  showCurrentData()
} else if (args[0] === 'add' && args[1]) {
  addNewUserId(args[1])
} else {
  console.log('Usage:')
  console.log('  node scripts/check-current-user.js                    # Show current data')
  console.log('  node scripts/check-current-user.js add <user-id>     # Add new user with existing data')
}
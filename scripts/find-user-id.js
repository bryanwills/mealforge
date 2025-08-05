const fs = require('fs')
const path = require('path')

const SAVED_RECIPES_FILE = path.join(process.cwd(), 'data', 'saved-recipes.json')
const SAVED_RECIPES_DATA_FILE = path.join(process.cwd(), 'data', 'saved-recipes-data.json')

// Read existing data and show current user IDs
function showCurrentData() {
  try {
    if (fs.existsSync(SAVED_RECIPES_FILE)) {
      const data = JSON.parse(fs.readFileSync(SAVED_RECIPES_FILE, 'utf8'))
      console.log('Current saved recipes data:')
      console.log(JSON.stringify(data, null, 2))

      console.log('\nUser IDs found:')
      Object.keys(data).forEach(userId => {
        console.log(`- ${userId} (${data[userId].length} saved recipes)`)
      })
    } else {
      console.log('No saved recipes file found.')
    }
  } catch (error) {
    console.error('Error reading saved recipes data:', error)
  }
}

// Update the user ID in the saved recipes data
function updateUserId(oldUserId, newUserId) {
  try {
    if (fs.existsSync(SAVED_RECIPES_FILE)) {
      const data = JSON.parse(fs.readFileSync(SAVED_RECIPES_FILE, 'utf8'))
      if (data[oldUserId]) {
        data[newUserId] = data[oldUserId]
        delete data[oldUserId]
        fs.writeFileSync(SAVED_RECIPES_FILE, JSON.stringify(data, null, 2))
        console.log(`Updated user ID from ${oldUserId} to ${newUserId}`)
      }
    }

    if (fs.existsSync(SAVED_RECIPES_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(SAVED_RECIPES_DATA_FILE, 'utf8'))
      if (data[oldUserId]) {
        data[newUserId] = data[oldUserId]
        delete data[oldUserId]
        fs.writeFileSync(SAVED_RECIPES_DATA_FILE, JSON.stringify(data, null, 2))
        console.log(`Updated user ID in data file from ${oldUserId} to ${newUserId}`)
      }
    }
  } catch (error) {
    console.error('Error updating user ID:', error)
  }
}

// Show current data
showCurrentData()

console.log('\nTo update the user ID, run:')
console.log('node scripts/find-user-id.js update <old-user-id> <new-user-id>')

// Check if update command is provided
if (process.argv[2] === 'update' && process.argv[3] && process.argv[4]) {
  updateUserId(process.argv[3], process.argv[4])
}
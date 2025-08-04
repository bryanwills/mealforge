const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('Starting database backup...')

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`)

    // Backup all tables
    const backup = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.findMany(),
      recipes: await prisma.recipe.findMany(),
      ingredients: await prisma.ingredient.findMany(),
      recipeIngredients: await prisma.recipeIngredient.findMany(),
      recipeLikes: await prisma.recipeLike.findMany(),
      recipeShares: await prisma.recipeShare.findMany(),
      groceryLists: await prisma.groceryList.findMany(),
      groceryListItems: await prisma.groceryListItem.findMany(),
      mealPlans: await prisma.mealPlan.findMany(),
      mealPlanItems: await prisma.mealPlanItem.findMany(),
      substitutions: await prisma.substitution.findMany(),
      importCorrections: await prisma.importCorrection.findMany()
    }

    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

    console.log(`✅ Database backup completed successfully!`)
    console.log(`📁 Backup saved to: ${backupPath}`)
    console.log(`📊 Backup contains:`)
    console.log(`   - ${backup.users.length} users`)
    console.log(`   - ${backup.recipes.length} recipes`)
    console.log(`   - ${backup.ingredients.length} ingredients`)
    console.log(`   - ${backup.recipeIngredients.length} recipe ingredients`)
    console.log(`   - ${backup.recipeLikes.length} recipe likes`)
    console.log(`   - ${backup.recipeShares.length} recipe shares`)
    console.log(`   - ${backup.groceryLists.length} grocery lists`)
    console.log(`   - ${backup.groceryListItems.length} grocery list items`)
    console.log(`   - ${backup.mealPlans.length} meal plans`)
    console.log(`   - ${backup.mealPlanItems.length} meal plan items`)
    console.log(`   - ${backup.substitutions.length} substitutions`)
    console.log(`   - ${backup.importCorrections.length} import corrections`)

    return backupPath
  } catch (error) {
    console.error('❌ Error creating database backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run backup if this script is executed directly
if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('Backup script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Backup script failed:', error)
      process.exit(1)
    })
}

module.exports = { backupDatabase }
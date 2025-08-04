const { PrismaClient } = require('@prisma/client')
const { backupDatabase } = require('./backup-database')

const prisma = new PrismaClient()

async function cleanupIngredients() {
  try {
    console.log('🧹 Starting ingredient cleanup process...')

    // Step 1: Create backup first
    console.log('\n📦 Step 1: Creating database backup...')
    const backupPath = await backupDatabase()
    console.log(`✅ Backup created: ${backupPath}`)

    // Step 2: Show current ingredient count
    console.log('\n📊 Step 2: Analyzing current data...')
    const ingredientCount = await prisma.ingredient.count()
    const recipeIngredientCount = await prisma.recipeIngredient.count()
    const recipeCount = await prisma.recipe.count()

    console.log(`Current database state:`)
    console.log(`   - ${ingredientCount} ingredients`)
    console.log(`   - ${recipeIngredientCount} recipe ingredients`)
    console.log(`   - ${recipeCount} recipes`)

    // Step 3: Find orphaned ingredients (not used in any recipes)
    console.log('\n🔍 Step 3: Finding orphaned ingredients...')
    const usedIngredientIds = await prisma.recipeIngredient.findMany({
      select: { ingredientId: true }
    }).then(results => results.map(r => r.ingredientId))

    const orphanedIngredients = await prisma.ingredient.findMany({
      where: {
        id: {
          notIn: usedIngredientIds
        }
      }
    })

    console.log(`Found ${orphanedIngredients.length} orphaned ingredients:`)
    orphanedIngredients.forEach((ingredient, index) => {
      console.log(`   ${index + 1}. ${ingredient.name} (ID: ${ingredient.id})`)
    })

    // Step 4: Confirm deletion
    console.log('\n⚠️  Step 4: Confirmation required')
    console.log(`This will delete ${orphanedIngredients.length} orphaned ingredients.`)
    console.log(`Backup has been created at: ${backupPath}`)
    console.log('\nTo proceed, run this command:')
    console.log(`node scripts/cleanup-ingredients.js --confirm`)

    // Check if --confirm flag is provided
    const args = process.argv.slice(2)
    if (!args.includes('--confirm')) {
      console.log('\n❌ Cleanup cancelled. Run with --confirm flag to proceed.')
      return
    }

    // Step 5: Delete orphaned ingredients
    console.log('\n🗑️  Step 5: Deleting orphaned ingredients...')
    if (orphanedIngredients.length > 0) {
      const deleteResult = await prisma.ingredient.deleteMany({
        where: {
          id: {
            in: orphanedIngredients.map(ing => ing.id)
          }
        }
      })

      console.log(`✅ Successfully deleted ${deleteResult.count} orphaned ingredients`)
    } else {
      console.log('✅ No orphaned ingredients to delete')
    }

    // Step 6: Show final state
    console.log('\n📊 Step 6: Final database state...')
    const finalIngredientCount = await prisma.ingredient.count()
    const finalRecipeIngredientCount = await prisma.recipeIngredient.count()

    console.log(`Final database state:`)
    console.log(`   - ${finalIngredientCount} ingredients (was ${ingredientCount})`)
    console.log(`   - ${finalRecipeIngredientCount} recipe ingredients (was ${recipeIngredientCount})`)
    console.log(`   - ${recipeCount} recipes (unchanged)`)

    console.log('\n✅ Ingredient cleanup completed successfully!')
    console.log(`📁 Backup available at: ${backupPath}`)

  } catch (error) {
    console.error('❌ Error during ingredient cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupIngredients()
    .then(() => {
      console.log('Cleanup script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Cleanup script failed:', error)
      process.exit(1)
    })
}

module.exports = { cleanupIngredients }
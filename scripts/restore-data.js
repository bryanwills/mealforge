const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('🔄 Starting data restoration from JSON files to Supabase...');
    
    // Read your saved recipe data
    const dataPath = path.join(__dirname, '..', 'apps', 'web', 'data', 'saved-recipes-data.json');
    const userData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📖 Found data for ${Object.keys(userData).length} users`);
    
    for (const [userId, recipes] of Object.entries(userData)) {
      console.log(`👤 Processing user: ${userId}`);
      
      // Create user if doesn't exist
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`, // Placeholder email
          }
        });
        console.log(`  ✅ Created user: ${userId}`);
      }
      
      // Create recipes
      for (const [recipeId, recipeData] of Object.entries(recipes)) {
        console.log(`  📝 Processing recipe: ${recipeData.title}`);
        
        try {
          const recipe = await prisma.recipe.upsert({
            where: { id: recipeId },
            update: {},
            create: {
              id: recipeId,
              title: recipeData.title,
              description: recipeData.description || '',
              imageUrl: recipeData.image,
              prepTime: 0,
              cookTime: recipeData.cookingTime || 0,
              servings: recipeData.servings || 4,
              difficulty: recipeData.difficulty || 'medium',
              tags: recipeData.tags || [],
              instructions: [], // Add instructions if available in your data
              ingredients: [], // Add ingredients if available in your data
              sourceUrl: recipeData.source === 'external' ? 'https://spoonacular.com' : '',
              isPublic: true,
              userId: userId,
            }
          });
          
          // Create saved recipe relationship
          await prisma.savedRecipe.upsert({
            where: {
              recipeId_userId: {
                recipeId: recipeId,
                userId: userId
              }
            },
            update: {},
            create: {
              recipeId: recipeId,
              userId: userId
            }
          });
          
          console.log(`    ✅ Recipe "${recipeData.title}" restored`);
        } catch (error) {
          console.error(`    ❌ Error restoring recipe "${recipeData.title}":`, error.message);
        }
      }
    }
    
    console.log('🎉 Data restoration completed successfully!');
    
    // Show final stats
    const userCount = await prisma.user.count();
    const recipeCount = await prisma.recipe.count();
    const savedRecipeCount = await prisma.savedRecipe.count();
    
    console.log(`📊 Final statistics:`);
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  📝 Recipes: ${recipeCount}`);
    console.log(`  💾 Saved recipes: ${savedRecipeCount}`);
    
  } catch (error) {
    console.error('❌ Error during data restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
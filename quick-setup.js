const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up your MealForge monorepo...\n');

// Step 1: Push database schema
console.log('1️⃣ Updating database schema...');
exec('npx prisma db push', { 
  cwd: path.join(__dirname, 'apps', 'web'),
  env: process.env
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error updating schema:', error.message);
    return;
  }
  console.log('✅ Database schema updated!\n');

  // Step 2: Generate Prisma client
  console.log('2️⃣ Generating Prisma client...');
  exec('npx prisma generate', { 
    cwd: path.join(__dirname, 'apps', 'web')
  }, (genError, genStdout, genStderr) => {
    if (genError) {
      console.error('❌ Error generating Prisma client:', genError.message);
      return;
    }
    console.log('✅ Prisma client generated!\n');

    // Step 3: Restore data
    restoreData();
  });
});

async function restoreData() {
  console.log('3️⃣ Restoring your recipe data...');
  
  const prisma = new PrismaClient();
  
  try {
    // Read your saved recipe data
    const dataPath = path.join(__dirname, 'apps', 'web', 'data', 'saved-recipes-data.json');
    
    if (!fs.existsSync(dataPath)) {
      console.log('⚠️  No recipe data found. Skipping data restoration.');
      console.log('✅ Setup complete! Your app is ready to use.');
      return;
    }
    
    const userData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`📖 Found data for ${Object.keys(userData).length} users`);
    
    for (const [userId, recipes] of Object.entries(userData)) {
      console.log(`👤 Processing user: ${userId}`);
      
      // Create user with clerkId
      let user = await prisma.user.findUnique({ 
        where: { clerkId: userId } 
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: `${userId}@example.com`, // Placeholder email
            name: 'User'
          }
        });
        console.log(`  ✅ Created user: ${userId}`);
      }
      
      // Create recipes
      let recipeCount = 0;
      for (const [recipeId, recipeData] of Object.entries(recipes)) {
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
              instructions: ['Instructions will be added later'],
              ingredients: [{ name: 'Ingredients will be added later', amount: '1', unit: 'item' }],
              sourceUrl: recipeData.source === 'external' ? 'https://spoonacular.com' : '',
              isPublic: true,
              userId: user.id,
            }
          });
          
          // Create saved recipe relationship
          await prisma.savedRecipe.upsert({
            where: {
              recipeId_userId: {
                recipeId: recipeId,
                userId: user.id
              }
            },
            update: {},
            create: {
              recipeId: recipeId,
              userId: user.id
            }
          });
          
          recipeCount++;
        } catch (error) {
          console.error(`    ❌ Error restoring recipe "${recipeData.title}":`, error.message);
        }
      }
      console.log(`  ✅ Restored ${recipeCount} recipes for user ${userId}`);
    }
    
    // Show final stats
    const userCount = await prisma.user.count();
    const recipeCount = await prisma.recipe.count();
    const savedRecipeCount = await prisma.savedRecipe.count();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log(`📊 Final statistics:`);
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  📝 Recipes: ${recipeCount}`);
    console.log(`  💾 Saved recipes: ${savedRecipeCount}`);
    console.log('\n🚀 Your app is ready! Start it with: turbo run dev --filter=mealforge-web');
    
  } catch (error) {
    console.error('❌ Error during data restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}
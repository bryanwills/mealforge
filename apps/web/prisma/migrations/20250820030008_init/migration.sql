-- CreateTable
CREATE TABLE "public"."GroceryList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroceryListItem" (
    "id" TEXT NOT NULL,
    "groceryListId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImportCorrection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "correctedText" TEXT NOT NULL,
    "correctionType" TEXT NOT NULL,
    "importSource" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "commonUnits" TEXT[],
    "caloriesPerGram" DOUBLE PRECISION,
    "proteinPerGram" DOUBLE PRECISION,
    "carbsPerGram" DOUBLE PRECISION,
    "fatPerGram" DOUBLE PRECISION,
    "fiberPerGram" DOUBLE PRECISION,
    "sugarPerGram" DOUBLE PRECISION,
    "sodiumPerGram" DOUBLE PRECISION,
    "conversionFactors" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealPlanItem" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" TEXT NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "difficulty" TEXT,
    "cuisine" TEXT,
    "tags" TEXT[],
    "instructions" TEXT[],
    "sourceUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isShared" BOOLEAN DEFAULT false,
    "calories" INTEGER,
    "nutrition" JSONB,
    "importSource" TEXT,
    "importAccuracy" DOUBLE PRECISION,
    "externalId" TEXT,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeLike" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeShare" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RecipeShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Substitution" (
    "id" TEXT NOT NULL,
    "originalIngredientId" TEXT NOT NULL,
    "substituteIngredientId" TEXT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroceryListItem_groceryListId_ingredientId_unit_key" ON "public"."GroceryListItem"("groceryListId", "ingredientId", "unit");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "public"."Ingredient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanItem_mealPlanId_recipeId_date_mealType_key" ON "public"."MealPlanItem"("mealPlanId", "recipeId", "date", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_unit_key" ON "public"."RecipeIngredient"("recipeId", "ingredientId", "unit");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeLike_recipeId_userId_key" ON "public"."RecipeLike"("recipeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeShare_recipeId_userId_key" ON "public"."RecipeShare"("recipeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Substitution_originalIngredientId_substituteIngredientId_key" ON "public"."Substitution"("originalIngredientId", "substituteIngredientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."GroceryList" ADD CONSTRAINT "GroceryList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroceryListItem" ADD CONSTRAINT "GroceryListItem_groceryListId_fkey" FOREIGN KEY ("groceryListId") REFERENCES "public"."GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroceryListItem" ADD CONSTRAINT "GroceryListItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportCorrection" ADD CONSTRAINT "ImportCorrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealPlanItem" ADD CONSTRAINT "MealPlanItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "public"."MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealPlanItem" ADD CONSTRAINT "MealPlanItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeLike" ADD CONSTRAINT "RecipeLike_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeLike" ADD CONSTRAINT "RecipeLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeShare" ADD CONSTRAINT "RecipeShare_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeShare" ADD CONSTRAINT "RecipeShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Substitution" ADD CONSTRAINT "Substitution_originalIngredientId_fkey" FOREIGN KEY ("originalIngredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Substitution" ADD CONSTRAINT "Substitution_substituteIngredientId_fkey" FOREIGN KEY ("substituteIngredientId") REFERENCES "public"."Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

# 🍽️ RecipeHub Monorepo Documentation

This document includes the full code and setup details for the RecipeHub app including:
- Monorepo layout
- Prisma schema
- Supabase setup
- Backend API
- Admin Dashboard
- Conversion data
- Git workflow

---

## 📁 Monorepo Layout

```txt
apps/
  web/        # Next.js frontend
  api/        # API (Next.js or tRPC)
packages/
  ui/         # Shared components
  utils/      # Recipe parsing, OCR, imports
  types/      # Shared TypeScript types
  prisma/     # Prisma schema & DB mgmt
```

---

## 📦 Root `package.json`

```json
{
  "name": "recipehub-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "devDependencies": {
    "turbo": "^1.11.3",
    "prisma": "^5.2.0"
  },
  "dependencies": {
    "@prisma/client": "^5.2.0",
    "@dnd-kit/core": "^6.0.6",
    "@dnd-kit/sortable": "^6.0.6",
    "framer-motion": "^11.0.0",
    "tesseract.js": "^4.0.2",
    "zod": "^3.22.4"
  }
}
```

---

## 🧠 Prisma Schema (packages/prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  preferences Json
  recipes     Recipe[]
}

model Recipe {
  id           String   @id @default(uuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  title        String
  unitSystem   String
  servings     Int
  description  String?
  instructions String[]
  ingredients  RecipeIngredient[]
  createdAt    DateTime @default(now())
}

model Ingredient {
  id                    String   @id @default(uuid())
  name                  String
  commonUnits           String[]
  category              String?
  caloriesPerGram       Float
  flags                 Json
  krogerId              String?
  walmartId             String?
  conversionFactorToGrams Float
  substitutions         Substitution[] @relation("OriginalIngredient")
  usedAsSubstitute      Substitution[] @relation("SubstituteIngredient")
}

model RecipeIngredient {
  id             String     @id @default(uuid())
  recipe         Recipe     @relation(fields: [recipeId], references: [id])
  recipeId       String
  ingredient     Ingredient @relation(fields: [ingredientId], references: [id])
  ingredientId   String
  unit           String
  quantity       Float
  scaledQuantity Float?
  calories       Float?
  customSubId    String?
}

model Substitution {
  id             String     @id @default(uuid())
  ingredient     Ingredient @relation("OriginalIngredient", fields: [ingredientId], references: [id])
  ingredientId   String
  substitute     Ingredient @relation("SubstituteIngredient", fields: [substituteId], references: [id])
  substituteId   String
  flavorChange   String
  calorieDiff    Float
  contextNotes   String?
  aiGenerated    Boolean    @default(false)
}
```

---

## ⚖️ conversion.json

```json
{
  "cup": { "to_grams": { "flour": 120, "sugar": 200, "butter": 227 } },
  "tbsp": { "to_grams": { "butter": 14.2, "olive oil": 13.5 } },
  "tsp": { "to_grams": { "salt": 6, "baking powder": 4.6 } },
  "g": { "to_grams": 1 },
  "oz": { "to_grams": 28.35 }
}
```

---

## 🛠 API: `apps/api/recipes/create.ts`

```ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const prisma = new PrismaClient();

const recipeSchema = z.object({
  title: z.string(),
  userId: z.string().uuid(),
  unitSystem: z.enum(['imperial', 'metric']),
  servings: z.number().int(),
  description: z.string().optional(),
  instructions: z.array(z.string()),
  ingredients: z.array(z.object({
    ingredientId: z.string().uuid(),
    unit: z.string(),
    quantity: z.number()
  }))
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const result = recipeSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);

  const { title, userId, unitSystem, servings, description, instructions, ingredients } = result.data;

  try {
    const recipe = await prisma.recipe.create({
      data: {
        title,
        userId,
        unitSystem,
        servings,
        description,
        instructions,
        ingredients: {
          create: ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            unit: ing.unit,
            quantity: ing.quantity
          }))
        }
      },
      include: { ingredients: true }
    });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recipe', detail: error });
  }
}
```

---

## 🧑‍💼 Admin Dashboard: `apps/web/app/dashboard/page.tsx`

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('/api/recipes').then(res => res.json()).then(setRecipes);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Recipes</h1>
        <Link href="/upload" className="bg-green-600 text-white px-4 py-2 rounded">New Recipe</Link>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recipes.map((r) => (
          <li key={r.id} className="bg-white rounded shadow p-4">
            <h2 className="font-bold text-lg">{r.title}</h2>
            <p className="text-sm text-gray-500">{r.servings} servings</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔧 Supabase Setup

```bash
# In your .env file
DATABASE_URL="postgresql://postgres:<your-password>@db.<hash>.supabase.co:5432/postgres"

# Setup commands
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## 📚 Git + PR Workflow

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/recipehub-monorepo.git

git add .
git commit -m "Initial commit"

git push -u origin main

# For new features
git checkout -b feature/recipe-upload
# work on code...
git add .
git commit -m "Implement recipe upload feature"
git push origin feature/recipe-upload

# Open Pull Request
```

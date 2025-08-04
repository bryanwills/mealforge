// Ingredient conversion utilities for shopping-friendly quantities

interface ConversionRule {
  fromUnit: string
  toUnit: string
  conversionFactor: number
  ingredientName: string
}

const conversionRules: ConversionRule[] = [
  // Chicken conversions
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 2, // 1 cup shredded chicken ≈ 2 chicken breasts
    ingredientName: 'chicken'
  },
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 2,
    ingredientName: 'chicken breast'
  },
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 2,
    ingredientName: 'shredded chicken'
  },

  // Ground beef conversions
  {
    fromUnit: 'cup',
    toUnit: 'pound',
    conversionFactor: 0.5, // 1 cup ground beef ≈ 0.5 pounds
    ingredientName: 'ground beef'
  },
  {
    fromUnit: 'cup',
    toUnit: 'pound',
    conversionFactor: 0.5,
    ingredientName: 'beef'
  },

  // Rice conversions
  {
    fromUnit: 'cup',
    toUnit: 'cup',
    conversionFactor: 0.5, // 1 cup cooked rice ≈ 0.5 cups uncooked rice
    ingredientName: 'rice'
  },
  {
    fromUnit: 'cup',
    toUnit: 'cup',
    conversionFactor: 0.5,
    ingredientName: 'cooked rice'
  },

  // Pasta conversions
  {
    fromUnit: 'cup',
    toUnit: 'cup',
    conversionFactor: 0.5, // 1 cup cooked pasta ≈ 0.5 cups uncooked pasta
    ingredientName: 'pasta'
  },
  {
    fromUnit: 'cup',
    toUnit: 'cup',
    conversionFactor: 0.5,
    ingredientName: 'cooked pasta'
  },

  // Onion conversions
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 0.5, // 1 cup chopped onion ≈ 0.5 onions
    ingredientName: 'onion'
  },
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 0.5,
    ingredientName: 'chopped onion'
  },

  // Carrot conversions
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 2, // 1 cup chopped carrots ≈ 2 carrots
    ingredientName: 'carrot'
  },
  {
    fromUnit: 'cup',
    toUnit: 'piece',
    conversionFactor: 2,
    ingredientName: 'chopped carrot'
  }
]

export function convertIngredientQuantity(
  ingredientName: string,
  quantity: number,
  unit: string
): { quantity: number; unit: string; originalQuantity: number; originalUnit: string } {
  const lowerIngredientName = ingredientName.toLowerCase()
  const lowerUnit = unit.toLowerCase()

  // Find matching conversion rule
  const rule = conversionRules.find(rule =>
    rule.ingredientName.toLowerCase() === lowerIngredientName &&
    rule.fromUnit.toLowerCase() === lowerUnit
  )

  if (rule) {
    const convertedQuantity = Math.ceil(quantity * rule.conversionFactor)
    return {
      quantity: convertedQuantity,
      unit: rule.toUnit,
      originalQuantity: quantity,
      originalUnit: unit
    }
  }

  // No conversion found, return original
  return {
    quantity: Math.ceil(quantity),
    unit: unit,
    originalQuantity: quantity,
    originalUnit: unit
  }
}

export function formatShoppingQuantity(quantity: number, unit: string): string {
  const roundedQuantity = Math.ceil(quantity)

  // Format based on unit type
  if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pieces') {
    return `${roundedQuantity} ${roundedQuantity === 1 ? 'piece' : 'pieces'}`
  } else if (unit.toLowerCase() === 'cup' || unit.toLowerCase() === 'cups') {
    return `${roundedQuantity} ${roundedQuantity === 1 ? 'cup' : 'cups'}`
  } else if (unit.toLowerCase() === 'pound' || unit.toLowerCase() === 'pounds') {
    return `${roundedQuantity} ${roundedQuantity === 1 ? 'pound' : 'pounds'}`
  } else if (unit.toLowerCase() === 'tbsp' || unit.toLowerCase() === 'tablespoon') {
    return `${roundedQuantity} ${roundedQuantity === 1 ? 'tbsp' : 'tbsp'}`
  } else if (unit.toLowerCase() === 'tsp' || unit.toLowerCase() === 'teaspoon') {
    return `${roundedQuantity} ${roundedQuantity === 1 ? 'tsp' : 'tsp'}`
  } else {
    return `${roundedQuantity} ${unit}`
  }
}
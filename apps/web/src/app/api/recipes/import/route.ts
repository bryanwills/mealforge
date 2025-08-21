import { NextRequest, NextResponse } from 'next/server'
import { RecipeImportService } from '@/lib/recipe-import-service'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const importType = formData.get('importType') as string
    const url = formData.get('url') as string
    const imageFile = formData.get('imageFile') as File

    logger.info('Import request', { importType, url, imageFile: imageFile?.name })

    if (importType === 'url' && url) {
      const result = await RecipeImportService.importFromURL(url)

      logger.info('URL import completed', {
        title: result.recipe.title,
        ingredientCount: result.recipe.ingredients.length,
        validationIssues: result.validation.issues.length,
        isValid: result.validation.isValid
      })

      return NextResponse.json({
        success: true,
        recipe: result.recipe,
        validation: result.validation
      })
    } else if (importType === 'image' && imageFile) {
      const recipe = await RecipeImportService.importFromImage(imageFile)

      logger.info('Image import completed', {
        title: recipe.title,
        ingredientCount: recipe.ingredients.length
      })

      return NextResponse.json({
        success: true,
        recipe: recipe,
        validation: {
          isValid: true,
          issues: [],
          suggestions: []
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid import type or missing data' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Import error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to import recipe' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
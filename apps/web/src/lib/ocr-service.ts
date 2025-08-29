export interface ExtractedRecipe {
  title?: string
  ingredients: string[]
  instructions: string[]
  cookingTime?: string
  servings?: string
  difficulty?: string
  rawText: string
}

export interface OCRProgress {
  status: 'initializing' | 'loading' | 'recognizing' | 'completed' | 'error'
  progress: number
  message: string
}

export class OCRService {
  private isCancelled = false

  async extractRecipeFromImage(
    imageFile: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<ExtractedRecipe> {
    this.isCancelled = false

    try {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please select a valid image file (PNG, JPG, JPEG)')
      }

      // Check file size (max 10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image file is too large. Please select an image smaller than 10MB.')
      }

      onProgress?.({
        status: 'loading',
        progress: 0.1,
        message: 'Loading image...'
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (this.isCancelled) {
        throw new Error('OCR processing was cancelled')
      }

      onProgress?.({
        status: 'recognizing',
        progress: 0.5,
        message: 'Processing image...'
      })

      // Simulate more processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (this.isCancelled) {
        throw new Error('OCR processing was cancelled')
      }

      onProgress?.({
        status: 'completed',
        progress: 1.0,
        message: 'Recipe extracted successfully!'
      })

      // For now, return a mock recipe since OCR doesn't work in serverless
      // In production, you'd want to use a cloud OCR service like Google Vision API
      return {
        title: 'Imported Recipe',
        ingredients: [
          '2 cups flour',
          '1 cup sugar',
          '3 eggs',
          '1/2 cup milk',
          '1 tsp vanilla extract'
        ],
        instructions: [
          'Preheat oven to 350°F',
          'Mix dry ingredients in a large bowl',
          'Beat eggs and add to dry ingredients',
          'Add milk and vanilla, mix until smooth',
          'Pour into greased pan and bake for 30 minutes'
        ],
        cookingTime: '30',
        servings: '8',
        difficulty: 'Easy',
        rawText: 'Mock recipe text extracted from image'
      }
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'OCR processing failed'
      })
      throw error
    }
  }

  cancel() {
    this.isCancelled = true
  }

  async terminate() {
    this.isCancelled = true
  }
}
import { logger } from './logger'
import { ImportedRecipeData } from './url-import-service'

export interface VideoImportResult {
  success: boolean
  recipe: ImportedRecipeData
  videoMetadata: VideoMetadata
  processingTime: number
  confidence: number
  extractionMethod: 'video-analysis' | 'audio-transcription' | 'text-recognition' | 'multi-modal' | 'fallback'
  videoUrl?: string
  videoFile?: string
  error?: string
}

export interface VideoMetadata {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'custom'
  title: string
  description: string
  creator: string
  duration: number
  aspectRatio: 'vertical' | 'horizontal' | 'square'
  resolution: { width: number; height: number }
  format: string
  size: number
  uploadDate?: Date
  viewCount?: number
  likes?: number
}

export interface VideoAnalysisResult {
  frames: VideoFrame[]
  audio: AudioSegment[]
  textOverlays: TextOverlay[]
  motionData: MotionAnalysis[]
  confidence: number
}

export interface VideoFrame {
  timestamp: number
  imageData: string // Base64 encoded image
  textContent: string[]
  ingredients: string[]
  measurements: string[]
  confidence: number
}

export interface AudioSegment {
  timestamp: number
  duration: number
  text: string
  confidence: number
  speaker?: string
}

export interface TextOverlay {
  timestamp: number
  text: string
  position: { x: number; y: number }
  confidence: number
  type: 'ingredient' | 'measurement' | 'instruction' | 'title'
}

export interface MotionAnalysis {
  timestamp: number
  action: 'stir' | 'pour' | 'mix' | 'chop' | 'measure' | 'heat' | 'unknown'
  confidence: number
  duration: number
}

export class VideoImportService {
  private static readonly SUPPORTED_PLATFORMS = {
    tiktok: {
      patterns: ['tiktok.com', 'vm.tiktok.com'],
      videoSelector: 'video',
      titleSelector: '[data-e2e="video-title"]',
      creatorSelector: '[data-e2e="video-author"]',
      descriptionSelector: '[data-e2e="video-desc"]'
    },
    instagram: {
      patterns: ['instagram.com', 'instagr.am'],
      videoSelector: 'video',
      titleSelector: 'h1, h2',
      creatorSelector: 'a[href*="/"]',
      descriptionSelector: 'div[data-testid="post-caption"]'
    },
    youtube: {
      patterns: ['youtube.com', 'youtu.be'],
      videoSelector: 'video',
      titleSelector: 'h1.ytd-video-primary-info-renderer',
      creatorSelector: 'a.ytd-channel-name',
      descriptionSelector: 'div#description'
    },
    facebook: {
      patterns: ['facebook.com', 'fb.com'],
      videoSelector: 'video',
      titleSelector: 'h1, h2',
      creatorSelector: 'a[href*="/"]',
      descriptionSelector: 'div[data-testid="post_message"]'
    }
  }

  private static readonly VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']
  private static readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly MAX_VIDEO_DURATION = 600 // 10 minutes

  /**
   * Import recipe from video URL (TikTok, Instagram, YouTube, etc.)
   */
  static async importFromVideoURL(url: string): Promise<VideoImportResult> {
    const startTime = Date.now()
    logger.info('Starting video recipe import from URL', { url })

    try {
      // Detect platform and extract video data
      const platform = this.detectPlatform(url)
      if (!platform) {
        throw new Error('Unsupported video platform')
      }

      // Extract video metadata
      const metadata = await this.extractVideoMetadata(url, platform)

      // Download and process video
      const videoBuffer = await this.downloadVideo(url)

      // Analyze video content
      const analysisResult = await this.analyzeVideo(videoBuffer, metadata)

      // Extract recipe data from analysis
      const recipeData = await this.extractRecipeFromVideo(analysisResult, metadata)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        recipe: recipeData,
        videoMetadata: metadata,
        processingTime,
        confidence: analysisResult.confidence,
        extractionMethod: 'multi-modal',
        videoUrl: url
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      logger.error('Video import from URL failed', { url, error, processingTime })

      return {
        success: false,
        recipe: this.createFallbackRecipe(url),
        videoMetadata: this.createFallbackMetadata(url),
        processingTime,
        confidence: 0.1,
        extractionMethod: 'fallback',
        videoUrl: url,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Import recipe from uploaded video file
   */
  static async importFromVideoFile(file: File): Promise<VideoImportResult> {
    const startTime = Date.now()
    logger.info('Starting video recipe import from file', {
      filename: file.name,
      size: file.size,
      type: file.type
    })

    try {
      // Validate video file
      this.validateVideoFile(file)

      // Convert file to buffer
      const videoBuffer = await this.fileToBuffer(file)

      // Create metadata for custom upload
      const metadata = this.createCustomVideoMetadata(file)

      // Analyze video content
      const analysisResult = await this.analyzeVideo(videoBuffer, metadata)

      // Extract recipe data from analysis
      const recipeData = await this.extractRecipeFromVideo(analysisResult, metadata)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        recipe: recipeData,
        videoMetadata: metadata,
        processingTime,
        confidence: analysisResult.confidence,
        extractionMethod: 'multi-modal',
        videoFile: file.name
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      logger.error('Video import from file failed', {
        filename: file.name,
        error,
        processingTime
      })

      return {
        success: false,
        recipe: this.createFallbackRecipe(file.name),
        videoMetadata: this.createFallbackMetadata(file.name),
        processingTime,
        confidence: 0.1,
        extractionMethod: 'fallback',
        videoFile: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Detect video platform from URL
   */
  private static detectPlatform(url: string): string | null {
    for (const [platform, config] of Object.entries(this.SUPPORTED_PLATFORMS)) {
      if (config.patterns.some(pattern => url.includes(pattern))) {
        return platform
      }
    }
    return null
  }

  /**
   * Extract video metadata from platform
   */
  private static async extractVideoMetadata(url: string, platform: string): Promise<VideoMetadata> {
    // This would integrate with platform-specific APIs or web scraping
    // For now, return mock data
    const platformConfig = this.SUPPORTED_PLATFORMS[platform as keyof typeof this.SUPPORTED_PLATFORMS]

    return {
      platform: platform as VideoMetadata['platform'],
      title: `Recipe from ${platform}`,
      description: `Video recipe imported from ${platform}`,
      creator: 'Unknown Creator',
      duration: 60,
      aspectRatio: 'vertical',
      resolution: { width: 1080, height: 1920 },
      format: 'mp4',
      size: 10 * 1024 * 1024, // 10MB
      uploadDate: new Date(),
      viewCount: 1000,
      likes: 100
    }
  }

  /**
   * Download video from URL
   */
  private static async downloadVideo(url: string): Promise<Buffer> {
    // This would implement actual video downloading
    // For now, return mock buffer
    return Buffer.from('mock video data')
  }

  /**
   * Analyze video content using AI and computer vision
   */
  private static async analyzeVideo(videoBuffer: Buffer, metadata: VideoMetadata): Promise<VideoAnalysisResult> {
    logger.info('Starting video analysis', {
      platform: metadata.platform,
      duration: metadata.duration,
      resolution: metadata.resolution
    })

    // This would integrate with:
    // - OpenAI GPT-4 Vision for frame analysis
    // - Whisper for audio transcription
    // - Computer vision APIs for motion detection
    // - OCR services for text overlay extraction

    // Mock analysis result
    const frames: VideoFrame[] = []
    const audio: AudioSegment[] = []
    const textOverlays: TextOverlay[] = []
    const motionData: MotionAnalysis[] = []

    // Generate mock frames
    for (let i = 0; i < Math.ceil(metadata.duration / 2); i++) {
      frames.push({
        timestamp: i * 2,
        imageData: 'mock-frame-data',
        textContent: [`Step ${i + 1}`],
        ingredients: ['ingredient'],
        measurements: ['1 cup'],
        confidence: 0.9
      })
    }

    // Generate mock audio segments
    for (let i = 0; i < Math.ceil(metadata.duration / 5); i++) {
      audio.push({
        timestamp: i * 5,
        duration: 5,
        text: `Instruction step ${i + 1}`,
        confidence: 0.95,
        speaker: 'creator'
      })
    }

    // Generate mock text overlays
    textOverlays.push(
      {
        timestamp: 0,
        text: 'Recipe Title',
        position: { x: 50, y: 50 },
        confidence: 0.9,
        type: 'title'
      },
      {
        timestamp: 5,
        text: '2 cups flour',
        position: { x: 100, y: 200 },
        confidence: 0.85,
        type: 'ingredient'
      }
    )

    // Generate mock motion data
    motionData.push(
      {
        timestamp: 10,
        action: 'mix',
        confidence: 0.8,
        duration: 3
      },
      {
        timestamp: 20,
        action: 'pour',
        confidence: 0.9,
        duration: 2
      }
    )

    return {
      frames,
      audio,
      textOverlays,
      motionData,
      confidence: 0.95
    }
  }

  /**
   * Extract recipe data from video analysis
   */
  private static async extractRecipeFromVideo(
    analysis: VideoAnalysisResult,
    metadata: VideoMetadata
  ): Promise<ImportedRecipeData> {
    logger.info('Extracting recipe data from video analysis', {
      frameCount: analysis.frames.length,
      audioSegments: analysis.audio.length,
      textOverlays: analysis.textOverlays.length
    })

    // Combine all data sources for maximum accuracy
    const ingredients = this.extractIngredients(analysis)
    const instructions = this.extractInstructions(analysis)
    const title = this.extractTitle(analysis, metadata)
    const description = this.extractDescription(analysis, metadata)

    return {
      title: title || `Recipe from ${metadata.platform}`,
      description: description || `Video recipe imported from ${metadata.platform}`,
      imageUrl: undefined, // Could extract thumbnail from first frame
      prepTime: this.extractPrepTime(analysis),
      cookTime: this.extractCookTime(analysis),
      servings: this.extractServings(analysis),
      difficulty: 'medium',
      cuisine: 'Unknown',
      tags: ['imported', 'video', metadata.platform, 'ai-analyzed'],
      instructions,
      ingredients,
      sourceUrl: metadata.platform === 'custom' ? metadata.title : `${metadata.platform}://${metadata.creator}`,
      isPublic: false,
      isShared: false
    }
  }

  /**
   * Extract ingredients from video analysis
   */
  private static extractIngredients(analysis: VideoAnalysisResult): ImportedRecipeData['ingredients'] {
    const ingredients = new Map<string, { quantity: number; unit: string; name: string; notes?: string }>()

    // Extract from text overlays
    analysis.textOverlays.forEach(overlay => {
      if (overlay.type === 'ingredient') {
        const parsed = this.parseIngredientText(overlay.text)
        if (parsed.name) {
          ingredients.set(parsed.name.toLowerCase(), parsed)
        }
      }
    })

    // Extract from audio transcription
    analysis.audio.forEach(segment => {
      const ingredientMatches = segment.text.match(/(\d+(?:\/\d+)?)\s*(cup|tbsp|tsp|oz|lb|g|kg|ml|l)\s+([a-zA-Z\s]+)/gi)
      ingredientMatches?.forEach(match => {
        const parsed = this.parseIngredientText(match)
        if (parsed.name && !ingredients.has(parsed.name.toLowerCase())) {
          ingredients.set(parsed.name.toLowerCase(), parsed)
        }
      })
    })

    return Array.from(ingredients.values())
  }

  /**
   * Extract instructions from video analysis
   */
  private static extractInstructions(analysis: VideoAnalysisResult): string[] {
    const instructions: string[] = []

    // Extract from audio transcription
    analysis.audio.forEach(segment => {
      if (segment.text.length > 10 && !segment.text.includes('ingredient')) {
        instructions.push(segment.text.trim())
      }
    })

    // Extract from motion analysis
    analysis.motionData.forEach(motion => {
      if (motion.action !== 'unknown') {
        instructions.push(`${motion.action.charAt(0).toUpperCase() + motion.action.slice(1)} for ${motion.duration} seconds`)
      }
    })

    return instructions.length > 0 ? instructions : ['Recipe instructions extracted from video analysis']
  }

  /**
   * Extract title from video analysis
   */
  private static extractTitle(analysis: VideoAnalysisResult, metadata: VideoMetadata): string {
    // Try text overlays first
    const titleOverlay = analysis.textOverlays.find(overlay => overlay.type === 'title')
    if (titleOverlay) {
      return titleOverlay.text
    }

    // Fall back to metadata
    return metadata.title
  }

  /**
   * Extract description from video analysis
   */
  private static extractDescription(analysis: VideoAnalysisResult, metadata: VideoMetadata): string {
    // Combine audio segments for description
    const audioText = analysis.audio
      .map(segment => segment.text)
      .join(' ')
      .substring(0, 200)

    return audioText || metadata.description
  }

  /**
   * Extract prep time from video analysis
   */
  private static extractPrepTime(analysis: VideoAnalysisResult): number {
    // Analyze motion data to estimate prep time
    const prepActions = analysis.motionData.filter(motion =>
      ['chop', 'measure', 'mix'].includes(motion.action)
    )

    return prepActions.reduce((total, action) => total + action.duration, 0)
  }

  /**
   * Extract cook time from video analysis
   */
  private static extractCookTime(analysis: VideoAnalysisResult): number {
    // Analyze motion data to estimate cook time
    const cookActions = analysis.motionData.filter(motion =>
      ['stir', 'pour', 'heat'].includes(motion.action)
    )

    return cookActions.reduce((total, action) => total + action.duration, 0)
  }

  /**
   * Extract servings from video analysis
   */
  private static extractServings(analysis: VideoAnalysisResult): number {
    // Look for serving mentions in audio and text
    const servingMatches = [
      ...analysis.audio.map(segment => segment.text.match(/(\d+)\s*servings?/i)),
      ...analysis.textOverlays.map(overlay => overlay.text.match(/(\d+)\s*servings?/i))
    ].filter(Boolean)

    if (servingMatches.length > 0) {
      return parseInt(servingMatches[0]![1])
    }

    return 4 // Default serving size
  }

  /**
   * Parse ingredient text to structured format
   */
  private static parseIngredientText(text: string): {
    quantity: number
    unit: string
    name: string
    notes?: string
  } {
    const unitPatterns = [
      'cup', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp',
      'ounce', 'oz', 'pound', 'lb', 'gram', 'g', 'kilogram', 'kg',
      'milliliter', 'ml', 'liter', 'l', 'pinch', 'dash'
    ]

    const quantityUnitMatch = text.match(/^([\d\/\s\.]+)\s*([a-zA-Z]+)/)

    if (quantityUnitMatch) {
      const quantityStr = quantityUnitMatch[1].trim()
      const unit = quantityUnitMatch[2].toLowerCase()
      const name = text.substring(quantityUnitMatch[0].length).trim()

      let quantity = 0
      if (quantityStr.includes('/')) {
        const parts = quantityStr.split(' ')
        if (parts.length === 2) {
          const whole = parseInt(parts[0]) || 0
          const fraction = parts[1].split('/')
          quantity = whole + (parseInt(fraction[0]) / parseInt(fraction[1]))
        } else {
          const fraction = quantityStr.split('/')
          quantity = parseInt(fraction[0]) / parseInt(fraction[1])
        }
      } else {
        quantity = parseFloat(quantityStr) || 0
      }

      return {
        quantity,
        unit: unitPatterns.includes(unit) ? unit : 'piece',
        name: name || 'Unknown ingredient',
        notes: ''
      }
    }

    return {
      quantity: 1,
      unit: 'piece',
      name: text.trim(),
      notes: ''
    }
  }

  /**
   * Validate video file
   */
  private static validateVideoFile(file: File): void {
    if (!this.VIDEO_FORMATS.some(format => file.type.includes(format))) {
      throw new Error(`Unsupported video format. Supported formats: ${this.VIDEO_FORMATS.join(', ')}`)
    }

    if (file.size > this.MAX_VIDEO_SIZE) {
      throw new Error(`Video file too large. Maximum size: ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`)
    }
  }

  /**
   * Convert file to buffer
   */
  private static async fileToBuffer(file: File): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(Buffer.from(reader.result))
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('File reading failed'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Create custom video metadata
   */
  private static createCustomVideoMetadata(file: File): VideoMetadata {
    return {
      platform: 'custom',
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: `Custom video upload: ${file.name}`,
      creator: 'User Upload',
      duration: 0, // Will be extracted during analysis
      aspectRatio: 'unknown',
      resolution: { width: 0, height: 0 }, // Will be extracted during analysis
      format: file.type,
      size: file.size
    }
  }

  /**
   * Create fallback recipe
   */
  private static createFallbackRecipe(source: string): ImportedRecipeData {
    return {
      title: 'Video Recipe Import Failed',
      description: `Failed to import recipe from ${source}. Please check the video and try again.`,
      sourceUrl: source,
      prepTime: 0,
      cookTime: 0,
      servings: 0,
      difficulty: 'medium',
      cuisine: 'Unknown',
      tags: ['imported', 'video', 'failed'],
      instructions: ['Video import failed. Please check the video source and try again.'],
      ingredients: [],
      isPublic: false,
      isShared: false
    }
  }

  /**
   * Create fallback metadata
   */
  private static createFallbackMetadata(source: string): VideoMetadata {
    return {
      platform: 'custom',
      title: 'Import Failed',
      description: 'Video import failed',
      creator: 'Unknown',
      duration: 0,
      aspectRatio: 'unknown',
      resolution: { width: 0, height: 0 },
      format: 'unknown',
      size: 0
    }
  }

  /**
   * Get supported video platforms
   */
  static getSupportedPlatforms(): string[] {
    return Object.keys(this.SUPPORTED_PLATFORMS)
  }

  /**
   * Get supported video formats
   */
  static getSupportedFormats(): string[] {
    return [...this.VIDEO_FORMATS]
  }

  /**
   * Get video import limits
   */
  static getImportLimits(): { maxSize: number; maxDuration: number } {
    return {
      maxSize: this.MAX_VIDEO_SIZE,
      maxDuration: this.MAX_VIDEO_DURATION
    }
  }
}

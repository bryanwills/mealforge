import { NextRequest, NextResponse } from 'next/server'
import { VideoImportService } from '@/lib/video-import-service'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, platform, options = {} } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      )
    }

    logger.info('Starting video URL import', {
      url,
      platform,
      options
    })

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Detect platform if not provided
    let detectedPlatform = platform
    if (!detectedPlatform) {
      detectedPlatform = VideoImportService.getSupportedPlatforms().find(p =>
        url.includes(p)
      ) || 'custom'
    }

    // Validate platform support
    if (!VideoImportService.getSupportedPlatforms().includes(detectedPlatform)) {
      return NextResponse.json(
        { success: false, error: `Unsupported platform: ${detectedPlatform}` },
        { status: 400 }
      )
    }

    // Process video with VideoImportService
    const result = await VideoImportService.importFromVideoURL(url)

    if (result.success) {
      logger.info('Video URL import successful', {
        url,
        platform: detectedPlatform,
        confidence: result.confidence,
        extractionMethod: result.extractionMethod
      })

      return NextResponse.json({
        success: true,
        videoId: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: detectedPlatform,
        processingStatus: 'completed',
        result: {
          recipe: result.recipe,
          confidence: result.confidence,
          extractionMethod: result.extractionMethod,
          processingTime: result.processingTime,
          videoMetadata: result.videoMetadata
        }
      })
    } else {
      logger.error('Video URL import failed', {
        url,
        platform: detectedPlatform,
        error: result.error
      })

      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to import video from URL'
      }, { status: 500 })
    }

  } catch (error) {
    logger.error('Video URL import API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Video URL import endpoint',
    supportedPlatforms: VideoImportService.getSupportedPlatforms(),
    examples: {
      tiktok: 'https://www.tiktok.com/@username/video/1234567890',
      instagram: 'https://www.instagram.com/reel/ABC123/',
      youtube: 'https://youtube.com/shorts/ABC123',
      facebook: 'https://facebook.com/username/videos/123456789'
    }
  })
}

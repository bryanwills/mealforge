import { NextRequest, NextResponse } from 'next/server'
import { VideoImportService } from '@/lib/video-import-service'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const platform = formData.get('platform') as string
    const metadata = formData.get('metadata') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      )
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB` },
        { status: 400 }
      )
    }

    logger.info('Starting video upload', {
      filename: file.name,
      size: file.size,
      type: file.type,
      platform: platform || 'custom'
    })

    // Process video with VideoImportService
    const result = await VideoImportService.importFromVideoFile(file)

    if (result.success) {
      logger.info('Video upload successful', {
        filename: file.name,
        confidence: result.confidence,
        extractionMethod: result.extractionMethod
      })

      return NextResponse.json({
        success: true,
        videoId: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadUrl: `/api/videos/${result.videoFile}`,
        processingStatus: 'completed',
        result: {
          recipe: result.recipe,
          confidence: result.confidence,
          extractionMethod: result.extractionMethod,
          processingTime: result.processingTime
        }
      })
    } else {
      logger.error('Video upload failed', {
        filename: file.name,
        error: result.error
      })

      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to process video'
      }, { status: 500 })
    }

  } catch (error) {
    logger.error('Video upload API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Video upload endpoint',
    supportedFormats: VideoImportService.getSupportedFormats(),
    limits: VideoImportService.getImportLimits()
  })
}

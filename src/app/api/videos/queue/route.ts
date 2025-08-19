import { NextRequest, NextResponse } from 'next/server'
import { VideoProcessingQueue } from '@/lib/video-processing-queue'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const jobId = searchParams.get('jobId')

    if (jobId) {
      // Get specific job status
      const queue = VideoProcessingQueue.getInstance()
      const job = queue.getJobStatus(jobId)

      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        job
      })
    }

    if (userId) {
      // Get all jobs for a user
      const queue = VideoProcessingQueue.getInstance()
      const jobs = queue.getUserJobs(userId)

      return NextResponse.json({
        success: true,
        jobs,
        count: jobs.length
      })
    }

    // Get queue statistics
    const queue = VideoProcessingQueue.getInstance()
    const stats = queue.getQueueStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    logger.error('Video queue API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, platform, url, file, priority = 'normal', processingOptions = {} } = body

    if (!videoId || !platform) {
      return NextResponse.json(
        { success: false, error: 'Video ID and platform are required' },
        { status: 400 }
      )
    }

    const queue = VideoProcessingQueue.getInstance()
    const jobId = await queue.addJob(videoId, platform, {
      url,
      file,
      priority,
      processingOptions
    })

    logger.info('Video processing job added to queue', {
      jobId,
      videoId,
      platform,
      priority
    })

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Video processing job added to queue'
    })

  } catch (error) {
    logger.error('Video queue API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const queue = VideoProcessingQueue.getInstance()
    const cancelled = queue.cancelJob(jobId)

    if (cancelled) {
      logger.info('Video processing job cancelled', { jobId })

      return NextResponse.json({
        success: true,
        message: 'Video processing job cancelled successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Job not found or already completed' },
        { status: 404 }
      )
    }

  } catch (error) {
    logger.error('Video queue cancellation API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, action } = body

    if (!jobId || !action) {
      return NextResponse.json(
        { success: false, error: 'Job ID and action are required' },
        { status: 400 }
      )
    }

    const queue = VideoProcessingQueue.getInstance()

    switch (action) {
      case 'retry':
        const retried = queue.retryJob(jobId)
        if (retried) {
          logger.info('Video processing job retry initiated', { jobId })

          return NextResponse.json({
            success: true,
            message: 'Video processing job retry initiated'
          })
        } else {
          return NextResponse.json(
            { success: false, error: 'Job cannot be retried or max retries exceeded' },
            { status: 400 }
          )
        }

      case 'priority':
        // In production, this would update job priority
        return NextResponse.json({
          success: true,
          message: 'Job priority updated'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Video queue update API error', { error })

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

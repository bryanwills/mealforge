import { logger } from './logger'
import { VideoImportResult, VideoMetadata } from './video-import-service'
import { VideoDatabaseService } from './video-database-service'

export interface VideoProcessingJob {
  id: string
  videoId: string
  url?: string
  file?: File
  platform: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: 'low' | 'normal' | 'high'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  progress: number
  currentStep: string
  estimatedTime: number
  error?: string
  result?: VideoImportResult
  metadata?: VideoMetadata
  retryCount: number
  maxRetries: number
}

export interface ProcessingOptions {
  extractAudio?: boolean
  analyzeFrames?: boolean
  detectMotion?: boolean
  ocrText?: boolean
  confidenceThreshold?: number
  includeTiming?: boolean
  includeNutrition?: boolean
  language?: string
}

export class VideoProcessingQueue {
  private static instance: VideoProcessingQueue
  private queue: VideoProcessingJob[] = []
  private processing: VideoProcessingJob[] = []
  private maxConcurrentJobs = 3
  private isProcessing = false

  private constructor() {
    this.startProcessing()
  }

  static getInstance(): VideoProcessingQueue {
    if (!VideoProcessingQueue.instance) {
      VideoProcessingQueue.instance = new VideoProcessingQueue()
    }
    return VideoProcessingQueue.instance
  }

  /**
   * Add a video processing job to the queue
   */
  async addJob(
    videoId: string,
    platform: string,
    userId: string,
    options: {
      url?: string
      file?: File
      priority?: 'low' | 'normal' | 'high'
      processingOptions?: ProcessingOptions
    } = {}
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const job: VideoProcessingJob = {
      id: jobId,
      videoId,
      url: options.url,
      file: options.file,
      platform,
      status: 'queued',
      priority: options.priority || 'normal',
      createdAt: new Date(),
      progress: 0,
      currentStep: 'Queued for processing',
      estimatedTime: 0,
      retryCount: 0,
      maxRetries: 3
    }

    try {
      // Create job in database
      await VideoDatabaseService.createVideoJob({
        videoId,
        userId,
        platform,
        priority: job.priority,
        url: options.url,
        file: options.file
      })

      // Add to in-memory queue
      this.queue.push(job)
      this.sortQueue()

      logger.info('Video processing job added to queue', {
        jobId,
        videoId,
        platform,
        priority: job.priority,
        queueLength: this.queue.length
      })

      // Start processing if not already running
      if (!this.isProcessing) {
        this.startProcessing()
      }

      return jobId
    } catch (error) {
      logger.error('Failed to create video processing job in database', { error, job })
      throw error
    }
  }

  /**
   * Get job status by ID
   */
  async getJobStatus(jobId: string): Promise<VideoProcessingJob | null> {
    try {
      // First check in-memory queue
      const inMemoryJob = this.queue.find(j => j.id === jobId) ||
                          this.processing.find(j => j.id === jobId)

      if (inMemoryJob) {
        return inMemoryJob
      }

      // If not in memory, fetch from database
      const dbJob = await VideoDatabaseService.getVideoJob(jobId)
      if (dbJob) {
        // Convert database job to in-memory format
        const job: VideoProcessingJob = {
          id: dbJob.id,
          videoId: dbJob.videoId,
          platform: dbJob.platform,
          status: dbJob.status as 'queued' | 'processing' | 'completed' | 'failed',
          priority: dbJob.priority as 'low' | 'normal' | 'high',
          createdAt: dbJob.createdAt,
          startedAt: dbJob.startedAt || undefined,
          completedAt: dbJob.completedAt || undefined,
          progress: dbJob.progress,
          currentStep: dbJob.currentStep,
          estimatedTime: dbJob.estimatedTime,
          error: dbJob.error || undefined,
          retryCount: dbJob.retryCount,
          maxRetries: dbJob.maxRetries
        }
        return job
      }

      return null
    } catch (error) {
      logger.error('Failed to get job status from database', { error, jobId })
      return null
    }
  }

  /**
   * Get all jobs for a user
   */
  async getUserJobs(userId: string): Promise<VideoProcessingJob[]> {
    try {
      // Get jobs from database
      const dbJobs = await VideoDatabaseService.getUserVideoJobs(userId)

      // Convert to in-memory format
      const jobs: VideoProcessingJob[] = dbJobs.map((dbJob: any) => ({
        id: dbJob.id,
        videoId: dbJob.videoId,
        platform: dbJob.platform,
        status: dbJob.status as 'queued' | 'processing' | 'completed' | 'failed',
        priority: dbJob.priority as 'low' | 'normal' | 'high',
        createdAt: dbJob.createdAt,
        startedAt: dbJob.startedAt || undefined,
        completedAt: dbJob.completedAt || undefined,
        progress: dbJob.progress,
        currentStep: dbJob.currentStep,
        estimatedTime: dbJob.estimatedTime,
        error: dbJob.error || undefined,
        retryCount: dbJob.retryCount,
        maxRetries: dbJob.maxRetries
      }))

      return jobs
    } catch (error) {
      logger.error('Failed to get user jobs from database', { error, userId })
      return []
    }
  }

  /**
   * Cancel a processing job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const queueIndex = this.queue.findIndex(j => j.id === jobId)
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1)

        // Update database
        await VideoDatabaseService.updateVideoJob(jobId, {
          status: 'failed',
          error: 'Job cancelled by user',
          completedAt: new Date()
        })

        logger.info('Video processing job cancelled from queue', { jobId })
        return true
      }

      const processingIndex = this.processing.findIndex(j => j.id === jobId)
      if (processingIndex !== -1) {
        const job = this.processing[processingIndex]
        job.status = 'failed'
        job.error = 'Job cancelled by user'
        job.completedAt = new Date()

        // Update database
        await VideoDatabaseService.updateVideoJob(jobId, {
          status: 'failed',
          error: 'Job cancelled by user',
          completedAt: new Date()
        })

        this.processing.splice(processingIndex, 1)
        logger.info('Video processing job cancelled during processing', { jobId })
        return true
      }

      return false
    } catch (error) {
      logger.error('Failed to cancel job', { error, jobId })
      return false
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    try {
      const failedJob = this.processing.find(j => j.id === jobId && j.status === 'failed')
      if (!failedJob) return false

      if (failedJob.retryCount >= failedJob.maxRetries) {
        logger.warn('Video processing job max retries exceeded', { jobId, retryCount: failedJob.retryCount })
        return false
      }

      // Remove from processing and add back to queue
      const index = this.processing.findIndex(j => j.id === jobId)
      this.processing.splice(index, 1)

      failedJob.status = 'queued'
      failedJob.progress = 0
      failedJob.currentStep = 'Queued for retry'
      failedJob.estimatedTime = 0
      failedJob.error = undefined
      failedJob.retryCount++

      // Update database
      await VideoDatabaseService.updateVideoJob(jobId, {
        status: 'queued',
        progress: 0,
        currentStep: 'Queued for retry',
        estimatedTime: 0,
        error: undefined
      })

      this.queue.push(failedJob)
      this.sortQueue()

      logger.info('Video processing job retry queued', { jobId, retryCount: failedJob.retryCount })
      return true
    } catch (error) {
      logger.error('Failed to retry job', { error, jobId })
      return false
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      // Get stats from database
      const dbStats = await VideoDatabaseService.getQueueStats()
      return dbStats
    } catch (error) {
      logger.error('Failed to get queue stats from database', { error })
      // Fallback to in-memory stats
      return {
        totalJobs: this.queue.length + this.processing.length,
        queuedJobs: this.queue.length,
        processingJobs: this.processing.length,
        completedJobs: 0,
        failedJobs: 0,
        averageProcessingTime: 0
      }
    }
  }

  /**
   * Start the processing loop
   */
  private async startProcessing() {
    if (this.isProcessing) return

    this.isProcessing = true
    logger.info('Video processing queue started')

    while (this.queue.length > 0 && this.processing.length < this.maxConcurrentJobs) {
      const job = this.queue.shift()
      if (job) {
        this.processing.push(job)
        this.processJob(job)
      }
    }

    this.isProcessing = false
  }

  /**
   * Process a single job
   */
  private async processJob(job: VideoProcessingJob) {
    try {
      job.status = 'processing'
      job.startedAt = new Date()
      job.currentStep = 'Initializing video processing'
      job.progress = 0
      job.estimatedTime = 300 // 5 minutes estimate

      // Update database
      await VideoDatabaseService.updateVideoJob(job.id, {
        status: 'processing',
        startedAt: job.startedAt,
        currentStep: job.currentStep,
        progress: job.progress,
        estimatedTime: job.estimatedTime
      })

      logger.info('Starting video processing job', {
        jobId: job.id,
        videoId: job.videoId,
        platform: job.platform
      })

      // Simulate processing steps
      await this.simulateProcessingSteps(job)

      // Mark job as completed
      job.status = 'completed'
      job.progress = 100
      job.currentStep = 'Processing completed successfully'
      job.completedAt = new Date()
      job.estimatedTime = 0

      // Update database
      await VideoDatabaseService.updateVideoJob(job.id, {
        status: 'completed',
        progress: 100,
        currentStep: job.currentStep,
        completedAt: job.completedAt,
        estimatedTime: 0
      })

      logger.info('Video processing job completed', {
        jobId: job.id,
        videoId: job.videoId,
        processingTime: job.completedAt.getTime() - job.startedAt!.getTime()
      })

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      job.estimatedTime = 0

      // Update database
      await VideoDatabaseService.updateVideoJob(job.id, {
        status: 'failed',
        error: job.error,
        completedAt: job.completedAt,
        estimatedTime: 0
      })

      logger.error('Video processing job failed', {
        jobId: job.id,
        videoId: job.videoId,
        error: job.error
      })
    } finally {
      // Remove from processing array
      const index = this.processing.findIndex(j => j.id === job.id)
      if (index !== -1) {
        this.processing.splice(index, 1)
      }

      // Start processing next job if queue has items
      if (this.queue.length > 0 && this.processing.length < this.maxConcurrentJobs) {
        this.startProcessing()
      }
    }
  }

  /**
   * Simulate processing steps for demo purposes
   */
  private async simulateProcessingSteps(job: VideoProcessingJob) {
    const steps = [
      { name: 'Downloading video', duration: 30, progress: 20 },
      { name: 'Validating video format', duration: 10, progress: 30 },
      { name: 'Extracting video frames', duration: 60, progress: 50 },
      { name: 'Analyzing video content', duration: 120, progress: 70 },
      { name: 'Transcribing audio', duration: 90, progress: 85 },
      { name: 'Extracting recipe data', duration: 60, progress: 95 },
      { name: 'Finalizing results', duration: 20, progress: 100 }
    ]

    for (const step of steps) {
      job.currentStep = step.name
      job.progress = step.progress
      job.estimatedTime = steps.reduce((total, s) => total + s.duration, 0) -
                         steps.slice(0, steps.indexOf(step)).reduce((total, s) => total + s.duration, 0)

      // Update database with progress
      try {
        await VideoDatabaseService.updateVideoJob(job.id, {
          currentStep: job.currentStep,
          progress: job.progress,
          estimatedTime: job.estimatedTime
        })
      } catch (error) {
        logger.error('Failed to update job progress in database', { error, jobId: job.id })
      }

      await new Promise(resolve => setTimeout(resolve, step.duration * 1000))
    }
  }

  /**
   * Sort queue by priority and creation time
   */
  private sortQueue() {
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]

      if (priorityDiff !== 0) return priorityDiff

      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }

  /**
   * Clean up old completed/failed jobs
   */
  async cleanupOldJobs(maxAgeHours: number = 24) {
    try {
      // Clean up database
      const deletedCount = await VideoDatabaseService.cleanupOldJobs(maxAgeHours)

      // Clean up in-memory queue
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)

      this.processing = this.processing.filter(job =>
        job.createdAt > cutoffTime || job.status === 'processing'
      )

      logger.info('Cleaned up old video processing jobs', {
        deletedCount,
        maxAgeHours
      })
    } catch (error) {
      logger.error('Failed to cleanup old jobs', { error })
    }
  }
}

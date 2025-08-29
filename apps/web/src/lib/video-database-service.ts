import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export interface CreateVideoJobData {
  videoId: string
  userId: string
  platform: string
  priority?: 'low' | 'normal' | 'high'
  url?: string
  file?: File
}

export interface UpdateVideoJobData {
  status?: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  currentStep?: string
  estimatedTime?: number
  error?: string
  startedAt?: Date
  completedAt?: Date
}

export interface CreateVideoAnalysisData {
  jobId: string
  videoId: string
  analysisType?: 'full' | 'quick' | 'custom'
  analysisConfig?: Record<string, any>
}

export interface UpdateVideoAnalysisData {
  status?: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  currentStep?: string
  estimatedCompletion?: Date
  frames?: any[]
  audioSegments?: any[]
  textOverlays?: any[]
  motionAnalysis?: any
  confidence?: number
  error?: string
}

export interface CreateVideoRecipeData {
  jobId: string
  videoId: string
  userId: string
  title: string
  description?: string
  imageUrl?: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  tags: string[]
  instructions: string[]
  ingredients: Array<{
    quantity: number
    unit: string
    name: string
    notes?: string
  }>
  sourceUrl?: string
  isPublic?: boolean
  isShared?: boolean
  confidence: number
  extractionMethod?: string
  recommendations?: string[]
  metadata?: Record<string, any>
}

export class VideoDatabaseService {
  /**
   * Create a new video processing job
   */
  static async createVideoJob(data: CreateVideoJobData) {
    try {
      const job = await prisma.videoProcessingJob.create({
        data: {
          videoId: data.videoId,
          userId: data.userId,
          platform: data.platform,
          priority: data.priority || 'normal'
        }
      })

      logger.info('Video processing job created', { jobId: job.id, videoId: data.videoId })
      return job
    } catch (error) {
      logger.error('Failed to create video processing job', { error, data })
      throw error
    }
  }

  /**
   * Get video processing job by ID
   */
  static async getVideoJob(jobId: string) {
    try {
      const job = await prisma.videoProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          user: true,
          videoAnalysis: true,
          videoRecipe: true
        }
      })

      return job
    } catch (error) {
      logger.error('Failed to get video processing job', { error, jobId })
      throw error
    }
  }

  /**
   * Get all video jobs for a user
   */
  static async getUserVideoJobs(userId: string) {
    try {
      const jobs = await prisma.videoProcessingJob.findMany({
        where: { userId },
        include: {
          videoAnalysis: true,
          videoRecipe: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return jobs
    } catch (error) {
      logger.error('Failed to get user video jobs', { error, userId })
      throw error
    }
  }

  /**
   * Update video processing job
   */
  static async updateVideoJob(jobId: string, data: UpdateVideoJobData) {
    try {
      const job = await prisma.videoProcessingJob.update({
        where: { id: jobId },
        data
      })

      logger.info('Video processing job updated', { jobId, updates: data })
      return job
    } catch (error) {
      logger.error('Failed to update video processing job', { error, jobId, data })
      throw error
    }
  }

  /**
   * Create video analysis record
   */
  static async createVideoAnalysis(data: CreateVideoAnalysisData) {
    try {
      const analysis = await prisma.videoAnalysis.create({
        data: {
          jobId: data.jobId,
          videoId: data.videoId,
          analysisType: data.analysisType || 'full',
          analysisConfig: data.analysisConfig || {}
        }
      })

      logger.info('Video analysis record created', { analysisId: analysis.id, jobId: data.jobId })
      return analysis
    } catch (error) {
      logger.error('Failed to create video analysis record', { error, data })
      throw error
    }
  }

  /**
   * Update video analysis
   */
  static async updateVideoAnalysis(analysisId: string, data: UpdateVideoAnalysisData) {
    try {
      const analysis = await prisma.videoAnalysis.update({
        where: { id: analysisId },
        data
      })

      logger.info('Video analysis updated', { analysisId, updates: data })
      return analysis
    } catch (error) {
      logger.error('Failed to update video analysis', { error, analysisId, data })
      throw error
    }
  }

  /**
   * Create video recipe record
   */
  static async createVideoRecipe(data: CreateVideoRecipeData) {
    try {
      const recipe = await prisma.videoRecipe.create({
        data: {
          jobId: data.jobId,
          videoId: data.videoId,
          userId: data.userId,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          cuisine: data.cuisine,
          tags: data.tags,
          instructions: data.instructions,
          ingredients: data.ingredients,
          sourceUrl: data.sourceUrl,
          isPublic: data.isPublic || false,
          isShared: data.isShared || false,
          confidence: data.confidence,
          extractionMethod: data.extractionMethod || 'ai-video-analysis',
          recommendations: data.recommendations || [],
          metadata: data.metadata || {}
        }
      })

      logger.info('Video recipe record created', { recipeId: recipe.id, jobId: data.jobId })
      return recipe
    } catch (error) {
      logger.error('Failed to create video recipe record', { error, data })
      throw error
    }
  }

  /**
   * Get video recipe by ID
   */
  static async getVideoRecipe(recipeId: string) {
    try {
      const recipe = await prisma.videoRecipe.findUnique({
        where: { id: recipeId },
        include: {
          user: true,
          videoJob: true
        }
      })

      return recipe
    } catch (error) {
      logger.error('Failed to get video recipe', { error, recipeId })
      throw error
    }
  }

  /**
   * Get video recipe by job ID
   */
  static async getVideoRecipeByJobId(jobId: string) {
    try {
      const recipe = await prisma.videoRecipe.findUnique({
        where: { jobId },
        include: {
          user: true,
          videoJob: true
        }
      })

      return recipe
    } catch (error) {
      logger.error('Failed to get video recipe by job ID', { error, jobId })
      throw error
    }
  }

  /**
   * Get all video recipes for a user
   */
  static async getUserVideoRecipes(userId: string) {
    try {
      const recipes = await prisma.videoRecipe.findMany({
        where: { userId },
        include: {
          videoJob: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return recipes
    } catch (error) {
      logger.error('Failed to get user video recipes', { error, userId })
      throw error
    }
  }

  /**
   * Create video file record
   */
  static async createVideoFile(data: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    path: string
    platform?: string
    metadata?: Record<string, any>
    userId: string
  }) {
    try {
      const videoFile = await prisma.videoFile.create({
        data: {
          filename: data.filename,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: data.size,
          path: data.path,
          platform: data.platform,
          metadata: data.metadata || {},
          userId: data.userId
        }
      })

      logger.info('Video file record created', { fileId: videoFile.id, filename: data.filename })
      return videoFile
    } catch (error) {
      logger.error('Failed to create video file record', { error, data })
      throw error
    }
  }

  /**
   * Create video import log entry
   */
  static async createVideoImportLog(data: {
    videoId: string
    userId: string
    action: string
    status: string
    details?: Record<string, any>
    error?: string
    processingTime?: number
  }) {
    try {
      const log = await prisma.videoImportLog.create({
        data: {
          videoId: data.videoId,
          userId: data.userId,
          action: data.action,
          status: data.status,
          details: data.details || {},
          error: data.error,
          processingTime: data.processingTime
        }
      })

      logger.info('Video import log created', { logId: log.id, action: data.action, status: data.status })
      return log
    } catch (error) {
      logger.error('Failed to create video import log', { error, data })
      throw error
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    try {
      const [totalJobs, queuedJobs, processingJobs, completedJobs, failedJobs] = await Promise.all([
        prisma.videoProcessingJob.count(),
        prisma.videoProcessingJob.count({ where: { status: 'queued' } }),
        prisma.videoProcessingJob.count({ where: { status: 'processing' } }),
        prisma.videoProcessingJob.count({ where: { status: 'completed' } }),
        prisma.videoProcessingJob.count({ where: { status: 'failed' } })
      ])

      // Calculate average processing time for completed jobs
      const completedJobsData = await prisma.videoProcessingJob.findMany({
        where: { status: 'completed' },
        select: { createdAt: true, completedAt: true }
      })

      const averageProcessingTime = completedJobsData.length > 0
        ? completedJobsData.reduce((total, job) => {
            if (job.completedAt) {
              return total + (job.completedAt.getTime() - job.createdAt.getTime())
            }
            return total
          }, 0) / completedJobsData.length
        : 0

      return {
        totalJobs,
        queuedJobs,
        processingJobs,
        completedJobs,
        failedJobs,
        averageProcessingTime: Math.round(averageProcessingTime)
      }
    } catch (error) {
      logger.error('Failed to get queue statistics', { error })
      throw error
    }
  }

  /**
   * Clean up old completed/failed jobs
   */
  static async cleanupOldJobs(maxAgeHours: number = 24) {
    try {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)

      const deletedJobs = await prisma.videoProcessingJob.deleteMany({
        where: {
          OR: [
            { status: 'completed', createdAt: { lt: cutoffTime } },
            { status: 'failed', createdAt: { lt: cutoffTime } }
          ]
        }
      })

      logger.info('Cleaned up old video processing jobs', {
        deletedCount: deletedJobs.count,
        maxAgeHours
      })

      return deletedJobs.count
    } catch (error) {
      logger.error('Failed to cleanup old jobs', { error })
      throw error
    }
  }

  /**
   * Get video processing job with full details
   */
  static async getVideoJobWithDetails(jobId: string) {
    try {
      const job = await prisma.videoProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          videoAnalysis: true,
          videoRecipe: true
        }
      })

      return job
    } catch (error) {
      logger.error('Failed to get video job with details', { error, jobId })
      throw error
    }
  }

  /**
   * Search video recipes
   */
  static async searchVideoRecipes(query: string, userId?: string) {
    try {
      const where: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ]
      }

      if (userId) {
        where.userId = userId
      }

      const recipes = await prisma.videoRecipe.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          videoJob: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return recipes
    } catch (error) {
      logger.error('Failed to search video recipes', { error, query, userId })
      throw error
    }
  }
}

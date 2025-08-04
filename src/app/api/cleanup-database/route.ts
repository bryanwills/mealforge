import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseCleanupService } from '@/lib/database-cleanup'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      logger.warn('Unauthorized database cleanup attempt: No userId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    const dataPersistence = new DataPersistenceService()
    const dbUser = await dataPersistence.getUserByClerkId(userId)
    if (!dbUser) {
      logger.warn('User not found in database for cleanup', { userId })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    logger.info('Starting database cleanup for user', { userId: dbUser.id })

    // Perform cleanup
    const cleanupResult = await DatabaseCleanupService.cleanupUserData(dbUser.id)

    logger.info('Database cleanup completed', {
      userId: dbUser.id,
      result: cleanupResult
    })

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed successfully',
      result: cleanupResult
    })
  } catch (error) {
    logger.error('Error during database cleanup', { error })
    return NextResponse.json({
      error: 'Failed to cleanup database'
    }, { status: 500 })
  }
}
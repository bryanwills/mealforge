import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { DataPersistenceService } from '@/lib/data-persistence'
import { logger } from '@/lib/logger'

const dataService = new DataPersistenceService()

export async function GET() {
  try {
    const session = await auth()
    const user = await currentUser()

    logger.debug('User sync test started', { session.user.id, hasUser: !!user })

    if (!session.user.id || !user) {
      logger.warn('User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
    const dbUser = await dataService.getUserByClerkId(session.user.id)
    logger.debug('Database user lookup result', {
      clerkUserId: session.user.id,
      dbUserExists: !!dbUser,
      dbUserId: dbUser?.id,
      dbClerkId: dbUser?.clerkId
    })

    // If user doesn't exist, try to create them
    if (!dbUser) {
      logger.info('User not found in database, attempting to sync...')
      try {
        const syncedUser = await dataService.syncUserFromAuth(
          session.user.id,
          user.emailAddresses?.[0]?.emailAddress || '',
          user.firstName || undefined,
          user.lastName || undefined,
          'clerk'
        )

        logger.info('User successfully synced to database', {
          syncedUserId: syncedUser.id,
          syncedClerkId: syncedUser.clerkId,
          email: syncedUser.email
        })

        return NextResponse.json({
          clerkUserId: session.user.id,
          clerkUser: {
            email: user.emailAddresses?.[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName
          },
          dbUser: {
            id: syncedUser.id,
            email: syncedUser.email,
            firstName: syncedUser.firstName,
            lastName: syncedUser.lastName,
            clerkId: syncedUser.clerkId
          },
          existsInDb: true,
          userCreated: true
        })
      } catch (syncError) {
        logger.error('Failed to sync user to database', { error: syncError })
        return NextResponse.json({
          error: 'Failed to sync user to database',
          details: syncError instanceof Error ? syncError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    logger.info('User exists in database', {
      dbUserId: dbUser.id,
      dbClerkId: dbUser.clerkId,
      email: dbUser.email
    })

    return NextResponse.json({
      clerkUserId: session.user.id,
      clerkUser: {
        email: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      },
      dbUser: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        clerkId: dbUser.clerkId
      },
      existsInDb: true,
      userCreated: false
    })
  } catch (error) {
    logger.error('Error testing user sync', { error })
    return NextResponse.json({
      error: 'Failed to test user sync'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
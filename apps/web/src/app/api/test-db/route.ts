import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { DataPersistenceService } from '@/lib/data-persistence'

const dataService = new DataPersistenceService()

export async function GET() {
  try {
    const session = await auth()
    const user = await currentUser()

    if (!session.user.id || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection
    const dbUser = await dataService.getUserByClerkId(session.user.id)

    // If user doesn't exist, try to create them
    if (!dbUser) {
      try {
        const syncedUser = await dataService.syncUserFromAuth(
          session.user.id,
          user.emailAddresses?.[0]?.emailAddress || '',
          user.firstName || undefined,
          user.lastName || undefined,
          'clerk'
        )

        return NextResponse.json({
          message: 'Database connection successful',
          userCreated: true,
          user: {
            id: syncedUser.id,
            email: syncedUser.email,
            clerkId: syncedUser.clerkId
          }
        })
      } catch (syncError) {
        console.error('Failed to sync user:', syncError)
        return NextResponse.json({
          message: 'Database connection successful but user sync failed',
          userCreated: false,
          error: syncError instanceof Error ? syncError.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Database connection successful',
      userExists: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        clerkId: dbUser.clerkId
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

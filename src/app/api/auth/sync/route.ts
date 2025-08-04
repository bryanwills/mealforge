import { NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { authConfig } from '@/lib/auth-config'

const authService = new AuthService(authConfig.createAuthProvider())

export async function POST() {
  try {
    const userInfo = await authService.syncCurrentUser()

    if (!userInfo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        provider: userInfo.provider
      }
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({
      error: 'Failed to sync user'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
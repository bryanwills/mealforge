import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement proper user authentication with better-auth
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Database test route - authentication working (placeholder)',
      status: 'placeholder'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

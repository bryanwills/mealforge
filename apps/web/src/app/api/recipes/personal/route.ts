import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement proper user authentication with better-auth
    // For now, return empty array
    return NextResponse.json({ recipes: [] })
  } catch (error) {
    console.error('Error fetching personal recipes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
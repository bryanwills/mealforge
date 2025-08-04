import { NextResponse } from 'next/server'

export async function POST() {
  // Cancel any ongoing import operations
  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
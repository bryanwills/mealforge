import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const user = await currentUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user in the database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all recipes for this user that don't have externalId set
    const recipesToUpdate = await db.recipe.findMany({
      where: {
        userId: dbUser.id,
        externalId: null
      }
    })

    console.log('Recipes to update:', recipesToUpdate.map(r => ({ id: r.id, sourceUrl: r.sourceUrl })))

    let updatedCount = 0

    // Update each recipe with externalId extracted from sourceUrl
    for (const recipe of recipesToUpdate) {
      if (recipe.sourceUrl) {
        let externalId = null

        // Check if it's a Spoonacular URL (contains recipe ID)
        if (recipe.sourceUrl.includes('spoonacular.com')) {
          // Extract recipe ID from Spoonacular URL
          const match = recipe.sourceUrl.match(/recipes\/(\d+)/)
          if (match) {
            externalId = match[1]
          }
        }
        // Check if it's a blog URL that might have been imported from external source
        else if (recipe.sourceUrl.includes('blogspot.com') || recipe.sourceUrl.includes('wordpress.com')) {
          // For blog URLs, we need to check if we can find a matching external recipe
          // For now, let's extract a hash of the URL as a temporary external ID
          const urlHash = recipe.sourceUrl.split('/').pop()?.split('.')[0] || 'unknown'
          externalId = `blog-${urlHash}`
        }

        if (externalId) {
          await db.recipe.update({
            where: { id: recipe.id },
            data: {
              externalId,
              updatedAt: new Date()
            }
          })

          console.log(`Updated recipe ${recipe.id} with externalId: ${externalId}`)
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} recipes with external IDs`,
      updatedCount
    })

  } catch (error) {
    console.error('Error updating external IDs:', error)
    return NextResponse.json(
      { error: 'Failed to update external IDs' },
      { status: 500 }
    )
  }
}

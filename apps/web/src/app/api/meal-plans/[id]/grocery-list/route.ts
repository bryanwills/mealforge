import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { mealPlanService } from "@/lib/meal-plan-service"
import { DataPersistenceService } from "@/lib/data-persistence"
import { logger } from "@/lib/logger"

const dataService = new DataPersistenceService()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dbUser = await dataService.getUserByClerkId(session.user.id)
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    const groceryListId = await mealPlanService.generateGroceryList(params.id, dbUser.id)

    return NextResponse.json({ 
      success: true,
      groceryListId 
    })
  } catch (error) {
    logger.error('Failed to generate grocery list:', error)
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    )
  }
}
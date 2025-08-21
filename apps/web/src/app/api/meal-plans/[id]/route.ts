import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { mealPlanService } from "@/lib/meal-plan-service"
import { DataPersistenceService } from "@/lib/data-persistence"
import { logger } from "@/lib/logger"

const dataService = new DataPersistenceService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dbUser = await dataService.getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    const mealPlan = await mealPlanService.getMealPlanById(params.id, dbUser.id)

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(mealPlan)
  } catch (error) {
    logger.error('Failed to get meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to get meal plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dbUser = await dataService.getUserByClerkId(userId)
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    await mealPlanService.deleteMealPlan(params.id, dbUser.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal plan' },
      { status: 500 }
    )
  }
}
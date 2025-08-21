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

    const body = await request.json()
    const { date, meals } = body

    if (!date || !meals || !Array.isArray(meals)) {
      return NextResponse.json(
        { error: 'Date and meals array are required' },
        { status: 400 }
      )
    }

    await mealPlanService.addMealsToDay({
      mealPlanId: params.id,
      date: new Date(date),
      meals
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to add meals to meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to add meals to meal plan' },
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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const mealType = searchParams.get('mealType')

    if (!date || !mealType) {
      return NextResponse.json(
        { error: 'Date and mealType are required' },
        { status: 400 }
      )
    }

    await mealPlanService.removeMealFromDay(
      params.id,
      new Date(date),
      mealType
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to remove meal from meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to remove meal from meal plan' },
      { status: 500 }
    )
  }
}
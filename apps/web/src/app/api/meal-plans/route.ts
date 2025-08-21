import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { mealPlanService } from "@/lib/meal-plan-service"
import { DataPersistenceService } from "@/lib/data-persistence"
import { logger } from "@/lib/logger"

const dataService = new DataPersistenceService()

export async function GET() {
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

    const mealPlans = await mealPlanService.getUserMealPlans(dbUser.id)

    return NextResponse.json(mealPlans)
  } catch (error) {
    logger.error('Failed to get meal plans:', error)
    return NextResponse.json(
      { error: 'Failed to get meal plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, startDate, endDate } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      )
    }

    const mealPlan = await mealPlanService.createMealPlan(dbUser.id, {
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })

    return NextResponse.json(mealPlan)
  } catch (error) {
    logger.error('Failed to create meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET() {
  // Temporarily disabled during build to prevent Prisma generation issues
  return NextResponse.json({
    success: true,
    message: "Test route temporarily disabled",
  });

  // Original code commented out for now
  /*
  try {
    // Test database connection by running a simple query
    const result = await db.$queryRaw`SELECT 1 as test`;

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: result,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
  */
}
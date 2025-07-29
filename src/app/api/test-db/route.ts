import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
}
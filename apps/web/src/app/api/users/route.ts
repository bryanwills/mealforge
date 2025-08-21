import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 200 }
      );
    }

    // Create new user
    const user = await db.user.create({
      data: {
        clerkId: session.user.id,
        email: email || "",
        firstName: firstName || "",
        lastName: lastName || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("User creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: unknown;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = (evt as { data: { id: string } }).data;
  const eventType = (evt as { type: string }).type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = (evt as { data: { id: string; email_addresses: unknown[]; first_name: string; last_name: string } }).data;

    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { clerkId: id },
      });

      if (existingUser) {
        console.log("User already exists:", existingUser);
        return NextResponse.json({ message: "User already exists" });
      }

      // Create new user
      const user = await db.user.create({
        data: {
          clerkId: id,
          email: (email_addresses[0] as { email_address: string })?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
        },
      });

      console.log("User created:", user);
      return NextResponse.json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = (evt as { data: { id: string; email_addresses: unknown[]; first_name: string; last_name: string } }).data;

    try {
      const user = await db.user.update({
        where: { clerkId: id },
        data: {
          email: (email_addresses[0] as { email_address: string })?.email_address || "",
          firstName: first_name || "",
          lastName: last_name || "",
        },
      });

      console.log("User updated:", user);
      return NextResponse.json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    const { id } = (evt as { data: { id: string } }).data;

    try {
      await db.user.delete({
        where: { clerkId: id },
      });

      console.log("User deleted:", id);
      return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Webhook processed" });
}
import { auth } from "@/lib/auth-config";

// TODO: Implement proper better-auth route handlers
// For now, create placeholder handlers that allow the app to compile
export async function GET() {
  return new Response('Better Auth GET handler - not implemented yet', { status: 501 });
}

export async function POST() {
  return new Response('Better Auth POST handler - not implemented yet', { status: 501 });
}

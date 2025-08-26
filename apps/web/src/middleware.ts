import { auth } from "@/lib/auth-config";

// TODO: Implement proper better-auth middleware
// For now, just pass through all requests
export default function middleware() {
  // Placeholder middleware - will implement proper auth later
  // This allows the app to run while we figure out better-auth
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
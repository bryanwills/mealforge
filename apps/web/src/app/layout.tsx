import type { Metadata } from "next";
import { BetterAuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSyncProvider } from "@/components/auth-sync-provider";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "MealForge - Your Comprehensive Recipe Management Companion",
  description: "Transform your cooking experience with AI-powered recipe management, meal planning, and intelligent grocery shopping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BetterAuthSessionProvider>
            <AuthSyncProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </AuthSyncProvider>
          </BetterAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

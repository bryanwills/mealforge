"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ClerkClientProviderProps {
  children: ReactNode;
}

export function ClerkClientProvider({ children }: ClerkClientProviderProps) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
  publishableKey: string;
}

export function AppProviders({ children, publishableKey }: AppProvidersProps) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#f97316', // orange-500
          colorText: '#374151', // gray-700
          colorTextSecondary: '#6b7280', // gray-500
          colorBackground: '#ffffff',
          colorInputBackground: '#f9fafb',
          colorInputText: '#111827',
          borderRadius: '0.5rem',
        },
      }}
      localization={{
        locale: 'en-US',
      }}
    >
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

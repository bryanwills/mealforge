"use client"

import { useAuthSync } from '@/hooks/use-auth-sync'

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // This will automatically sync the user when they sign in
  useAuthSync()

  return <>{children}</>
}
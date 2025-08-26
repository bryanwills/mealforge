import { useEffect } from 'react'
// TODO: Implement better-auth session management
export function useAuthSync() {
  // TODO: Replace with better-auth session management
  const isSignedIn = false;
  const userId = null;

  return {
    isSignedIn,
    userId,
  };
}
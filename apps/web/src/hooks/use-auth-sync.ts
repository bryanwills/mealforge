import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export function useAuthSync() {
  const { isSignedIn, userId } = useAuth()

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && userId) {
        try {
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            console.error('Failed to sync user:', await response.text())
          } else {
            console.log('User synced successfully')
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }
    }

    // Sync user when they sign in
    syncUser()
  }, [isSignedIn, userId])

  return { isSignedIn, userId }
}
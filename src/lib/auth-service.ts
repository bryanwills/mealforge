import { auth, currentUser } from '@clerk/nextjs/server'
import { DataPersistenceService } from './data-persistence'

export interface UserInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
  provider: 'clerk' | 'supabase' | 'auth0' | 'custom'
}

export interface AuthProvider {
  getCurrentUser(): Promise<UserInfo | null>
  getUserId(): Promise<string | null>
}

export class ClerkAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const { userId } = await auth()
      const user = await currentUser()

      if (!userId || !user) {
        return null
      }

      return {
        id: userId,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        provider: 'clerk'
      }
    } catch (error) {
      console.error('Error getting Clerk user:', error)
      return null
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const { userId } = await auth()
      return userId
    } catch (error) {
      console.error('Error getting Clerk user ID:', error)
      return null
    }
  }
}

export class AuthService {
  private dataService: DataPersistenceService
  private authProvider: AuthProvider

  constructor(authProvider: AuthProvider) {
    this.dataService = new DataPersistenceService()
    this.authProvider = authProvider
  }

  async syncCurrentUser(): Promise<UserInfo | null> {
    try {
      const userInfo = await this.authProvider.getCurrentUser()

      if (!userInfo) {
        return null
      }

      // Sync user with database
      const syncedUser = await this.dataService.syncUserFromAuth(
        userInfo.id,
        userInfo.email,
        userInfo.firstName,
        userInfo.lastName,
        userInfo.provider
      )

      return {
        id: syncedUser.id,
        email: syncedUser.email,
        firstName: syncedUser.firstName || undefined,
        lastName: syncedUser.lastName || undefined,
        provider: userInfo.provider
      }
    } catch (error) {
      console.error('Error syncing user:', error)
      return null
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    return await this.authProvider.getUserId()
  }

  async isAuthenticated(): Promise<boolean> {
    const userId = await this.getCurrentUserId()
    return userId !== null
  }
}
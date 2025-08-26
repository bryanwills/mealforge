import { auth } from '@/lib/auth-config'
import { DataPersistenceService } from './data-persistence'

export interface UserInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
  provider: 'better-auth' | 'supabase' | 'auth0' | 'custom'
}

export interface AuthProvider {
  getCurrentUser(): Promise<UserInfo | null>
  getUserId(): Promise<string | null>
}

export class BetterAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const session = await auth()
      if (!session) {
        return null
      }

      // TODO: Implement proper better-auth session handling
      // For now, return null since session is null
      return null
    } catch (error) {
      console.error('Error getting BetterAuth user:', error)
      return null
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const session = await auth()
      if (!session) {
        return null
      }

      // TODO: Implement proper better-auth session handling
      // For now, return null since session is null
      return null
    } catch (error) {
      console.error('Error getting BetterAuth user ID:', error)
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
import { auth } from '@/lib/auth-config'
import { DataPersistenceService } from './data-persistence'

export interface UserInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
  provider: 'nextauth' | 'supabase' | 'auth0' | 'custom'
}

export interface AuthProvider {
  getCurrentUser(): Promise<UserInfo | null>
  getUserId(): Promise<string | null>
}

export class NextAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const session = await auth()

      if (!session?.user?.id || !session?.user?.email) {
        return null
      }

      // Split name into first and last name if available
      const nameParts = session.user.name?.split(' ') || []
      const firstName = nameParts[0] || undefined
      const lastName = nameParts.slice(1).join(' ') || undefined

      return {
        id: session.user.id,
        email: session.user.email,
        firstName,
        lastName,
        provider: 'nextauth'
      }
    } catch (error) {
      console.error('Error getting NextAuth user:', error)
      return null
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const session = await auth()
      return session?.user?.id || null
    } catch (error) {
      console.error('Error getting NextAuth user ID:', error)
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
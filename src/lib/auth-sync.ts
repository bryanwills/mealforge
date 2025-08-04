import { prisma } from './prisma'

export interface AuthUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  provider?: string // 'clerk', 'supabase', 'nextauth', etc.
  providerId?: string // The ID from the auth provider
}

export interface UserSyncResult {
  success: boolean
  user?: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }
  error?: string
}

export class AuthSyncService {
  /**
   * Syncs a user from any auth provider to our database
   * This ensures every authenticated user has a corresponding database record
   */
  async syncUser(authUser: AuthUser): Promise<UserSyncResult> {
    try {
      // First, try to find user by email (most reliable across auth providers)
      let user = await prisma.user.findUnique({
        where: { email: authUser.email }
      })

      if (!user) {
        // If no user found by email, try to find by provider ID
        if (authUser.provider && authUser.providerId) {
          user = await prisma.user.findFirst({
            where: {
              clerkId: authUser.providerId // Using clerkId as the provider ID field
            }
          })
        }
      }

      if (user) {
        // Update existing user with latest info from auth provider
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: authUser.email,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            clerkId: authUser.providerId || user.clerkId, // Keep existing if no new provider ID
            updatedAt: new Date()
          }
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: authUser.email,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            clerkId: authUser.providerId || authUser.id, // Use provider ID or fallback to auth user ID
            preferences: {}
          }
        })
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    } catch (error) {
      console.error('Error syncing user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync user'
      }
    }
  }

  /**
   * Gets a user by their auth provider ID
   */
  async getUserByProviderId(providerId: string) {
    return await prisma.user.findFirst({
      where: {
        clerkId: providerId
      }
    })
  }

  /**
   * Gets a user by their email
   */
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * Gets a user by their database ID
   */
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  /**
   * Updates user's last login time (using updatedAt field)
   */
  async updateLastLogin(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })
  }
}
import { PrismaClient, User } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

export class DataPersistenceService {
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    try {
      logger.debug('Looking up user by Clerk ID', { clerkId })
      const user = await prisma.user.findUnique({
        where: { clerkId }
      })
      logger.debug('User lookup result', {
        clerkId,
        found: !!user,
        userId: user?.id
      })
      return user
    } catch (error) {
      logger.error('Error looking up user by Clerk ID', { clerkId, error })
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      logger.debug('Looking up user by email', { email })
      const user = await prisma.user.findUnique({
        where: { email }
      })
      logger.debug('User lookup by email result', {
        email,
        found: !!user,
        userId: user?.id
      })
      return user
    } catch (error) {
      logger.error('Error looking up user by email', { email, error })
      throw error
    }
  }

  // Create or update user from any auth provider
  async syncUserFromAuth(
    authId: string,
    email: string,
    firstName?: string,
    lastName?: string,
    provider: string = 'clerk'
  ) {
    try {
      logger.debug('Starting user sync from auth provider', {
        authId,
        email,
        provider,
        firstName,
        lastName
      })

      // First try to find by auth ID
      let user = await this.getUserByClerkId(authId)
      logger.debug('User lookup by auth ID result', {
        authId,
        found: !!user,
        userId: user?.id
      })

      // If not found by auth ID, try to find by email
      if (!user) {
        logger.debug('User not found by auth ID, trying email lookup')
        user = await this.getUserByEmail(email)
        logger.debug('User lookup by email result', {
          email,
          found: !!user,
          userId: user?.id
        })

        // If found by email, update the auth ID
        if (user) {
          logger.info('User found by email, updating auth ID', {
            userId: user.id,
            oldClerkId: user.clerkId,
            newClerkId: authId
          })
          user = await prisma.user.update({
            where: { id: user.id },
            data: { clerkId: authId }
          })
          logger.info('User auth ID updated successfully', {
            userId: user.id,
            clerkId: user.clerkId
          })
        }
      }

      // Create or update user
      if (user) {
        logger.debug('Updating existing user', {
          userId: user.id,
          email,
          firstName,
          lastName
        })
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email,
            firstName,
            lastName,
            updatedAt: new Date()
          }
        })
        logger.info('User updated successfully', {
          userId: user.id,
          email: user.email,
          clerkId: user.clerkId
        })
      } else {
        logger.debug('Creating new user', {
          authId,
          email,
          firstName,
          lastName,
          provider
        })
        user = await prisma.user.create({
          data: {
            clerkId: authId,
            email,
            firstName,
            lastName,
            preferences: {}
          }
        })
        logger.info('User created successfully', {
          userId: user.id,
          email: user.email,
          clerkId: user.clerkId
        })
      }

      logger.info(`User synced from ${provider}`, {
        userId: user.id,
        email: user.email,
        clerkId: user.clerkId,
        provider
      })
      return user
    } catch (error) {
      logger.error(`Error syncing user from ${provider}`, {
        authId,
        email,
        provider,
        error
      })
      throw error
    }
  }

  // Legacy method for backward compatibility
  async syncUserFromClerk(clerkId: string, email: string, firstName?: string, lastName?: string) {
    return await this.syncUserFromAuth(clerkId, email, firstName, lastName, 'clerk')
  }

  // Backup user data to JSON file
  async backupUserData(userId: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          recipes: {
            include: {
              ingredients: {
                include: {
                  ingredient: true
                },
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          mealPlans: {
            include: {
              items: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          groceryLists: {
            include: {
              items: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const backup = {
        timestamp: new Date().toISOString(),
        user
      }

      // Create backups directory
      const fs = await import('fs')
      const path = await import('path')
      const backupDir = path.default.join(process.cwd(), 'backups', 'users')
      if (!fs.default.existsSync(backupDir)) {
        fs.default.mkdirSync(backupDir, { recursive: true })
      }

            const filename = `user-${userId}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const filepath = path.default.join(backupDir, filename)

      fs.default.writeFileSync(filepath, JSON.stringify(backup, null, 2))

      console.log(`User data backed up: ${filepath}`)
      return filepath
    } catch (error) {
      console.error('Error backing up user data:', error)
      throw error
    }
  }

  // Update user's Clerk ID (for auth migration)
  async updateUserClerkId(userId: string, newClerkId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { clerkId: newClerkId }
    })
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const [recipeCount, mealPlanCount, groceryListCount] = await Promise.all([
      prisma.recipe.count({ where: { userId } }),
      prisma.mealPlan.count({ where: { userId } }),
      prisma.groceryList.count({ where: { userId } })
    ])

    return {
      recipes: recipeCount,
      mealPlans: mealPlanCount,
      groceryLists: groceryListCount
    }
  }

  // Get all user data for analysis
  async getUserData(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recipes: {
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        },
        mealPlans: {
          include: {
            items: true
          }
        },
        groceryLists: {
          include: {
            items: true
          }
        }
      }
    })
  }

  async disconnect() {
    await prisma.$disconnect()
  }
}
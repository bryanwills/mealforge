import { AuthProvider } from './auth-service'
import { ClerkAuthProvider } from './auth-service'
import { SupabaseAuthProvider } from './supabase-auth-provider'

export type AuthProviderType = 'clerk' | 'supabase'

export class AuthConfig {
  private static instance: AuthConfig
  private currentProvider: AuthProviderType = 'clerk'

  private constructor() {}

  static getInstance(): AuthConfig {
    if (!AuthConfig.instance) {
      AuthConfig.instance = new AuthConfig()
    }
    return AuthConfig.instance
  }

  setProvider(provider: AuthProviderType) {
    this.currentProvider = provider
  }

  getProvider(): AuthProviderType {
    return this.currentProvider
  }

  createAuthProvider(): AuthProvider {
    switch (this.currentProvider) {
      case 'supabase':
        return new SupabaseAuthProvider()
      case 'clerk':
      default:
        return new ClerkAuthProvider()
    }
  }
}

// Export a singleton instance
export const authConfig = AuthConfig.getInstance()
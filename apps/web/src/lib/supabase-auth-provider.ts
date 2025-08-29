import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AuthProvider, UserInfo } from './auth-service'

export class SupabaseAuthProvider implements AuthProvider {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return {
        id: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || undefined,
        lastName: user.user_metadata?.last_name || undefined,
        provider: 'supabase'
      }
    } catch (error) {
      console.error('Error getting Supabase user:', error)
      return null
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return user.id
    } catch (error) {
      console.error('Error getting Supabase user ID:', error)
      return null
    }
  }
}
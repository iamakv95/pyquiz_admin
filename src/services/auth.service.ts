import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser | null;
  error: Error | null;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, error: new Error('No user returned from authentication') };
      }

      // Fetch admin user data
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        // User is not an admin or is inactive
        await this.logout();
        return {
          user: null,
          error: new Error('Access denied. You do not have admin privileges.'),
        };
      }

      return { user: adminUser, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * Get current admin user
   */
  async getCurrentAdminUser(): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        return { user: null, error: authError || new Error('No authenticated user') };
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        return { user: null, error: new Error('User is not an active admin') };
      }

      return { user: adminUser, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();

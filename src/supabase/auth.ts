// src/supabase/auth.ts
import { supabase } from './config';
import { activityService } from './activityService';
import { logger } from '../utils/logger';

export const authService = {
  // Login
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Log dell'attività di login
      await activityService.logActivity({
        type: 'login',
        description: `Accesso effettuato da ${email}`,
        user: email,
        entityType: 'user',
        entityId: data.user.id
      });
      
      return data.user;
    } catch (error: any) {
      logger.error("Login error", error);
      throw error;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      // Ottieni l'utente prima del logout
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Log dell'attività di logout
      if (user) {
        await activityService.logActivity({
          type: 'logout',
          description: `Logout effettuato da ${user.email}`,
          user: user.email || '',
          entityType: 'user',
          entityId: user.id
        });
      }
    } catch (error) {
      logger.error("Logout error", error);
      throw error;
    }
  },
  
  // Create account (only for main admin)
  createAccount: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      return data.user;
    } catch (error) {
      logger.error("Create account error", error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      logger.error("Reset password error", error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};

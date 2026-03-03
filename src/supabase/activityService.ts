import { supabase } from './config';
import { RecentActivity } from '../types/supabaseTypes';
import { logger } from '../utils/logger';

export const activityService = {
  // Registra un'attività
  logActivity: async (activity: {
    type: 'create' | 'update' | 'delete' | 'login' | 'logout';
    description: string;
    user?: string;
    entityType?: string;
    entityId?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
          type: activity.type,
          description: activity.description,
          user: activity.user,
          entity_type: activity.entityType,
          entity_id: activity.entityId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error logging activity', error);
      // Non blocchiamo le operazioni principali se il logging fallisce
    }
  },
  
  // Ottieni tutte le attività recenti
  getRecentActivities: async (limit: number = 20): Promise<RecentActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        type: item.type,
        description: item.description,
        timestamp: item.created_at,
        user: item.user,
        entityType: item.entity_type,
        entityId: item.entity_id
      }));
    } catch (error) {
      logger.error('Error fetching activity logs', error);
      return [];
    }
  }
};

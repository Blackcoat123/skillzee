/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured()
  ? createClient(env.supabase.url, env.supabase.anonKey)
  : null;

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          college: string | null;
          phone_number: string | null;
          profile_image: string | null;
          bio: string | null;
          interests: string[] | null;
          role: 'learner' | 'trainer' | 'both';
          points: number;
          total_earnings: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
      };
      skills: {
        Row: {
          id: string;
          trainer_id: string;
          title: string;
          description: string;
          category_id: string | null;
          tags: string[] | null;
          price: number;
          duration: number;
          delivery_mode: 'online' | 'offline' | 'both';
          session_format: 'google-meet' | 'zoom' | 'in-app' | 'offline' | null;
          location: string | null;
          availability: Json | null;
          rating: number;
          total_reviews: number;
          total_bookings: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          skill_id: string;
          learner_id: string;
          trainer_id: string;
          scheduled_date: string;
          duration: number;
          price: number;
          platform_commission: number;
          trainer_payout: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          learner_notes: string | null;
          meeting_link: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          skill_id: string;
          learner_id: string;
          trainer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'booking' | 'message' | 'reminder' | 'payment' | 'review' | 'system';
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          available_balance: number;
          pending_balance: number;
          created_at: string;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          booking_id: string | null;
          type: 'earning' | 'spending' | 'refund' | 'withdrawal' | 'commission';
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          description: string | null;
          created_at: string;
        };
      };
    };
  };
}

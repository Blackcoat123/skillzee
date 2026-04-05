/**
 * API Service Layer
 * Handles all data operations with automatic fallback to mock data
 */

import { env } from '../config/env';
import { supabase } from '../config/supabase';
import * as mockData from '../data/mockData';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

// Types
export interface User {
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
}

export interface Skill {
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
  availability: any;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  is_active: boolean;
  trainer?: User;
}

export interface Booking {
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
  skill?: Skill;
  trainer?: User;
  learner?: User;
}

export interface Review {
  id: string;
  booking_id: string;
  skill_id: string;
  learner_id: string;
  trainer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  learner?: User;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'message' | 'reminder' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  booking_id: string | null;
  type: 'earning' | 'spending' | 'refund' | 'withdrawal' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  booking_id: string;
  learner_id: string;
  trainer_id: string;
  skill_title: string;
  issued_at: string;
  certificate_data?: Record<string, unknown> | null;
}

const normalizeNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeRole = (value: unknown): User['role'] => {
  return value === 'trainer' || value === 'both' ? value : 'learner';
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

const normalizeArrayValues = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const cleaned = value
    .map((item) => normalizeNullableString(item))
    .filter((item): item is string => Boolean(item));

  return cleaned.length > 0 ? [...new Set(cleaned)] : null;
};

const createFriendlyError = (message: string, code?: string, field?: string) => ({
  message,
  code,
  field,
});

const mapSupabaseNetworkError = (error: unknown) => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      user: null,
      error: {
        message:
          'Cannot reach Supabase. Check VITE_SUPABASE_URL in your .env file and make sure the project URL is valid.',
      },
    };
  }

  throw error;
};

const buildProfileFromAuthUser = (
  authUser: SupabaseAuthUser,
  overrides: Partial<User> = {}
): User => ({
  id: authUser.id,
  email: overrides.email || authUser.email || '',
  full_name:
    overrides.full_name ||
    normalizeNullableString(authUser.user_metadata?.full_name) ||
    normalizeNullableString(authUser.user_metadata?.name) ||
    authUser.email?.split('@')[0] ||
    'User',
  college:
    overrides.college !== undefined
      ? overrides.college
      : normalizeNullableString(authUser.user_metadata?.college),
  phone_number:
    overrides.phone_number !== undefined
      ? overrides.phone_number
      : normalizeNullableString(authUser.user_metadata?.phone_number),
  profile_image:
    overrides.profile_image !== undefined
      ? overrides.profile_image
      : normalizeNullableString(authUser.user_metadata?.profile_image) ||
        normalizeNullableString(authUser.user_metadata?.avatar_url),
  bio:
    overrides.bio !== undefined ? overrides.bio : normalizeNullableString(authUser.user_metadata?.bio),
  interests:
    overrides.interests !== undefined
      ? overrides.interests
      : Array.isArray(authUser.user_metadata?.interests)
        ? authUser.user_metadata.interests
        : null,
  role: overrides.role || normalizeRole(authUser.user_metadata?.role),
  points: overrides.points ?? 0,
  total_earnings: overrides.total_earnings ?? 0,
  total_spent: overrides.total_spent ?? 0,
});

const getProfileById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

const getProfileByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile by email:', error);
    return null;
  }

  return data;
};

const scoreSkillRecommendation = (
  skill: Skill,
  user: User | null,
  bookings: Booking[]
) => {
  const searchableText = `${skill.title} ${skill.description} ${(skill.tags || []).join(' ')}`.toLowerCase();
  const bookedCategoryIds = new Set(
    bookings
      .map((booking) => booking.skill?.category_id)
      .filter((value): value is string => Boolean(value))
  );
  const bookedSkillIds = new Set(bookings.map((booking) => booking.skill_id));

  let score = skill.rating * 10 + skill.total_bookings;

  if (bookedSkillIds.has(skill.id)) {
    score -= 1000;
  }

  if (bookedCategoryIds.has(skill.category_id || '')) {
    score += 20;
  }

  for (const interest of user?.interests || []) {
    if (searchableText.includes(interest.toLowerCase())) {
      score += 30;
    }
  }

  return score;
};

const buildVirtualCertificate = (booking: Booking): Certificate => ({
  id: `certificate-${booking.id}`,
  booking_id: booking.id,
  learner_id: booking.learner_id,
  trainer_id: booking.trainer_id,
  skill_title: booking.skill?.title || 'Completed Class',
  issued_at: booking.scheduled_date,
  certificate_data: {
    learnerName: booking.learner?.full_name || 'Learner',
    trainerName: booking.trainer?.full_name || 'Trainer',
    completedAt: booking.scheduled_date,
  },
});

const ensureProfile = async (
  authUser: SupabaseAuthUser,
  profileSeed: Partial<User> = {}
): Promise<User> => {
  const existingProfile = await getProfileById(authUser.id);
  if (existingProfile) {
    return existingProfile;
  }

  const fallbackProfile = buildProfileFromAuthUser(authUser, profileSeed);
  const { data, error } = await supabase!
    .from('profiles')
    .insert(fallbackProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return fallbackProfile;
  }

  return data;
};

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  async signUp(email: string, password: string, userData: Partial<User>) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = normalizeNullableString(userData.full_name);

    if (!normalizedFullName || !normalizedEmail || !password) {
      return {
        user: null,
        error: createFriendlyError(
          'Please fill in your full name, email address, and password.',
          'MISSING_FIELDS'
        ),
      };
    }

    if (!isValidEmail(normalizedEmail)) {
      return {
        user: null,
        error: createFriendlyError('Please enter a valid email address.', 'INVALID_EMAIL', 'email'),
      };
    }

    if (password.length < 6) {
      return {
        user: null,
        error: createFriendlyError(
          'Password must be at least 6 characters long.',
          'WEAK_PASSWORD',
          'password'
        ),
      };
    }

    if (env.hardcode) {
      // Mock signup
      return {
        user: {
          ...mockData.getCurrentMockUser(),
          ...userData,
          email: normalizedEmail,
          full_name: normalizedFullName,
          interests: normalizeArrayValues(userData.interests),
        },
        error: null,
      };
    }

    const existingProfile = await getProfileByEmail(normalizedEmail);
    if (existingProfile) {
      return {
        user: null,
        error: createFriendlyError(
          'An account with this email already exists. Please sign in instead.',
          'EMAIL_EXISTS',
          'email'
        ),
      };
    }

    const profileSeed: Partial<User> = {
      email: normalizedEmail,
      full_name: normalizedFullName,
      college: normalizeNullableString(userData.college),
      phone_number: normalizeNullableString(userData.phone_number),
      profile_image: normalizeNullableString(userData.profile_image),
      bio: normalizeNullableString(userData.bio),
      interests: normalizeArrayValues(userData.interests),
      role: normalizeRole(userData.role),
      points: userData.points ?? 0,
      total_earnings: userData.total_earnings ?? 0,
      total_spent: userData.total_spent ?? 0,
    };

    let data;
    let error;
    try {
      ({ data, error } = await supabase!.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: profileSeed,
        },
      }));
    } catch (requestError) {
      return mapSupabaseNetworkError(requestError);
    }

    if (error || !data.user) {
      return {
        user: null,
        error: createFriendlyError(
          error?.message || 'Account creation failed. Please try again.',
          (error as any)?.code
        ),
      };
    }

    const noIdentities =
      Array.isArray((data.user as any).identities) &&
      (data.user as any).identities.length === 0;
    if (noIdentities) {
      return {
        user: null,
        error: createFriendlyError(
          'An account with this email already exists. Please sign in instead.',
          'EMAIL_EXISTS',
          'email'
        ),
      };
    }

    const user = data.session
      ? await ensureProfile(data.user, profileSeed)
      : buildProfileFromAuthUser(data.user, profileSeed);

    return { user, error: null, requiresEmailConfirmation: !data.session };
  },

  async signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return {
        user: null,
        error: createFriendlyError(
          'Please enter both your email address and password.',
          'MISSING_FIELDS'
        ),
      };
    }

    if (!isValidEmail(normalizedEmail)) {
      return {
        user: null,
        error: createFriendlyError('Please enter a valid email address.', 'INVALID_EMAIL', 'email'),
      };
    }

    if (env.hardcode) {
      // Mock login
      return {
        user: mockData.getCurrentMockUser(),
        error: null,
      };
    }

    const existingProfile = await getProfileByEmail(normalizedEmail);

    let data;
    let error;
    try {
      ({ data, error } = await supabase!.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      }));
    } catch (requestError) {
      return mapSupabaseNetworkError(requestError);
    }

    if (error || !data.user) {
      if (!existingProfile) {
        return {
          user: null,
          error: createFriendlyError(
            'No account was found with this email address. Please create an account first.',
            'USER_NOT_FOUND',
            'email'
          ),
        };
      }

      return {
        user: null,
        error: createFriendlyError(
          'Incorrect password. Please try again.',
          'INVALID_PASSWORD',
          'password'
        ),
      };
    }

    const user = await ensureProfile(data.user);
    return { user, error: null };
  },

  async signOut() {
    if (env.hardcode) {
      return { error: null };
    }

    return await supabase!.auth.signOut();
  },

  async getCurrentUser() {
    if (env.hardcode) {
      return mockData.getCurrentMockUser();
    }

    const { data, error } = await supabase!.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    return await ensureProfile(data.user);
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    if (env.hardcode) {
      return {
        data: {
          ...mockData.getCurrentMockUser(),
          ...updates,
          college: updates.college !== undefined ? normalizeNullableString(updates.college) : undefined,
          phone_number:
            updates.phone_number !== undefined ? normalizeNullableString(updates.phone_number) : undefined,
          profile_image:
            updates.profile_image !== undefined ? normalizeNullableString(updates.profile_image) : undefined,
          bio: updates.bio !== undefined ? normalizeNullableString(updates.bio) : undefined,
          interests: updates.interests !== undefined ? normalizeArrayValues(updates.interests) : undefined,
        },
        error: null,
      };
    }

    const { data, error } = await supabase!
      .from('profiles')
      .update({
        ...updates,
        college: updates.college !== undefined ? normalizeNullableString(updates.college) : undefined,
        phone_number:
          updates.phone_number !== undefined ? normalizeNullableString(updates.phone_number) : undefined,
        profile_image:
          updates.profile_image !== undefined ? normalizeNullableString(updates.profile_image) : undefined,
        bio: updates.bio !== undefined ? normalizeNullableString(updates.bio) : undefined,
        interests: updates.interests !== undefined ? normalizeArrayValues(updates.interests) : undefined,
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },
};

// ============================================
// SKILL SERVICES
// ============================================

export const skillService = {
  async getSkills(filters?: { category?: string; search?: string; mode?: string }) {
    if (env.hardcode) {
      let skills = mockData.mockSkills.map(skill => ({
        ...skill,
        trainer: mockData.mockUsers.find(u => u.id === skill.trainer_id),
      }));

      if (filters?.category) {
        skills = skills.filter(s => s.category_id === filters.category);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        skills = skills.filter(s =>
          s.title.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.tags?.some(t => t.toLowerCase().includes(search))
        );
      }
      if (filters?.mode) {
        skills = skills.filter(s => s.delivery_mode === filters.mode || s.delivery_mode === 'both');
      }

      return skills;
    }

    let query = supabase!
      .from('skills')
      .select(`
        *,
        trainer:profiles!trainer_id(*)
      `)
      .eq('is_active', true);

    if (filters?.category) query = query.eq('category_id', filters.category);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    if (filters?.mode) query = query.or(`delivery_mode.eq.${filters.mode},delivery_mode.eq.both`);

    const { data, error } = await query;
    return data || [];
  },

  async getTrendingSkills() {
    if (env.hardcode) {
      return mockData.mockSkills
        .map(skill => ({
          ...skill,
          trainer: mockData.mockUsers.find(u => u.id === skill.trainer_id),
        }))
        .sort((a, b) => b.total_bookings - a.total_bookings)
        .slice(0, 6);
    }

    const { data } = await supabase!
      .from('skills')
      .select(`
        *,
        trainer:profiles!trainer_id(*)
      `)
      .eq('is_active', true)
      .order('total_bookings', { ascending: false })
      .limit(6);

    return data || [];
  },

  async getRecommendedSkills(userId: string) {
    if (env.hardcode) {
      const bookings = await bookingService.getBookings(userId);
      const currentUser = mockData.getCurrentMockUser();

      return mockData.mockSkills
        .map(skill => ({
          ...skill,
          trainer: mockData.mockUsers.find(u => u.id === skill.trainer_id),
        }))
        .sort(
          (a, b) =>
            scoreSkillRecommendation(b, currentUser || null, bookings) -
            scoreSkillRecommendation(a, currentUser || null, bookings)
        )
        .slice(0, 6);
    }

    const [currentUser, bookings, skillsResult] = await Promise.all([
      getProfileById(userId),
      bookingService.getBookings(userId),
      supabase!
        .from('skills')
        .select(`
          *,
          trainer:profiles!trainer_id(*)
        `)
        .eq('is_active', true),
    ]);

    return (skillsResult.data || [])
      .sort(
        (a, b) =>
          scoreSkillRecommendation(b, currentUser, bookings) -
          scoreSkillRecommendation(a, currentUser, bookings)
      )
      .slice(0, 6);
  },

  async getTrainerSkills(trainerId: string) {
    if (env.hardcode) {
      return mockData.mockSkills
        .filter((skill) => skill.trainer_id === trainerId)
        .map((skill) => ({
          ...skill,
          trainer: mockData.mockUsers.find((user) => user.id === skill.trainer_id),
        }));
    }

    const { data } = await supabase!
      .from('skills')
      .select(`
        *,
        trainer:profiles!trainer_id(*)
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    return data || [];
  },

  async getLeaderboard() {
    if (env.hardcode) {
      return mockData.mockUsers
        .filter(u => u.role === 'trainer' || u.role === 'both')
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
    }

    const { data } = await supabase!
      .from('profiles')
      .select('*')
      .in('role', ['trainer', 'both'])
      .order('points', { ascending: false })
      .limit(5);

    return data || [];
  },

  async getSkillById(skillId: string) {
    if (env.hardcode) {
      return mockData.getSkillWithTrainer(skillId);
    }

    const { data } = await supabase!
      .from('skills')
      .select(`
        *,
        trainer:profiles!trainer_id(*)
      `)
      .eq('id', skillId)
      .single();

    return data;
  },

  async createSkill(skillData: Partial<Skill>) {
    if (env.hardcode) {
      const newSkill = {
        id: `skill-${Date.now()}`,
        ...skillData,
        rating: 0,
        total_reviews: 0,
        total_bookings: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: newSkill, error: null };
    }

    const { data, error } = await supabase!
      .from('skills')
      .insert(skillData)
      .select()
      .single();

    return { data, error };
  },

  async favoriteSkill(userId: string, skillId: string) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('favorites')
      .insert({ user_id: userId, skill_id: skillId });

    return { error };
  },

  async unfavoriteSkill(userId: string, skillId: string) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('favorites')
      .delete()
      .match({ user_id: userId, skill_id: skillId });

    return { error };
  },
};

// ============================================
// BOOKING SERVICES
// ============================================

export const bookingService = {
  async createBooking(bookingData: {
    skill_id: string;
    learner_id: string;
    trainer_id: string;
    scheduled_date: string;
    duration: number;
    price: number;
    learner_notes?: string;
  }) {
    const platformCommission = (bookingData.price * env.platformCommission) / 100;
    const trainerPayout = bookingData.price - platformCommission;
    const learnerNotes = normalizeNullableString(bookingData.learner_notes) || null;

    if (env.hardcode) {
      const newBooking = {
        id: `booking-${Date.now()}`,
        ...bookingData,
        learner_notes: learnerNotes,
        platform_commission: platformCommission,
        trainer_payout: trainerPayout,
        status: 'pending' as const,
        meeting_link: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: newBooking, error: null };
    }

    const { data, error } = await supabase!
      .from('bookings')
      .insert({
        ...bookingData,
        learner_notes: learnerNotes,
        platform_commission: platformCommission,
        trainer_payout: trainerPayout,
      })
      .select(`
        *,
        skill:skills(*),
        trainer:profiles!trainer_id(*),
        learner:profiles!learner_id(*)
      `)
      .single();

    if (!error && data) {
      await Promise.all([
        notificationService.createNotification({
          user_id: bookingData.trainer_id,
          type: 'booking',
          title: 'Someone joined your class',
          message: `${data.learner?.full_name || 'A learner'} applied for ${data.skill?.title || 'your class'}.`,
          link: '/dashboard',
        }),
        notificationService.createNotification({
          user_id: bookingData.learner_id,
          type: 'booking',
          title: 'Class booking sent',
          message: `Your request for ${data.skill?.title || 'this class'} has been sent successfully.`,
          link: '/dashboard',
        }),
      ]);
    }

    return { data, error };
  },

  async getBookings(userId: string) {
    if (env.hardcode) {
      return mockData.mockBookings.map(booking => ({
        ...booking,
        skill: mockData.mockSkills.find(s => s.id === booking.skill_id),
        trainer: mockData.mockUsers.find(u => u.id === booking.trainer_id),
        learner: mockData.mockUsers.find(u => u.id === booking.learner_id),
      }));
    }

    const { data } = await supabase!
      .from('bookings')
      .select(`
        *,
        skill:skills(*),
        trainer:profiles!trainer_id(*),
        learner:profiles!learner_id(*)
      `)
      .or(`learner_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('scheduled_date', { ascending: false });

    return data || [];
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    return { error };
  },

  async addReview(reviewData: {
    booking_id: string;
    skill_id: string;
    learner_id: string;
    trainer_id: string;
    rating: number;
    comment?: string;
  }) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('reviews')
      .insert({
        ...reviewData,
        comment: normalizeNullableString(reviewData.comment) || null,
      });

    if (!error) {
      await notificationService.createNotification({
        user_id: reviewData.trainer_id,
        type: 'review',
        title: 'New review received',
        message: 'A learner shared feedback on one of your completed classes.',
        link: '/dashboard',
      });
    }

    return { error };
  },

  async getReviewsByLearner(learnerId: string) {
    if (env.hardcode) {
      return mockData.mockReviews
        .filter((review) => review.learner_id === learnerId)
        .map((review) => ({
          ...review,
          learner: mockData.mockUsers.find((user) => user.id === review.learner_id),
        }));
    }

    const { data } = await supabase!
      .from('reviews')
      .select(`
        *,
        learner:profiles!learner_id(*)
      `)
      .eq('learner_id', learnerId)
      .order('created_at', { ascending: false });

    return data || [];
  },
};

// ============================================
// CHAT SERVICES
// ============================================

export const chatService = {
  async getConversations(userId: string) {
    if (env.hardcode) {
      const conversations = mockData.mockBookings
        .filter(b => b.learner_id === userId || b.trainer_id === userId)
        .map(booking => {
          const messages = mockData.mockMessages.filter(m => m.booking_id === booking.id);
          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(m => !m.is_read && m.receiver_id === userId).length;
          const otherUser = mockData.mockUsers.find(
            u => u.id === (booking.learner_id === userId ? booking.trainer_id : booking.learner_id)
          );

          return {
            booking_id: booking.id,
            other_user: otherUser,
            skill: mockData.mockSkills.find(s => s.id === booking.skill_id),
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        });

      return conversations;
    }

    const { data, error } = await supabase!
      .from('bookings')
      .select(`
        id,
        learner_id,
        trainer_id,
        scheduled_date,
        skill:skills(*),
        learner:profiles!learner_id(*),
        trainer:profiles!trainer_id(*),
        messages(id, booking_id, sender_id, receiver_id, content, is_read, created_at)
      `)
      .or(`learner_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return [];
    }

    return (data || []).map((booking: any) => {
      const messages = [...(booking.messages || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter(
        (message) => !message.is_read && message.receiver_id === userId
      ).length;
      const otherUser = booking.learner_id === userId ? booking.trainer : booking.learner;

      return {
        booking_id: booking.id,
        other_user: otherUser,
        skill: booking.skill,
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    });
  },

  async getMessages(bookingId: string) {
    if (env.hardcode) {
      return mockData.mockMessages.filter(m => m.booking_id === bookingId);
    }

    const { data } = await supabase!
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    return data || [];
  },

  async sendMessage(messageData: {
    booking_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
  }) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('messages')
      .insert({
        ...messageData,
        content: normalizeNullableString(messageData.content) || '',
      });

    if (!error) {
      await notificationService.createNotification({
        user_id: messageData.receiver_id,
        type: 'message',
        title: 'New message',
        message: 'You have a new chat message waiting.',
        link: `/chat?booking=${messageData.booking_id}`,
      });
    }

    return { error };
  },

  async markAsRead(messageId: string) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    return { error };
  },
};

// ============================================
// NOTIFICATION SERVICES
// ============================================

export const notificationService = {
  async getNotifications(userId: string) {
    if (env.hardcode) {
      return mockData.mockNotifications;
    }

    const { data } = await supabase!
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return data || [];
  },

  async createNotification(payload: {
    user_id: string;
    type: Notification['type'];
    title: string;
    message: string;
    link?: string | null;
  }) {
    if (env.hardcode) {
      return {
        data: {
          id: `notif-${Date.now()}`,
          user_id: payload.user_id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          link: payload.link || null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabase!
      .from('notifications')
      .insert({
        ...payload,
        link: payload.link || null,
      })
      .select()
      .single();

    return { data, error };
  },

  async markAsRead(notificationId: string) {
    if (env.hardcode) {
      return { error: null };
    }

    const { error } = await supabase!
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { error };
  },
};

// ============================================
// WALLET & PAYMENT SERVICES
// ============================================

export const walletService = {
  async getWallet(userId: string) {
    if (env.hardcode) {
      return mockData.mockWallet;
    }

    const { data } = await supabase!
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  },

  async getTransactions(userId: string) {
    if (env.hardcode) {
      return mockData.mockTransactions;
    }

    const { data } = await supabase!
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return data || [];
  },
};

// ============================================
// CATEGORY SERVICES
// ============================================

export const categoryService = {
  async getCategories() {
    if (env.hardcode) {
      return mockData.mockCategories;
    }

    const { data } = await supabase!
      .from('categories')
      .select('*')
      .order('name');

    return data || [];
  },
};

// ============================================
// CERTIFICATE SERVICES
// ============================================

export const certificateService = {
  async getCertificatesForLearner(userId: string) {
    if (env.hardcode) {
      return mockData.mockBookings
        .filter((booking) => booking.learner_id === userId && booking.status === 'completed')
        .map((booking) => {
          const skill = mockData.mockSkills.find((item) => item.id === booking.skill_id);
          const learner = mockData.mockUsers.find((item) => item.id === booking.learner_id);
          const trainer = mockData.mockUsers.find((item) => item.id === booking.trainer_id);
          return buildVirtualCertificate({
            ...booking,
            skill,
            learner,
            trainer,
          });
        });
    }

    const [{ data: certificates }, { data: completedBookings }] = await Promise.all([
      supabase!
        .from('certificates')
        .select('*')
        .eq('learner_id', userId),
      supabase!
        .from('bookings')
        .select(`
          *,
          skill:skills(*),
          trainer:profiles!trainer_id(*),
          learner:profiles!learner_id(*)
        `)
        .eq('learner_id', userId)
        .eq('status', 'completed'),
    ]);

    const existingCertificates = (certificates || []) as Certificate[];
    const generatedCertificates = (completedBookings || [])
      .filter(
        (booking) => !existingCertificates.some((certificate) => certificate.booking_id === booking.id)
      )
      .map((booking) => buildVirtualCertificate(booking as Booking));

    return [...existingCertificates, ...generatedCertificates];
  },
};

// ============================================
// ADMIN SERVICES
// ============================================

export const adminService = {
  async getOverview() {
    if (env.hardcode) {
      return {
        total_users: mockData.mockUsers.length,
        total_bookings: mockData.mockBookings.length,
        gross_revenue: mockData.mockTransactions
          .filter(t => t.type === 'spending')
          .reduce((sum, t) => sum + t.amount, 0),
        platform_revenue: mockData.mockBookings.reduce((sum, b) => sum + b.platform_commission, 0),
        top_skills: mockData.mockSkills
          .sort((a, b) => b.total_bookings - a.total_bookings)
          .slice(0, 5)
          .map(s => ({
            title: s.title,
            bookings: s.total_bookings,
            revenue: s.price * s.total_bookings,
        })),
      };
    }

    const [{ data: overviewData, error: overviewError }, { data: topSkillsData, error: topSkillsError }] =
      await Promise.all([
        supabase!.rpc('get_admin_overview').single(),
        supabase!.rpc('get_top_skills_admin', { limit_count: 5 }),
      ]);

    if (overviewError) {
      console.error('Error loading admin overview:', overviewError);
    }

    if (topSkillsError) {
      console.error('Error loading top skills:', topSkillsError);
    }

    return {
      total_users: Number((overviewData as any)?.total_users || 0),
      total_bookings: Number((overviewData as any)?.total_bookings || 0),
      gross_revenue: Number((overviewData as any)?.gross_revenue || 0),
      platform_revenue: Number((overviewData as any)?.platform_revenue || 0),
      top_skills: (topSkillsData || []).map((skill: any) => ({
        ...skill,
        bookings: Number(skill.bookings || 0),
        revenue: Number(skill.revenue || 0),
      })),
    };
  },
};

// Get reviews for a skill
export const getReviewsForSkill = async (skillId: string): Promise<Review[]> => {
  if (env.hardcode) {
    return mockData.mockReviews
      .filter(r => r.skill_id === skillId)
      .map(review => ({
        ...review,
        learner: mockData.mockUsers.find(u => u.id === review.learner_id),
      }));
  }

  const { data } = await supabase!
    .from('reviews')
    .select(`
      *,
      learner:profiles!learner_id(*)
    `)
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false });

  return data || [];
};

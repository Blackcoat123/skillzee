-- Skillzee Database Schema
-- Complete schema for peer-to-peer student skill learning marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  college TEXT,
  phone_number TEXT,
  profile_image TEXT,
  bio TEXT,
  interests TEXT[], -- Array of interest tags
  role TEXT NOT NULL CHECK (role IN ('learner', 'trainer', 'both')) DEFAULT 'learner',
  points INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BADGES SYSTEM
-- ============================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  criteria TEXT, -- Description of how to earn
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- SKILLS & CATEGORIES
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[], -- Array of skill tags
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  duration INTEGER NOT NULL, -- Duration in minutes
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('online', 'offline', 'both')),
  session_format TEXT CHECK (session_format IN ('google-meet', 'zoom', 'in-app', 'offline')),
  location TEXT, -- For offline sessions
  availability JSONB, -- Flexible availability data
  rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  trainer_payout DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  learner_notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================
-- FAVORITES
-- ============================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- ============================================
-- CHAT & MESSAGING
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'reminder', 'payment', 'review', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Optional link to relevant page
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WALLET & TRANSACTIONS
-- ============================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  available_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (available_balance >= 0),
  pending_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (pending_balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'spending', 'refund', 'withdrawal', 'commission')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CERTIFICATES
-- ============================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  learner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_title TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_data JSONB -- Stores certificate details
);

-- ============================================
-- NOTIFICATION SUBSCRIPTIONS
-- ============================================

CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_skills_trainer ON skills(trainer_id);
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_skills_active ON skills(is_active);
CREATE INDEX idx_bookings_learner ON bookings(learner_id);
CREATE INDEX idx_bookings_trainer ON bookings(trainer_id);
CREATE INDEX idx_bookings_skill ON bookings(skill_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_skill ON reviews(skill_id);
CREATE INDEX idx_reviews_trainer ON reviews(trainer_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update skill rating when a review is added
CREATE OR REPLACE FUNCTION update_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE skill_id = NEW.skill_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE skill_id = NEW.skill_id)
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_rating_trigger AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_skill_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Skills policies
CREATE POLICY "Skills are viewable by everyone" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Trainers can create skills" ON skills
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own skills" ON skills
  FOR UPDATE USING (auth.uid() = trainer_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = trainer_id);

CREATE POLICY "Learners can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = learner_id OR auth.uid() = trainer_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Learners can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = learner_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = learner_id);

-- ============================================
-- SEED DATA - Sample Categories and Badges
-- ============================================

INSERT INTO categories (name, description, icon) VALUES
  ('Programming', 'Coding, software development, and technical skills', 'Code'),
  ('Design', 'UI/UX, graphic design, and creative skills', 'Palette'),
  ('Data Analytics', 'Data analysis, visualization, and statistics', 'BarChart'),
  ('Communication', 'Public speaking, presentation, and writing skills', 'MessageSquare'),
  ('Interview Prep', 'Career guidance and interview preparation', 'Briefcase'),
  ('Portfolio Building', 'Building professional portfolios and projects', 'FolderOpen'),
  ('Marketing', 'Digital marketing, SEO, and social media', 'TrendingUp'),
  ('Languages', 'Foreign language learning and practice', 'Globe'),
  ('Finance', 'Financial literacy and investment basics', 'DollarSign'),
  ('Photography', 'Photography techniques and editing', 'Camera');

INSERT INTO badges (name, description, icon, criteria) VALUES
  ('Rising Star', 'Earned first 5-star review', 'Star', 'Receive your first 5-star review'),
  ('Session Master', 'Completed 10 sessions', 'Award', 'Complete 10 training sessions'),
  ('Top Rated', 'Maintained 4.8+ rating with 20+ reviews', 'Medal', 'Achieve 4.8+ average rating with at least 20 reviews'),
  ('Early Adopter', 'One of the first 100 users', 'Zap', 'Be among the first 100 platform users'),
  ('Knowledge Sharer', 'Created 5 different skills', 'BookOpen', 'Create and publish 5 different skill listings'),
  ('Dedicated Learner', 'Completed 15 learning sessions', 'GraduationCap', 'Complete 15 learning sessions'),
  ('Quick Responder', 'Average response time under 2 hours', 'Clock', 'Maintain average response time under 2 hours'),
  ('Revenue Champion', 'Earned ₹10,000+ in total', 'Trophy', 'Earn total revenue of ₹10,000 or more');

-- ============================================
-- SAMPLE TRAINERS AND SKILLS
-- ============================================

-- Note: In production, user IDs will come from Supabase Auth
-- These are example UUIDs - replace with actual auth user IDs

-- Sample trainer profiles (these would normally be created via auth signup)
-- INSERT INTO profiles (id, email, full_name, college, phone_number, bio, role, points) VALUES
-- ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'priya.sharma@example.com', 'Priya Sharma', 'IIT Delhi', '+91-9876543210', 'Full-stack developer with 3 years of experience. Passionate about teaching React and Node.js.', 'trainer', 250),
-- ('b1ffcd99-ad1c-5fg9-cc7e-7cc0ce491b22', 'rahul.verma@example.com', 'Rahul Verma', 'BITS Pilani', '+91-9876543211', 'UI/UX designer specializing in Figma and user research. Love helping students build portfolios.', 'trainer', 180),
-- ('c2ggde00-be2d-6gh0-dd8f-8dd1df502c33', 'ananya.singh@example.com', 'Ananya Singh', 'NIT Trichy', '+91-9876543212', 'Data analyst working with Python, SQL, and Tableau. Enjoy breaking down complex concepts.', 'trainer', 320);

-- Sample skills (uncomment and modify with actual trainer IDs after auth setup)
-- INSERT INTO skills (trainer_id, title, description, category_id, tags, price, duration, delivery_mode, session_format, rating, total_reviews, total_bookings) VALUES
-- (
--   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
--   'React Fundamentals for Beginners',
--   'Learn React from scratch with hands-on projects. Perfect for students starting their web development journey.',
--   (SELECT id FROM categories WHERE name = 'Programming'),
--   ARRAY['react', 'javascript', 'web-development'],
--   299.00,
--   90,
--   'online',
--   'google-meet',
--   4.8,
--   15,
--   28
-- );

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to create wallet when profile is created
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_trigger AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- Function to create a profile from Supabase Auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  interest_list TEXT[];
BEGIN
  IF jsonb_typeof(NEW.raw_user_meta_data->'interests') = 'array' THEN
    SELECT array_agg(value)
    INTO interest_list
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'interests') AS value;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    college,
    phone_number,
    profile_image,
    bio,
    interests,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'college', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'profile_image', NEW.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(NEW.raw_user_meta_data->>'bio', ''),
    interest_list,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('learner', 'trainer', 'both')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'learner'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  college,
  phone_number,
  profile_image,
  bio,
  interests,
  role
)
SELECT
  users.id,
  users.email,
  COALESCE(NULLIF(users.raw_user_meta_data->>'full_name', ''), split_part(users.email, '@', 1)),
  NULLIF(users.raw_user_meta_data->>'college', ''),
  NULLIF(users.raw_user_meta_data->>'phone_number', ''),
  NULLIF(COALESCE(users.raw_user_meta_data->>'profile_image', users.raw_user_meta_data->>'avatar_url'), ''),
  NULLIF(users.raw_user_meta_data->>'bio', ''),
  CASE
    WHEN jsonb_typeof(users.raw_user_meta_data->'interests') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(users.raw_user_meta_data->'interests'))
    ELSE NULL
  END,
  CASE
    WHEN users.raw_user_meta_data->>'role' IN ('learner', 'trainer', 'both')
      THEN users.raw_user_meta_data->>'role'
    ELSE 'learner'
  END
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

-- Function to increment skill bookings
CREATE OR REPLACE FUNCTION increment_skill_bookings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills
  SET total_bookings = total_bookings + 1
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_bookings_trigger AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION increment_skill_bookings();

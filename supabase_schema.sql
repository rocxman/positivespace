-- =============================================
-- PositiveSpace Database Schema for Supabase
-- Run this in SQL Editor: https://supabase.com/dashboard
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium', 'enterprise')),
    credits INTEGER DEFAULT 50,
    credits_reset_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =============================================
-- REFRESH TOKENS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- =============================================
-- SONGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Song',
    prompt TEXT,
    lyrics TEXT,
    genre TEXT,
    mood TEXT,
    tempo INTEGER,
    duration INTEGER,
    audio_url TEXT,
    stems_url JSONB,
    cover_url TEXT,
    model_used TEXT,
    is_public BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    license_type TEXT DEFAULT 'personal' CHECK (license_type IN ('personal', 'commercial')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'done', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);

-- =============================================
-- GENERATION JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    celery_task_id TEXT,
    model TEXT DEFAULT 'yue' CHECK (model IN ('yue', 'musicgen', 'ace-step')),
    credits_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    gpu_type TEXT,
    error_message TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);

-- =============================================
-- CREDIT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deduction', 'purchase', 'refund', 'reset', 'daily_reset', 'monthly_reset')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- =============================================
-- LIKES TABLE (for social features)
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_song_id ON likes(song_id);

-- =============================================
-- FOLLOWS TABLE (for social features)
-- =============================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR USERS
-- =============================================
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- RLS POLICIES FOR SONGS
-- =============================================
CREATE POLICY "Anyone can view public songs" ON songs
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create own songs" ON songs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own songs" ON songs
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own songs" ON songs
    FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR GENERATION JOBS
-- =============================================
CREATE POLICY "Users can view own jobs" ON generation_jobs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own jobs" ON generation_jobs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR CREDIT TRANSACTIONS
-- =============================================
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR LIKES
-- =============================================
CREATE POLICY "Anyone can view likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like songs" ON likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike songs" ON likes
    FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR FOLLOWS
-- =============================================
CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;

-- =============================================
-- TRIGGER: Update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at
    BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Free plan credit allocation
-- =============================================
-- This can be used in a scheduled function for daily resets

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- DONE!
-- =============================================
-- Your database is ready for PositiveSpace!

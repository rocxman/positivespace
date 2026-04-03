-- PositiveSpace Database Schema
-- Run this SQL in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium', 'enterprise');
CREATE TYPE license_type AS ENUM ('personal', 'commercial');
CREATE TYPE song_status AS ENUM ('pending', 'generating', 'done', 'failed');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'done', 'failed');
CREATE TYPE generation_model AS ENUM ('yue', 'musicgen', 'ace-step');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    plan subscription_plan DEFAULT 'free',
    credits INTEGER DEFAULT 0,
    credits_reset_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    prompt TEXT,
    lyrics TEXT,
    genre VARCHAR(50),
    mood VARCHAR(50),
    tempo INTEGER,
    duration INTEGER,
    audio_url TEXT,
    stems_url JSONB,
    cover_url TEXT,
    model_used VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    license_type license_type DEFAULT 'personal',
    status song_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation Jobs table
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    celery_task_id VARCHAR(100),
    model VARCHAR(50) DEFAULT 'yue',
    credits_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    gpu_type VARCHAR(50),
    error_message TEXT,
    status job_status DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Transactions table
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX idx_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON generation_jobs(status);
CREATE INDEX idx_credits_user_id ON credit_transactions(user_id);
CREATE INDEX idx_tokens_token ON refresh_tokens(token);

-- RLS Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Songs: Users can CRUD their own songs
CREATE POLICY "Users can view own songs"
    ON songs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own songs"
    ON songs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs"
    ON songs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own songs"
    ON songs FOR DELETE
    USING (auth.uid() = user_id);

-- Songs: Anyone can view public songs
CREATE POLICY "Anyone can view public songs"
    ON songs FOR SELECT
    USING (is_public = TRUE);

-- Jobs: Users can CRUD their own jobs
CREATE POLICY "Users can view own jobs"
    ON generation_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON generation_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Credit Transactions: Users can view their own transactions
CREATE POLICY "Users can view own credits"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.username);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- Phonics Quest - Supabase PostgreSQL Database Migration Schema
-- Version: 001_initial_schema.sql
-- ====================================================================

-- 1. Create Kid Profiles Table
CREATE TABLE IF NOT EXISTS public.kids (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    serial_number VARCHAR(10) NOT NULL UNIQUE, -- 4-char PIN for quick student login
    avatar_url TEXT,
    is_custom_photo BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant PIN authentication
CREATE INDEX IF NOT EXISTS idx_kids_serial_number ON public.kids(serial_number);

-- 2. Create Learning Materials / Media Library Table (for Vercel Blob / Supabase media metadata)
CREATE TABLE IF NOT EXISTS public.media_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video')),
    url TEXT NOT NULL, -- Public Vercel Blob CDN or Supabase Storage URL
    blob_pathname TEXT, -- Vercel Blob pathname for deletions
    size BIGINT,
    duration NUMERIC,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_type ON public.media_files(type);

-- 3. Create Reward Badges Table
CREATE TABLE IF NOT EXISTS public.reward_badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT NOT NULL,
    color TEXT NOT NULL,
    bg_gradient TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Phonics Question Bank Table
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('cvc_blending', 'multiple_choice', 'fill_in_blank', 'matching')),
    title TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_voice_url TEXT,
    show_voice_record_button BOOLEAN DEFAULT TRUE,
    question_image_url TEXT,
    question_video_url TEXT,
    
    -- CVC Blending specifics
    target_word TEXT,
    word_length INTEGER,
    cvc_audio_url TEXT,
    letter_options JSONB,
    
    -- Multiple Choice specifics
    target_prompt TEXT,
    mc_options JSONB,
    
    -- Fill in the blank specifics
    full_word TEXT,
    masked_word TEXT,
    missing_letter_index INTEGER,
    missing_letter_answer TEXT,
    blank_letter_options JSONB,
    
    -- Matching specifics
    matching_pairs JSONB,
    
    -- General Settings
    correct_answer_summary TEXT,
    reward_type TEXT DEFAULT 'stars' CHECK (reward_type IN ('stars', 'points')),
    reward_value INTEGER DEFAULT 1,
    is_skippable BOOLEAN DEFAULT FALSE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);

-- 5. Create Question Sheets (Learning Curriculums) Table
CREATE TABLE IF NOT EXISTS public.question_sheets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    question_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Ordered list of question IDs
    passing_score INTEGER DEFAULT 70,
    time_limit_seconds INTEGER,
    reward_badge JSONB NOT NULL,
    reward_bonus_points INTEGER DEFAULT 0,
    background_theme TEXT DEFAULT 'candy',
    background_music TEXT DEFAULT 'playful_melody',
    custom_background_image_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_sheets_published ON public.question_sheets(is_published);

-- 6. Create Sheet Attempts / Student Progress Tracking Table
CREATE TABLE IF NOT EXISTS public.sheet_attempts (
    id TEXT PRIMARY KEY,
    kid_id TEXT NOT NULL,
    sheet_id TEXT NOT NULL,
    sheet_title TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    answers JSONB DEFAULT '[]'::jsonb,
    stars_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    score_percentage INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    badge_awarded JSONB,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheet_attempts_kid ON public.sheet_attempts(kid_id);
CREATE INDEX IF NOT EXISTS idx_sheet_attempts_sheet ON public.sheet_attempts(sheet_id);

-- ====================================================================
-- Enable Row Level Security (RLS) & Public Policies
-- ====================================================================

ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write access for early learning webapp usage
CREATE POLICY "Allow public read kids" ON public.kids FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update kids" ON public.kids FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read media_files" ON public.media_files FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update media_files" ON public.media_files FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read reward_badges" ON public.reward_badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update reward_badges" ON public.reward_badges FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read question_sheets" ON public.question_sheets FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update question_sheets" ON public.question_sheets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read sheet_attempts" ON public.sheet_attempts FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update sheet_attempts" ON public.sheet_attempts FOR ALL USING (true) WITH CHECK (true);

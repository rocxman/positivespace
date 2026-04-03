// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: SubscriptionPlan;
  credits: number;
  credits_reset_at: string | null;
  stripe_customer_id: string | null;
  is_verified: boolean;
  created_at: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'premium' | 'enterprise';

// Song Types
export interface Song {
  id: string;
  user_id: string;
  title: string;
  prompt: string | null;
  lyrics: string | null;
  genre: string | null;
  mood: string | null;
  tempo: number | null;
  duration: number | null;
  audio_url: string | null;
  stems_url: StemUrls | null;
  cover_url: string | null;
  model_used: string | null;
  is_public: boolean;
  play_count: number;
  like_count: number;
  license_type: LicenseType;
  status: SongStatus;
  created_at: string;
}

export interface StemUrls {
  vocals: string | null;
  drums: string | null;
  bass: string | null;
  melody: string | null;
}

export type LicenseType = 'personal' | 'commercial';
export type SongStatus = 'pending' | 'generating' | 'done' | 'failed';

// Generation Types
export interface GenerationJob {
  id: string;
  user_id: string;
  song_id: string | null;
  celery_task_id: string | null;
  model: GenerationModel;
  credits_used: number;
  processing_time_ms: number | null;
  gpu_type: string | null;
  error_message: string | null;
  status: JobStatus;
  created_at: string;
  completed_at: string | null;
}

export type GenerationModel = 'yue' | 'musicgen' | 'ace-step';
export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

// API Request/Response Types
export interface GenerateRequest {
  prompt: string;
  lyrics?: string;
  genre?: Genre;
  mood?: Mood;
  tempo?: number;
  duration?: Duration;
  model?: GenerationModel;
  variations?: number;
  instrumental_only?: boolean;
  reference_song_id?: string;
}

export interface GenerateResponse {
  job_id: string;
  song_id: string;
  status: JobStatus;
  estimated_time_seconds: number;
}

export interface JobStatusResponse {
  job_id: string;
  song_id: string | null;
  status: JobStatus;
  progress: number;
  audio_url?: string;
  error_message?: string;
}

// Enums
export type Genre = 
  | 'pop' | 'rock' | 'jazz' | 'rnb' | 'electronic'
  | 'classical' | 'hiphop' | 'dangdut' | 'metal' | 'folk'
  | 'indie' | 'acoustic' | 'reggae' | 'blues' | 'country';

export type Mood = 
  | 'happy' | 'sad' | 'energetic' | 'calm' | 'dark'
  | 'romantic' | 'epic' | 'dreamy' | 'aggressive' | 'peaceful';

export type Duration = 15 | 30 | 60 | 120 | 240;

// Subscription Plans
export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price_idr: number;
  price_usd: number;
  credits_monthly: number;
  credits_daily_reset: number | null;
  max_duration_seconds: number;
  variations_per_generate: number;
  download_quality: '128kbps' | '320kbps' | 'lossless';
  stem_download: boolean;
  commercial_license: boolean;
  no_watermark: boolean;
  priority_queue: 'standard' | 'priority' | 'ultra';
  style_transfer: boolean;
  api_access: number | null;
  cloud_storage_gb: number;
}

// Credit System
export interface CreditBalance {
  current: number;
  reset_at: string | null;
  plan: SubscriptionPlan;
}

export interface CreditHistory {
  id: string;
  user_id: string;
  amount: number;
  type: 'deduction' | 'purchase' | 'refund' | 'reset';
  description: string;
  created_at: string;
}

// API Error
export interface ApiError {
  error: string;
  message: string;
  status_code: number;
  details?: Record<string, unknown>;
}

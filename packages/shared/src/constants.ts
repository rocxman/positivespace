// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free' as const,
    name: 'Free',
    price_idr: 0,
    price_usd: 0,
    credits_monthly: 50,
    credits_daily_reset: 10,
    max_duration_seconds: 60,
    variations_per_generate: 2,
    download_quality: '128kbps' as const,
    stem_download: false,
    commercial_license: false,
    no_watermark: false,
    priority_queue: 'standard' as const,
    style_transfer: false,
    api_access: null,
    cloud_storage_gb: 1,
  },
  pro: {
    id: 'pro' as const,
    name: 'Pro',
    price_idr: 79000,
    price_usd: 5,
    credits_monthly: 500,
    credits_daily_reset: null,
    max_duration_seconds: 240,
    variations_per_generate: 4,
    download_quality: '320kbps' as const,
    stem_download: false,
    commercial_license: true,
    commercial_limit: 3,
    no_watermark: true,
    priority_queue: 'priority' as const,
    style_transfer: true,
    api_access: null,
    cloud_storage_gb: 5,
  },
  premium: {
    id: 'premium' as const,
    name: 'Premium',
    price_idr: 199000,
    price_usd: 13,
    credits_monthly: 2000,
    credits_daily_reset: null,
    max_duration_seconds: 240,
    variations_per_generate: 4,
    download_quality: 'lossless' as const,
    stem_download: true,
    commercial_license: true,
    commercial_limit: null,
    no_watermark: true,
    priority_queue: 'ultra' as const,
    style_transfer: true,
    api_access: 1000,
    cloud_storage_gb: 50,
  },
} as const;

// Credit Costs
export const CREDIT_COSTS = {
  '15s_instrumental': 2,
  '30s_instrumental': 3,
  '60s_instrumental': 5,
  '60s_vocal': 8,
  '4min_full': 15,
  '4min_vocal': 20,
  'extend_30s': 5,
  'stem_extraction': 10,
  'style_transfer': 8,
  'cover_art': 3,
  'remix': 10,
} as const;

// Genre Options
export const GENRES = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'rnb', label: 'R&B' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'classical', label: 'Classical' },
  { value: 'hiphop', label: 'Hip-hop' },
  { value: 'dangdut', label: 'Dangdut' },
  { value: 'metal', label: 'Metal' },
  { value: 'folk', label: 'Folk' },
  { value: 'indie', label: 'Indie' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'blues', label: 'Blues' },
  { value: 'country', label: 'Country' },
] as const;

// Mood Options
export const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'dark', label: 'Dark', emoji: '🌑' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'epic', label: 'Epic', emoji: '🏛️' },
  { value: 'dreamy', label: 'Dreamy', emoji: '💭' },
  { value: 'aggressive', label: 'Aggressive', emoji: '🔥' },
  { value: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
] as const;

// Duration Options
export const DURATIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 240, label: '4 minutes' },
] as const;

// Model Options
export const MODELS = [
  { 
    value: 'yue', 
    label: 'YuE', 
    description: 'Best for full songs with vocals',
    pros: ['Full song with vocals', 'Multi-genre', 'High quality'],
    cons: ['Slower generation', 'No Indonesian native'],
  },
  { 
    value: 'musicgen', 
    label: 'MusicGen', 
    description: 'Great for instrumentals',
    pros: ['Fast', 'Stable', 'Large community'],
    cons: ['No vocals', 'Non-commercial license'],
  },
  { 
    value: 'ace-step', 
    label: 'ACE-Step', 
    description: 'Fastest generation',
    pros: ['Ultra fast (~20s)', 'Efficient', 'Apache license'],
    cons: ['Instrumental only'],
  },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    google: '/api/v1/auth/google',
    verifyEmail: '/api/v1/auth/verify-email',
    forgotPassword: '/api/v1/auth/forgot-password',
  },
  // Generation
  generate: {
    submit: '/api/v1/generate',
    status: (jobId: string) => `/api/v1/generate/${jobId}/status`,
    extend: '/api/v1/generate/extend',
    remix: '/api/v1/generate/remix',
    stems: '/api/v1/generate/stems',
    coverArt: '/api/v1/generate/cover-art',
  },
  // Songs
  songs: {
    list: '/api/v1/songs',
    detail: (id: string) => `/api/v1/songs/${id}`,
    like: (id: string) => `/api/v1/songs/${id}/like`,
    play: (id: string) => `/api/v1/songs/${id}/play`,
    download: (id: string) => `/api/v1/songs/${id}/download`,
  },
  explore: '/api/v1/explore',
  search: '/api/v1/search',
  // Credits
  credits: {
    balance: '/api/v1/credits/balance',
    history: '/api/v1/credits/history',
    purchase: '/api/v1/credits/purchase',
  },
  // Subscription
  subscription: {
    plans: '/api/v1/subscription/plans',
    subscribe: '/api/v1/subscription/subscribe',
    cancel: '/api/v1/subscription/cancel',
  },
  // Webhooks
  webhooks: {
    stripe: '/api/v1/webhooks/stripe',
    midtrans: '/api/v1/webhooks/midtrans',
  },
  // WebSocket
  websocket: (userId: string) => `/api/v1/ws/${userId}`,
} as const;

// Validation Constants
export const VALIDATION = {
  prompt: {
    minLength: 1,
    maxLength: 500,
  },
  lyrics: {
    maxLength: 2000,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  tempo: {
    min: 40,
    max: 200,
  },
  variations: {
    min: 1,
    max: 4,
  },
} as const;

// Design System Colors
export const COLORS = {
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  dark: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0a0f',
  },
} as const;

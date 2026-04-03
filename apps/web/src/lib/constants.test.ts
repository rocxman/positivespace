import { describe, it, expect } from 'vitest';

const GENRES = {
  pop: 'Pop',
  rock: 'Rock',
  electronic: 'Electronic',
  hiphop: 'Hip Hop',
  jazz: 'Jazz',
  classical: 'Classical',
  indie: 'Indie',
  rnb: 'R&B',
  country: 'Country',
  lofi: 'Lo-fi',
  synthwave: 'Synthwave',
};

const MOODS = {
  happy: 'Happy',
  sad: 'Sad',
  energetic: 'Energetic',
  calm: 'Calm',
  romantic: 'Romantic',
  dark: 'Dark',
  peaceful: 'Peaceful',
  uplifting: 'Uplifting',
};

const MODEL_OPTIONS = [
  {
    id: 'yue',
    name: 'YuE',
    description: 'Best for full songs with vocals',
    creditCost: 5,
  },
  {
    id: 'musicgen',
    name: 'MusicGen',
    description: 'High quality instrumentals',
    creditCost: 3,
  },
];

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 10,
    features: ['10 credits daily', 'Basic genres'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29000,
    credits: 100,
    features: ['100 credits/month', 'All genres'],
  },
};

const CREDITS = {
  FREE_DAILY: 10,
  GENERATION: 5,
  EXTENSION: 2,
};

describe('Constants', () => {
  describe('GENRES', () => {
    it('contains expected genres', () => {
      expect(GENRES.pop).toBe('Pop');
      expect(GENRES.rock).toBe('Rock');
      expect(GENRES.electronic).toBe('Electronic');
      expect(GENRES.hiphop).toBe('Hip Hop');
    });

    it('has at least 10 genres', () => {
      expect(Object.keys(GENRES).length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('MOODS', () => {
    it('contains expected moods', () => {
      expect(MOODS.happy).toBe('Happy');
      expect(MOODS.sad).toBe('Sad');
      expect(MOODS.energetic).toBe('Energetic');
      expect(MOODS.calm).toBe('Calm');
    });
  });

  describe('MODEL_OPTIONS', () => {
    it('has multiple model options', () => {
      expect(MODEL_OPTIONS.length).toBeGreaterThanOrEqual(2);
    });

    it('each model has required fields', () => {
      MODEL_OPTIONS.forEach((model) => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('creditCost');
      });
    });

    it('has YuE model', () => {
      const yue = MODEL_OPTIONS.find((m) => m.id === 'yue');
      expect(yue).toBeDefined();
      expect(yue?.name).toContain('YuE');
    });
  });

  describe('PLANS', () => {
    it('has free plan', () => {
      expect(PLANS.free).toBeDefined();
      expect(PLANS.free.price).toBe(0);
    });

    it('each plan has required fields', () => {
      Object.values(PLANS).forEach((plan) => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('credits');
      });
    });
  });

  describe('CREDITS', () => {
    it('has credit values defined', () => {
      expect(CREDITS).toHaveProperty('FREE_DAILY');
      expect(CREDITS).toHaveProperty('GENERATION');
      expect(CREDITS).toHaveProperty('EXTENSION');
    });
  });
});

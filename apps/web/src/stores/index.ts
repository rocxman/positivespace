import { create } from 'zustand';
import type { Song, GenerationModel, Genre, Mood, Duration } from '@positivespace/shared/types';

interface GeneratorState {
  prompt: string;
  lyrics: string;
  genre: Genre | null;
  mood: Mood | null;
  tempo: number;
  duration: Duration;
  model: GenerationModel;
  variations: number;
  instrumentalOnly: boolean;
  
  setPrompt: (prompt: string) => void;
  setLyrics: (lyrics: string) => void;
  setGenre: (genre: Genre | null) => void;
  setMood: (mood: Mood | null) => void;
  setTempo: (tempo: number) => void;
  setDuration: (duration: Duration) => void;
  setModel: (model: GenerationModel) => void;
  setVariations: (variations: number) => void;
  setInstrumentalOnly: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  prompt: '',
  lyrics: '',
  genre: null as Genre | null,
  mood: null as Mood | null,
  tempo: 120,
  duration: 60 as Duration,
  model: 'yue' as GenerationModel,
  variations: 2,
  instrumentalOnly: false,
};

export const useGeneratorStore = create<GeneratorState>((set) => ({
  ...initialState,
  
  setPrompt: (prompt) => set({ prompt }),
  setLyrics: (lyrics) => set({ lyrics }),
  setGenre: (genre) => set({ genre }),
  setMood: (mood) => set({ mood }),
  setTempo: (tempo) => set({ tempo }),
  setDuration: (duration) => set({ duration }),
  setModel: (model) => set({ model }),
  setVariations: (variations) => set({ variations }),
  setInstrumentalOnly: (instrumentalOnly) => set({ instrumentalOnly }),
  reset: () => set(initialState),
}));

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  
  setCurrentSong: (currentSong) => set({ currentSong }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  reset: () => set({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  }),
}));

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
}));

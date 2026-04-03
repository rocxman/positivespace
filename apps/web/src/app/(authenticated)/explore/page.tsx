'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SongCardSkeleton } from '@/components/ui/skeleton';
import { Music, Search, Play, Pause, Heart, Share2, Loader2, Flame, Zap, Sparkles } from 'lucide-react';
import { GENRES, MOODS } from '@positivespace/shared/constants';

interface ExploreSong {
  id: string;
  title: string;
  genre: string;
  mood: string;
  audio_url: string;
  creator: {
    username: string;
  };
  likes: number;
  is_liked: boolean;
}

const genreOptions = GENRES.map((g) => g);
const moodOptions = MOODS.map((m) => m);

export default function ExplorePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [songs, setSongs] = useState<ExploreSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [filter, setFilter] = useState<'trending' | 'newest' | 'top'>('trending');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (genreFilter !== 'all') params.set('genre', genreFilter);
        if (moodFilter !== 'all') params.set('mood', moodFilter);
        params.set('sort', filter);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/explore?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSongs(data.songs || []);
        }
      } catch (err) {
        console.error('Failed to fetch songs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [user, genreFilter, moodFilter, filter]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore</h1>
          <p className="text-slate-400 mt-1">Discover AI-generated music from the community</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'trending', label: 'Trending', icon: Flame },
            { value: 'newest', label: 'Newest', icon: Sparkles },
            { value: 'top', label: 'Top Rated', icon: Zap },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={
                filter === tab.value
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genreOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={moodFilter} onValueChange={setMoodFilter}>
          <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {moodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-white/5">
          <Music className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
          <p className="text-slate-400">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="group bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-900/50 to-slate-800 mb-4 flex items-center justify-center relative overflow-hidden">
                <Music className="w-12 h-12 text-slate-600" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentlyPlaying(currentlyPlaying === song.id ? null : song.id)}
                    className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                  >
                    {currentlyPlaying === song.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                </div>
              </div>
              <h4 className="font-semibold text-white truncate mb-1">{song.title}</h4>
              <p className="text-sm text-slate-400 truncate mb-3">by {song.creator.username}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                    {song.genre}
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                    {song.mood}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="hover:text-red-400 transition-colors">
                    <Heart className={`w-4 h-4 ${song.is_liked ? 'fill-red-400 text-red-400' : ''}`} />
                  </button>
                  <span className="text-xs">{song.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

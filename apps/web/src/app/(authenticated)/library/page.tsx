'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SongCardSkeleton } from '@/components/ui/skeleton';
import { Music, Plus, Search, Play, Pause, MoreHorizontal, Clock, Trash2, Share2, Download, Grid, List, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Song {
  id: string;
  title: string;
  genre: string;
  created_at: string;
  duration: number;
  audio_url: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/songs?limit=50`,
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
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Library</h1>
          <p className="text-slate-400 mt-1">
            {songs.length} {songs.length === 1 ? 'track' : 'tracks'} created
          </p>
        </div>
        <Link href="/create">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search your tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : '')}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-white/5">
          <Music className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery
              ? 'No tracks match your search'
              : 'Start creating your first AI-generated track'}
          </p>
          {!searchQuery && (
            <Link href="/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Music
              </Button>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="group bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-purple-500/50 transition-colors"
            >
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-900/50 to-slate-800 mb-4 flex items-center justify-center relative overflow-hidden">
                <Music className="w-12 h-12 text-slate-600" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  {song.genre}
                </Badge>
                <span className="text-slate-500">{formatDuration(song.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-slate-400 border-b border-white/5">
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Genre</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1"></div>
          </div>
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors group"
            >
              <div className="col-span-6 flex items-center gap-3">
                <button
                  onClick={() => setCurrentlyPlaying(currentlyPlaying === song.id ? null : song.id)}
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  {currentlyPlaying === song.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                <span className="font-medium text-white truncate">{song.title}</span>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  {song.genre}
                </Badge>
              </div>
              <div className="col-span-2 text-slate-400">{formatDate(song.created_at)}</div>
              <div className="col-span-1 text-slate-400">{formatDuration(song.duration)}</div>
              <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

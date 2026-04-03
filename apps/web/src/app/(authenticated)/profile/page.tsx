'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Music, Calendar, Clock, TrendingUp, Award, Share2 } from 'lucide-react';

interface Stats {
  totalSongs: number;
  totalPlays: number;
  totalLikes: number;
  totalDuration: number;
  streak: number;
  rank: number;
}

interface RecentSong {
  id: string;
  title: string;
  genre: string;
  plays: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSongs: 0,
    totalPlays: 0,
    totalLikes: 0,
    totalDuration: 0,
    streak: 0,
    rank: 0,
  });
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setStats({
        totalSongs: 23,
        totalPlays: 1250,
        totalLikes: 89,
        totalDuration: 1847,
        streak: 7,
        rank: 42,
      });
      setRecentSongs([
        { id: '1', title: 'Summer Vibes', genre: 'pop', plays: 234, created_at: '2026-04-02' },
        { id: '2', title: 'Night Drive', genre: 'synthwave', plays: 156, created_at: '2026-04-01' },
        { id: '3', title: 'Morning Coffee', genre: 'lofi', plays: 98, created_at: '2026-03-31' },
      ]);
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const planColors = {
    free: 'bg-slate-600',
    starter: 'bg-blue-600',
    pro: 'bg-purple-600',
    unlimited: 'bg-gradient-to-r from-purple-600 to-teal-500',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/50 to-slate-900 rounded-2xl p-8 border border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
              <p className="text-slate-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className={`${planColors[user.plan as keyof typeof planColors] || 'bg-slate-600'} text-white`}>
                  {user.plan || 'Free'} Plan
                </Badge>
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined April 2026
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Songs</CardTitle>
            <Music className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSongs}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Plays</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPlays.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Duration</CardTitle>
            <Clock className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatDuration(stats.totalDuration)}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Global Rank</CardTitle>
            <Award className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">#{stats.rank}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Recent Songs</CardTitle>
          <CardDescription className="text-slate-400">Your latest creations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-900/50 to-slate-800 flex items-center justify-center">
                    <Music className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{song.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                        {song.genre}
                      </Badge>
                      <span>{song.plays} plays</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(song.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

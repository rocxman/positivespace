'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Music, Wand2, Loader2, Sparkles, Play, Pause, Download, Share2, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GENRES, MOODS, MODELS } from '@positivespace/shared/constants';

interface GeneratedSong {
  id: string;
  title: string;
  audioUrl: string;
  status: 'idle' | 'generating' | 'complete' | 'error';
  progress: number;
  error?: string;
}

const genreOptions = GENRES.map((g) => ({
  value: g.value,
  label: g.label,
}));

const moodOptions = MOODS.map((m) => ({
  value: m.value,
  label: m.label,
}));

const modelOptions = MODELS.map((m) => ({
  value: m.value,
  label: `${m.label} - ${m.description}`,
}));

export default function CreatePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<'description' | 'lyrics'>('description');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('happy');
  const [model, setModel] = useState('yue');
  const [duration, setDuration] = useState('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSong, setCurrentSong] = useState<GeneratedSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!description.trim() && !lyrics.trim()) {
      setError('Please enter a description or lyrics');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setCurrentSong({
      id: Date.now().toString(),
      title: 'Untitled Track',
      audioUrl: '',
      status: 'generating',
      progress: 0,
    });

    const prompt = mode === 'description' ? description : `Lyrics: ${lyrics}`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          prompt,
          genre,
          mood,
          model,
          duration: duration === 'short' ? 30 : duration === 'medium' ? 60 : 120,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Generation failed');
      }

      const data = await response.json();

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setCurrentSong((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'complete',
                    progress: 100,
                    audioUrl: data.audio_url || '/placeholder.mp3',
                    title: data.title || 'Generated Track',
                  }
                : null
            );
            setIsGenerating(false);
          }, 1000);
        }
        setProgress(Math.min(currentProgress, 99));
        setCurrentSong((prev) =>
          prev ? { ...prev, progress: Math.min(currentProgress, 99) } : null
        );
      }, 1000);

      setCurrentSong((prev) =>
        prev
          ? {
              ...prev,
              id: data.job_id || prev.id,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
      setCurrentSong((prev) =>
        prev ? { ...prev, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : null
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Music</h1>
          <p className="text-slate-400 mt-1">
            Generate AI-powered music from text or lyrics
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2 border-purple-500/50 text-purple-400">
          <Sparkles className="w-4 h-4 mr-2" />
          {user.credits} credits remaining
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('description')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  mode === 'description'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                Text Description
              </button>
              <button
                onClick={() => setMode('lyrics')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  mode === 'lyrics'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                With Lyrics
              </button>
            </div>

            {mode === 'description' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe your music
                  </label>
                  <Textarea
                    placeholder="A upbeat tropical house track with catchy melody and summer vibes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lyrics
                  </label>
                  <Textarea
                    placeholder="Verse 1:&#10;Walking down the street today...&#10;&#10;Chorus:&#10;This is my moment..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="min-h-[100px] bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Music description (optional)
                  </label>
                  <Input
                    placeholder="Add more context about the style..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Style Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">30 seconds</SelectItem>
                    <SelectItem value="medium">1 minute</SelectItem>
                    <SelectItem value="long">2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || user.credits < 5}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-semibold text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Music (5 credits)
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-900/50 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
              {isGenerating ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-teal-500/20 animate-pulse" />
                  <div className="relative z-10 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center">
                      <Music className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-white font-medium">Generating your track...</p>
                    <Progress value={progress} className="w-48 mx-auto" />
                  </div>
                </>
              ) : currentSong?.status === 'complete' ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-teal-500/20" />
                  <div className="relative z-10 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
                      <Music className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{currentSong.title}</h4>
                      <p className="text-slate-400">{genreOptions.find(g => g.value === genre)?.label}</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        size="lg"
                        className="rounded-full w-14 h-14 bg-white text-slate-900 hover:bg-slate-100"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </>
              ) : currentSong?.status === 'error' ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <p className="text-red-400 font-medium">{currentSong.error}</p>
                  <Button variant="outline" onClick={() => setCurrentSong(null)}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated music will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Tips</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                Be specific about the mood and tempo in your description
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                Include genre keywords like &quot;lo-fi&quot;, &quot;EDM&quot;, or &quot;acoustic&quot;
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                Reference artists or songs for style matching
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                For lyrics mode, add section markers like [Verse], [Chorus]
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

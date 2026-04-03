import Link from 'next/link';
import { Music, Play, Users, Zap, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">PositiveSpace</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors">
                Create
              </Link>
              <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
                Explore
              </Link>
              <a href="/billing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Bahasa Indonesia Support
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Create Studio-Quality<br />
            <span className="text-gradient">Music with AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Transform your ideas into full songs in seconds. Text-to-music and lyrics-to-full-song 
            powered by cutting-edge AI models. No instruments needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold text-lg transition-all shadow-glow-purple"
            >
              Start Creating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-white font-medium text-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </a>
          </div>
          <p className="mt-4 text-gray-500 text-sm">
            Free tier: 10 credits/day. No credit card required.
          </p>
        </div>

        {/* Demo Preview */}
        <div id="demo" className="max-w-5xl mx-auto mt-16">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-dark-900/50 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-teal-500/10" />
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-gray-400">Interactive Demo Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-950/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center text-white mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
            Professional music production tools, powered by AI. No experience required.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-dark-900/50 border border-white/5 hover:border-purple-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Create?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of creators making music with AI. Start for free today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white font-semibold text-lg transition-all shadow-glow-teal"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">PositiveSpace</span>
            </div>
            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 PositiveSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Music,
    title: 'Text to Music',
    description: 'Describe your music in plain text and watch AI transform your words into full compositions.',
  },
  {
    icon: Users,
    title: 'Full Songs with Vocals',
    description: 'Generate complete songs with AI vocals from your lyrics. Multiple styles and languages.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate 4-minute songs in under 30 seconds. No waiting, just create.',
  },
  {
    icon: Shield,
    title: 'Commercial Ready',
    description: 'Get commercial licenses for your creations. Use in YouTube, podcasts, and projects.',
  },
  {
    icon: Play,
    title: 'High Quality Export',
    description: 'Download in WAV lossless quality. Professional-grade audio for your productions.',
  },
  {
    icon: Music,
    title: 'Stem Export',
    description: 'Get isolated stems: vocals, drums, bass, melody. Full control for your remixes.',
  },
];

const stats = [
  { value: '5M+', label: 'Songs Generated' },
  { value: '100K+', label: 'Active Creators' },
  { value: '50+', label: 'Music Genres' },
  { value: '<30s', label: 'Avg Generation Time' },
];

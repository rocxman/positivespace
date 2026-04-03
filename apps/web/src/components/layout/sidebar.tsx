'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Plus, Library, Compass, User, Settings, CreditCard, Zap, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-provider';

const navItems: { href: string; label: string; icon: typeof Plus }[] = [
  { href: '/create', label: 'Create', icon: Plus },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/explore', label: 'Explore', icon: Compass },
];

const settingsItems: { href: string; label: string; icon: typeof Settings }[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900/50 border-r border-white/5 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">PositiveSpace</span>
          </Link>
        </div>

        {/* Credits Display */}
        <div className="px-4 mb-4">
          <div className="p-4 rounded-xl bg-dark-800/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Credits</span>
            </div>
            <div className="text-2xl font-bold text-white">{user?.credits ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Available today</div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">
            Settings
          </div>
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white/5 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.plan || 'free'} plan
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { Bell, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export function TopBar() {
  return (
    <header className="h-16 bg-dark-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search songs, artists, or genres..."
              className="pl-10 bg-dark-900/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
          </Button>
          
          <Button variant="ghost" className="text-sm">
            Get More Credits
          </Button>
        </div>
      </div>
    </header>
  );
}

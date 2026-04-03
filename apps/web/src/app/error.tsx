'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-20 h-20 mx-auto bg-red-900/50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
        <p className="text-slate-400">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

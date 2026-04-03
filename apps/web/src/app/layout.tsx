import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PositiveSpace - AI Music Generation Platform',
    template: '%s | PositiveSpace',
  },
  description: 'Create studio-quality music in seconds with AI. Text-to-music and lyrics-to-full-song in Bahasa Indonesia & English.',
  keywords: ['AI music', 'music generation', 'text to music', 'AI songwriter', 'musik AI', 'Indonesia'],
  authors: [{ name: 'PositiveSpace' }],
  creator: 'PositiveSpace',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    siteName: 'PositiveSpace',
    title: 'PositiveSpace - AI Music Generation Platform',
    description: 'Create studio-quality music in seconds with AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PositiveSpace - AI Music Generation Platform',
    description: 'Create studio-quality music in seconds with AI.',
    creator: '@positivespace',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#7c3aed' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

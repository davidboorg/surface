'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  // Initialize Supabase client on mount (client-side only)
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    if (!supabase) return;

    setIsLoading(provider === 'azure' ? 'microsoft' : 'google');
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
            <span className="text-white font-medium">S</span>
          </div>
          <span className="text-xl text-[#2C2416] font-medium">Surface</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-[#2C2416] mb-3">
              Sign in to Surface
            </h1>
            <p className="text-[#6B5D4D]">
              Use your work account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google OAuth */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-[#E8E0D5] rounded-xl hover:border-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="text-[#2C2416]">Continue with Google</span>
            </button>

            {/* Microsoft OAuth */}
            <button
              onClick={() => handleOAuthLogin('azure')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-[#E8E0D5] rounded-xl hover:border-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === 'microsoft' ? (
                <div className="w-5 h-5 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#00A4EF" d="M1 13h10v10H1z" />
                  <path fill="#7FBA00" d="M13 1h10v10H13z" />
                  <path fill="#FFB900" d="M13 13h10v10H13z" />
                </svg>
              )}
              <span className="text-[#2C2416]">Continue with Microsoft</span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#A09080]">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-[#6B5D4D]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-[#6B5D4D]">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>

      {/* Trust message */}
      <footer className="p-6 text-center">
        <p className="text-sm text-[#A09080] max-w-md mx-auto">
          Your contributions are anonymous by default. Leadership cannot see who shared what.
        </p>
      </footer>
    </div>
  );
}

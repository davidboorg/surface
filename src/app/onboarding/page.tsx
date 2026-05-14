'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setupProfile = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Already has profile, go to companion
        router.push('/companion');
        return;
      }

      setIsLoading(false);
    };

    setupProfile();
  }, [router]);

  const handleCreateProfile = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get tenant by email domain
      const emailDomain = user.email?.split('@')[1];

      // For now, use the default tenant
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .limit(1)
        .single();

      const tenant = tenantData as { id: string } | null;

      if (!tenant) {
        setError('No organization found. Please contact support.');
        setIsCreating(false);
        return;
      }

      // Create profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profilesTable = supabase.from('profiles') as any;
      const { error: profileError } = await profilesTable.insert({
        id: user.id,
        tenant_id: tenant.id,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: 'contributor',
        default_quote_preference: 'anonymous',
        onboarded_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setError('Failed to create profile. Please try again.');
        setIsCreating(false);
        return;
      }

      router.push('/companion');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Something went wrong. Please try again.');
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center animate-pulse">
          <span className="text-white font-medium">S</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center mx-auto mb-8">
          <span className="text-white text-xl font-medium">S</span>
        </div>

        <h1 className="text-3xl font-light text-[#2C2416] mb-4">
          Welcome to Surface
        </h1>

        <p className="text-[#6B5D4D] mb-8 leading-relaxed">
          Surface helps your organization understand itself better. Share observations, 
          frustrations, and opportunities — and watch patterns emerge.
        </p>

        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 mb-8 text-left">
          <h2 className="text-lg text-[#2C2416] mb-4">How it works</h2>
          <ul className="space-y-3 text-[#6B5D4D]">
            <li className="flex items-start gap-3">
              <span className="text-[#C9A962]">1.</span>
              <span>Share what you're observing through natural conversation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#C9A962]">2.</span>
              <span>Choose what to contribute — you control what leadership sees</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#C9A962]">3.</span>
              <span>Your identity is never attached to your contributions</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#F5F0E8] rounded-xl p-4 mb-8">
          <p className="text-sm text-[#6B5D4D]">
            <strong className="text-[#2C2416]">Trust is foundational.</strong> Leadership 
            cannot see who shared what. Your contributions are anonymous by default.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateProfile}
          disabled={isCreating}
          className="w-full px-8 py-4 bg-[#2C2416] text-white rounded-full text-lg hover:bg-[#3D3425] transition-colors disabled:opacity-50"
        >
          {isCreating ? 'Setting up...' : 'Get started'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tension {
  id: string;
  title: string;
  synthesis: string;
  observedAcross?: string[];
  repeatedPhrases?: string[];
  intensity: 'low' | 'moderate' | 'high' | 'critical';
  momentum: 'emerging' | 'growing' | 'sustained' | 'declining';
  blindSpot?: string | null;
  suggestedAction?: string;
  signalCount?: number;
  signalStrength?: 'strong' | 'emerging' | 'singular';
}

interface Mood {
  overall: string;
  shifts?: string[];
}

interface ReadData {
  id: string;
  narrative: string | null;
  top_tensions: Tension[];
  emerging_patterns: string[];
  recommendations: string[];
  mood: Mood | null;
  blind_spots: string[];
  period_start: string;
  period_end: string;
  signal_count: number | null;
  created_at: string;
}

export default function ReadPage() {
  const [read, setRead] = useState<ReadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [signalCount, setSignalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRead = async (forceRegenerate = false) => {
    try {
      setError(null);
      if (forceRegenerate) setIsRegenerating(true);

      const response = await fetch('/api/read', {
        method: forceRegenerate ? 'POST' : 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setRead(data.read);
        setSignalCount(data.signalCount || 0);
      } else if (response.status === 403) {
        setError('The Read is only available to leadership.');
      } else if (response.status === 401) {
        setError('Please sign in to view The Read.');
      }
    } catch {
      setError('Failed to connect');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    fetchRead();
  }, []);

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-[#C9A962] animate-pulse mx-auto mb-4" />
          <p className="text-[#6B5D4D] text-sm">Loading The Read...</p>
        </div>
      </div>
    );
  }

  // Error or empty state
  if (error || !read) {
    return (
      <div className="min-h-screen bg-[#FFFBF5]">
        <Header onRegenerate={() => fetchRead(true)} isRegenerating={isRegenerating} />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          {error ? (
            <>
              <p className="text-[#6B5D4D] mb-6">{error}</p>
              {error.includes('sign in') && (
                <Link href="/login" className="text-[#8B7355] underline">
                  Sign in
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="text-[#6B5D4D] mb-6">
                {signalCount === 0
                  ? 'No signals yet. The organization hasn\'t shared anything this week.'
                  : `${signalCount} signals waiting. Generate The Read to see what the organization is saying.`}
              </p>
              {signalCount > 0 && (
                <button
                  onClick={() => fetchRead(true)}
                  disabled={isRegenerating}
                  className="px-6 py-3 bg-[#2C2416] text-white rounded-full hover:bg-[#3D3425] transition-colors disabled:opacity-50"
                >
                  {isRegenerating ? 'Generating...' : 'Generate The Read'}
                </button>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  const primaryTensions = read.top_tensions?.filter(t =>
    t.signalStrength === 'strong' || (t.signalCount && t.signalCount >= 3)
  ) || [];

  const emergingTensions = read.top_tensions?.filter(t =>
    t.signalStrength === 'emerging' || t.signalStrength === 'singular'
  ) || [];

  const primaryRecommendation = read.recommendations?.[0];

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <Header onRegenerate={() => fetchRead(true)} isRegenerating={isRegenerating} />

      <main className="max-w-2xl mx-auto px-6">
        {/* Masthead */}
        <header className="pt-16 pb-12 border-b border-[#E8E0D5]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#C9A962]" />
            <span className="text-xs text-[#8B7355] uppercase tracking-[0.2em] font-medium">
              The Read
            </span>
          </div>
          <p className="text-sm text-[#A09080]">
            {formatDateRange(read.period_start, read.period_end)} · {read.signal_count} signals
          </p>
        </header>

        {/* Opening Narrative */}
        <section className="py-16 border-b border-[#E8E0D5]">
          <p className="text-2xl md:text-3xl font-light text-[#2C2416] leading-relaxed">
            {read.narrative}
          </p>
          {read.mood && (
            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm text-[#A09080]">Mood:</span>
              <span className={`text-sm font-medium capitalize ${
                read.mood.overall === 'frustrated' ? 'text-red-700' :
                read.mood.overall === 'concerned' ? 'text-amber-700' :
                read.mood.overall === 'optimistic' ? 'text-green-700' :
                read.mood.overall === 'energized' ? 'text-blue-700' :
                'text-[#6B5D4D]'
              }`}>
                {read.mood.overall}
              </span>
            </div>
          )}
        </section>

        {/* Primary Tensions */}
        {primaryTensions.length > 0 && (
          <section className="py-16 border-b border-[#E8E0D5]">
            <h2 className="text-xs text-[#8B7355] uppercase tracking-[0.2em] font-medium mb-10">
              Recurring Tensions
            </h2>
            <div className="space-y-16">
              {primaryTensions.map((tension) => (
                <TensionCard key={tension.id} tension={tension} />
              ))}
            </div>
          </section>
        )}

        {/* Emerging Signals */}
        {emergingTensions.length > 0 && (
          <section className="py-16 border-b border-[#E8E0D5]">
            <h2 className="text-xs text-[#8B7355] uppercase tracking-[0.2em] font-medium mb-10">
              Emerging This Week
            </h2>
            <div className="space-y-8">
              {emergingTensions.map((tension) => (
                <div key={tension.id} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A962] mt-2.5 flex-shrink-0" />
                  <div>
                    <p className="text-[#2C2416] font-medium">{tension.title}</p>
                    <p className="text-[#6B5D4D] text-sm mt-1">{tension.synthesis}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Blind Spots */}
        {read.blind_spots && read.blind_spots.length > 0 && (
          <section className="py-16 border-b border-[#E8E0D5]">
            <h2 className="text-xs text-[#8B7355] uppercase tracking-[0.2em] font-medium mb-10">
              What You Might Be Missing
            </h2>
            <div className="space-y-6">
              {read.blind_spots.map((blindSpot, i) => (
                <p key={i} className="text-[#6B5D4D] leading-relaxed pl-6 border-l-2 border-amber-300">
                  {blindSpot}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Focus */}
        {primaryRecommendation && (
          <section className="py-16 border-b border-[#E8E0D5]">
            <h2 className="text-xs text-[#8B7355] uppercase tracking-[0.2em] font-medium mb-6">
              Recommended Focus
            </h2>
            <p className="text-xl text-[#2C2416] leading-relaxed">
              {primaryRecommendation}
            </p>
            {read.recommendations && read.recommendations.length > 1 && (
              <div className="mt-8 pt-6 border-t border-[#E8E0D5]">
                <p className="text-sm text-[#A09080] mb-4">Also consider:</p>
                <ul className="space-y-2">
                  {read.recommendations.slice(1).map((rec, i) => (
                    <li key={i} className="text-sm text-[#6B5D4D]">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="py-16 text-center">
          <p className="text-xs text-[#A09080]">
            Synthesized from {read.signal_count} anonymous observations
          </p>
          <Link
            href="/companion"
            className="inline-block mt-6 text-sm text-[#8B7355] hover:text-[#2C2416] transition-colors"
          >
            Contribute to next week's Read
          </Link>
        </footer>
      </main>
    </div>
  );
}

function Header({ onRegenerate, isRegenerating }: { onRegenerate: () => void; isRegenerating: boolean }) {
  return (
    <header className="border-b border-[#E8E0D5] bg-[#FFFBF5]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
            <span className="text-white text-xs font-medium">S</span>
          </div>
          <span className="text-[#2C2416] text-sm font-medium group-hover:text-[#8B7355] transition-colors">
            Surface
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-xs text-[#A09080] hover:text-[#2C2416] transition-colors disabled:opacity-50"
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <Link
            href="/companion"
            className="text-xs text-[#A09080] hover:text-[#2C2416] transition-colors"
          >
            Contribute
          </Link>
        </div>
      </div>
    </header>
  );
}

function TensionCard({ tension }: { tension: Tension }) {
  const strengthLabel = tension.signalStrength === 'strong'
    ? `${tension.signalCount} contributors`
    : tension.signalStrength === 'emerging'
    ? 'Emerging pattern'
    : 'Single observation';

  return (
    <article>
      {/* Title and metadata */}
      <div className="mb-6">
        <h3 className="text-xl text-[#2C2416] font-medium mb-2">
          {tension.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-[#A09080]">
          <span className={`capitalize ${
            tension.momentum === 'growing' ? 'text-amber-600' :
            tension.momentum === 'emerging' ? 'text-blue-600' :
            tension.momentum === 'declining' ? 'text-green-600' :
            ''
          }`}>
            {tension.momentum}
          </span>
          <span>·</span>
          <span>{strengthLabel}</span>
          {tension.intensity === 'critical' && (
            <>
              <span>·</span>
              <span className="text-red-600">Critical</span>
            </>
          )}
        </div>
      </div>

      {/* Synthesis */}
      <p className="text-[#6B5D4D] leading-relaxed mb-6">
        {tension.synthesis}
      </p>

      {/* Direct quotes */}
      {tension.repeatedPhrases && tension.repeatedPhrases.length > 0 && (
        <div className="mb-6 pl-6 border-l-2 border-[#E8E0D5]">
          {tension.repeatedPhrases.slice(0, 2).map((phrase, i) => (
            <p key={i} className="text-[#2C2416] italic mb-2 last:mb-0">
              "{phrase.replace(/^["']|["']$/g, '')}"
            </p>
          ))}
        </div>
      )}

      {/* Blind spot callout */}
      {tension.blindSpot && (
        <div className="bg-amber-50 border-l-2 border-amber-400 px-4 py-3 mb-6">
          <p className="text-xs text-amber-800 font-medium mb-1">Potential blind spot</p>
          <p className="text-sm text-amber-700">{tension.blindSpot}</p>
        </div>
      )}

      {/* Suggested action */}
      {tension.suggestedAction && (
        <div className="bg-[#2C2416] text-white px-5 py-4 rounded-lg">
          <p className="text-xs text-white/60 mb-1">Suggested action</p>
          <p className="text-sm">{tension.suggestedAction}</p>
        </div>
      )}
    </article>
  );
}

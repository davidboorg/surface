'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PulseEntry, Tension } from '@/data/intelligence';

const momentumColors = {
  emerging: 'bg-blue-100 text-blue-700',
  growing: 'bg-amber-100 text-amber-700',
  sustained: 'bg-gray-100 text-gray-600',
  declining: 'bg-green-100 text-green-700',
};

const intensityIndicator = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export default function PulsePage() {
  const [pulse, setPulse] = useState<PulseEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [signalCount, setSignalCount] = useState(0);
  const [departments, setDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPulse = async (forceRegenerate = false) => {
    try {
      setError(null);
      if (forceRegenerate) {
        setIsRegenerating(true);
      }

      const response = await fetch('/api/pulse', {
        method: forceRegenerate ? 'POST' : 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setPulse(data.pulse);
        setSignalCount(data.signalCount || 0);
        setDepartments(data.departments || []);
      } else {
        setError('Failed to load pulse');
      }
    } catch (err) {
      console.error('Pulse fetch error:', err);
      setError('Failed to connect to pulse service');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-medium">S</span>
          </div>
          <p className="text-[#6B5D4D]">Synthesizing organizational intelligence...</p>
        </div>
      </div>
    );
  }

  // Empty state - no pulse yet
  if (!pulse) {
    return (
      <div className="min-h-screen bg-[#FFFBF5]">
        <header className="border-b border-[#E8E0D5] bg-[#FFFBF5]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
              <span className="text-[#2C2416] font-medium group-hover:text-[#8B7355] transition-colors">
                Surface
              </span>
            </Link>
            <Link
              href="/companion"
              className="text-sm text-[#6B5D4D] hover:text-[#2C2416] transition-colors"
            >
              Contribute
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F0E8] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#A09080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-[#2C2416] mb-4">
            The Pulse is listening
          </h1>
          <p className="text-[#6B5D4D] mb-8 max-w-md mx-auto">
            {signalCount === 0
              ? 'No signals yet. Start contributing observations to generate organizational intelligence.'
              : `${signalCount} signals collected. More observations needed to generate meaningful synthesis.`}
          </p>
          <Link
            href="/companion"
            className="inline-flex px-6 py-3 bg-[#2C2416] text-white rounded-full hover:bg-[#3D3425] transition-colors"
          >
            Start contributing
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <header className="border-b border-[#E8E0D5] bg-[#FFFBF5]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
              <span className="text-white text-sm font-medium">S</span>
            </div>
            <span className="text-[#2C2416] font-medium group-hover:text-[#8B7355] transition-colors">
              Surface
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchPulse(true)}
              disabled={isRegenerating}
              className="text-sm text-[#6B5D4D] hover:text-[#2C2416] transition-colors disabled:opacity-50"
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <Link
              href="/companion"
              className="text-sm text-[#6B5D4D] hover:text-[#2C2416] transition-colors"
            >
              Contribute
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Pulse Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#C9A962] animate-pulse" />
            <span className="text-sm text-[#8B7355] font-medium uppercase tracking-wider">
              Organizational Pulse
            </span>
          </div>
          <h1 className="text-4xl font-light text-[#2C2416] mb-3">
            What the organization is trying to tell you
          </h1>
          <p className="text-[#6B5D4D]">
            Synthesized from {signalCount} observations across {departments.length} departments
          </p>
          <p className="text-sm text-[#A09080] mt-2">
            Last updated {formatTimeAgo(pulse.generatedAt)}
          </p>
        </div>

        {/* Narrative */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-8">
            <h2 className="text-sm text-[#8B7355] font-medium uppercase tracking-wider mb-4">
              The Narrative
            </h2>
            <p className="text-xl text-[#2C2416] leading-relaxed font-light">
              {pulse.narrative}
            </p>
          </div>
        </section>

        {/* Organizational Mood */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg text-[#2C2416]">Organizational Mood</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              pulse.mood.overall === 'concerned' ? 'bg-amber-100 text-amber-700' :
              pulse.mood.overall === 'frustrated' ? 'bg-red-100 text-red-700' :
              pulse.mood.overall === 'optimistic' ? 'bg-green-100 text-green-700' :
              pulse.mood.overall === 'energized' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {pulse.mood.overall}
            </span>
          </div>
          {pulse.mood.shifts && pulse.mood.shifts.length > 0 && (
            <div className="space-y-3">
              {pulse.mood.shifts.map((shift, i) => (
                <p key={i} className="text-[#6B5D4D] flex items-start gap-3">
                  <span className="text-[#C9A962] mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                  {shift}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* Tensions */}
        {pulse.topTensions && pulse.topTensions.length > 0 && (
          <section className="mb-16">
            <h2 className="text-lg text-[#2C2416] mb-6">Recurring Tensions</h2>
            <div className="space-y-6">
              {pulse.topTensions.map((tension: Tension) => (
                <div
                  key={tension.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden"
                >
                  <div className="p-6 border-b border-[#E8E0D5]">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl text-[#2C2416]">{tension.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${momentumColors[tension.momentum] || momentumColors.emerging}`}>
                          {tension.momentum}
                        </span>
                        {/* Intensity dots */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                level <= (intensityIndicator[tension.intensity] || 2)
                                  ? tension.intensity === 'critical'
                                    ? 'bg-red-500'
                                    : tension.intensity === 'high'
                                    ? 'bg-amber-500'
                                    : 'bg-[#C9A962]'
                                  : 'bg-[#E8E0D5]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[#6B5D4D] leading-relaxed">{tension.synthesis}</p>
                  </div>

                  <div className="p-6 bg-[#FDFBF8]">
                    {/* Observed across */}
                    {tension.observedAcross && tension.observedAcross.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-[#A09080] mb-2">Observed across</p>
                        <div className="flex flex-wrap gap-2">
                          {tension.observedAcross.map((dept) => (
                            <span
                              key={dept}
                              className="px-3 py-1 bg-white border border-[#E8E0D5] rounded-full text-sm text-[#6B5D4D]"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Repeated phrases */}
                    {tension.repeatedPhrases && tension.repeatedPhrases.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-[#A09080] mb-2">Most repeated phrases</p>
                        <div className="space-y-2">
                          {tension.repeatedPhrases.map((phrase, i) => (
                            <p key={i} className="text-[#2C2416] italic">
                              &ldquo;{phrase.replace(/^["']|["']$/g, '')}&rdquo;
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blind spot */}
                    {tension.blindSpot && (
                      <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium mb-1">Potential blind spot</p>
                        <p className="text-sm text-amber-700">{tension.blindSpot}</p>
                      </div>
                    )}

                    {/* Suggested action */}
                    {tension.suggestedAction && (
                      <div className="p-4 bg-[#2C2416] rounded-lg">
                        <p className="text-sm text-white/60 mb-1">Suggested action</p>
                        <p className="text-white">{tension.suggestedAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emerging Patterns */}
        {pulse.emergingPatterns && pulse.emergingPatterns.length > 0 && (
          <section className="mb-16">
            <h2 className="text-lg text-[#2C2416] mb-6">Emerging Patterns</h2>
            <div className="space-y-4">
              {pulse.emergingPatterns.map((pattern, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E8E0D5]">
                  <div className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-[#8B7355] font-medium">{i + 1}</span>
                  </div>
                  <p className="text-[#2C2416] pt-1">{pattern}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leadership Blind Spots */}
        {pulse.blindSpots && pulse.blindSpots.length > 0 && (
          <section className="mb-16">
            <h2 className="text-lg text-[#2C2416] mb-6">What Leadership Might Be Missing</h2>
            <div className="bg-white rounded-2xl border border-[#E8E0D5] divide-y divide-[#E8E0D5]">
              {pulse.blindSpots.map((blindSpot, i) => (
                <div key={i} className="p-5 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <p className="text-[#6B5D4D]">{blindSpot}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {pulse.recommendations && pulse.recommendations.length > 0 && (
          <section className="mb-16">
            <h2 className="text-lg text-[#2C2416] mb-6">Recommended Focus Areas</h2>
            <div className="grid gap-4">
              {pulse.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-5 bg-[#2C2416] rounded-xl text-white"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{i + 1}</span>
                  </div>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer note */}
        <div className="text-center py-8 border-t border-[#E8E0D5]">
          <p className="text-sm text-[#A09080]">
            This pulse was synthesized from organizational signals collected between{' '}
            {formatDate(pulse.periodStart)} and {formatDate(pulse.periodEnd)}
          </p>
        </div>
      </main>
    </div>
  );
}

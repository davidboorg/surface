'use client';

import Link from 'next/link';
import { currentPulse, tensions, signals } from '@/data/intelligence';

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
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

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
          <Link
            href="/companion"
            className="text-sm text-[#6B5D4D] hover:text-[#2C2416] transition-colors"
          >
            Contribute
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
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
            Synthesized from {signals.length} observations across {new Set(signals.map(s => s.contributor.department)).size} departments
          </p>
          <p className="text-sm text-[#A09080] mt-2">
            Last updated {formatTimeAgo(currentPulse.generatedAt)}
          </p>
        </div>

        {/* Narrative */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-8">
            <h2 className="text-sm text-[#8B7355] font-medium uppercase tracking-wider mb-4">
              The Narrative
            </h2>
            <p className="text-xl text-[#2C2416] leading-relaxed font-light">
              {currentPulse.narrative}
            </p>
          </div>
        </section>

        {/* Organizational Mood */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg text-[#2C2416]">Organizational Mood</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              currentPulse.mood.overall === 'concerned' ? 'bg-amber-100 text-amber-700' :
              currentPulse.mood.overall === 'frustrated' ? 'bg-red-100 text-red-700' :
              currentPulse.mood.overall === 'optimistic' ? 'bg-green-100 text-green-700' :
              currentPulse.mood.overall === 'energized' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {currentPulse.mood.overall}
            </span>
          </div>
          <div className="space-y-3">
            {currentPulse.mood.shifts.map((shift, i) => (
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
        </section>

        {/* Tensions */}
        <section className="mb-16">
          <h2 className="text-lg text-[#2C2416] mb-6">Recurring Tensions</h2>
          <div className="space-y-6">
            {tensions.map((tension) => (
              <div
                key={tension.id}
                className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden"
              >
                <div className="p-6 border-b border-[#E8E0D5]">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl text-[#2C2416]">{tension.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${momentumColors[tension.momentum]}`}>
                        {tension.momentum}
                      </span>
                      {/* Intensity dots */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= intensityIndicator[tension.intensity]
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

                  {/* Repeated phrases */}
                  <div className="mb-4">
                    <p className="text-sm text-[#A09080] mb-2">Most repeated phrases</p>
                    <div className="space-y-2">
                      {tension.repeatedPhrases.map((phrase, i) => (
                        <p key={i} className="text-[#2C2416] italic">
                          {phrase}
                        </p>
                      ))}
                    </div>
                  </div>

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

        {/* Emerging Patterns */}
        <section className="mb-16">
          <h2 className="text-lg text-[#2C2416] mb-6">Emerging Patterns</h2>
          <div className="space-y-4">
            {currentPulse.emergingPatterns.map((pattern, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E8E0D5]">
                <div className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-[#8B7355] font-medium">{i + 1}</span>
                </div>
                <p className="text-[#2C2416] pt-1">{pattern}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership Blind Spots */}
        <section className="mb-16">
          <h2 className="text-lg text-[#2C2416] mb-6">What Leadership Might Be Missing</h2>
          <div className="bg-white rounded-2xl border border-[#E8E0D5] divide-y divide-[#E8E0D5]">
            {currentPulse.blindSpots.map((blindSpot, i) => (
              <div key={i} className="p-5 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <p className="text-[#6B5D4D]">{blindSpot}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="mb-16">
          <h2 className="text-lg text-[#2C2416] mb-6">Recommended Focus Areas</h2>
          <div className="grid gap-4">
            {currentPulse.recommendations.map((rec, i) => (
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

        {/* Footer note */}
        <div className="text-center py-8 border-t border-[#E8E0D5]">
          <p className="text-sm text-[#A09080]">
            This pulse was synthesized from organizational signals collected between{' '}
            {formatDate(currentPulse.periodStart)} and {formatDate(currentPulse.periodEnd)}
          </p>
        </div>
      </main>
    </div>
  );
}

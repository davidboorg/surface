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

type ResponseType = 'acknowledged' | 'action_planned' | 'wont_act' | 'needs_discussion';

interface TensionResponse {
  id: string;
  tension_index: number;
  response_type: ResponseType;
  response_text: string | null;
}

export default function ReadPage() {
  const [read, setRead] = useState<ReadData | null>(null);
  const [responses, setResponses] = useState<Map<number, TensionResponse>>(new Map());
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

        // Fetch responses if we have a read
        if (data.read?.id) {
          fetchResponses(data.read.id);
        }
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

  const fetchResponses = async (readId: string) => {
    try {
      const response = await fetch(`/api/responses?readId=${readId}`);
      if (response.ok) {
        const data = await response.json();
        const responseMap = new Map<number, TensionResponse>();
        data.responses?.forEach((r: TensionResponse) => {
          responseMap.set(r.tension_index, r);
        });
        setResponses(responseMap);
      }
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    }
  };

  const handleResponse = async (tensionIndex: number, responseType: ResponseType, responseText?: string) => {
    if (!read) return;

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readId: read.id,
          tensionIndex,
          responseType,
          responseText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(prev => {
          const next = new Map(prev);
          next.set(tensionIndex, data.response);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to save response:', err);
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

  // Check if all tensions have responses
  const allTensionsResponded = read?.top_tensions
    ? read.top_tensions.every((_, i) => responses.has(i))
    : true;

  const respondedCount = responses.size;
  const totalTensions = read?.top_tensions?.length || 0;

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
        <Header
          onRegenerate={() => fetchRead(true)}
          isRegenerating={isRegenerating}
          canRegenerate={true}
        />
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
      <Header
        onRegenerate={() => fetchRead(true)}
        isRegenerating={isRegenerating}
        canRegenerate={allTensionsResponded}
        respondedCount={respondedCount}
        totalTensions={totalTensions}
      />

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

        {/* Response progress */}
        {totalTensions > 0 && (
          <div className="py-4 border-b border-[#E8E0D5]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A09080]">
                {allTensionsResponded
                  ? 'All tensions addressed'
                  : `${respondedCount} of ${totalTensions} tensions addressed`}
              </span>
              {allTensionsResponded && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </span>
              )}
            </div>
            <div className="mt-2 h-1 bg-[#E8E0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A962] transition-all duration-300"
                style={{ width: `${(respondedCount / totalTensions) * 100}%` }}
              />
            </div>
          </div>
        )}

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
              {primaryTensions.map((tension, i) => {
                const tensionIndex = read.top_tensions.indexOf(tension);
                return (
                  <TensionCard
                    key={tension.id}
                    tension={tension}
                    response={responses.get(tensionIndex)}
                    onResponse={(type, text) => handleResponse(tensionIndex, type, text)}
                  />
                );
              })}
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
              {emergingTensions.map((tension) => {
                const tensionIndex = read.top_tensions.indexOf(tension);
                return (
                  <EmergingTensionCard
                    key={tension.id}
                    tension={tension}
                    response={responses.get(tensionIndex)}
                    onResponse={(type) => handleResponse(tensionIndex, type)}
                  />
                );
              })}
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
            Contribute to next week&apos;s Read
          </Link>
        </footer>
      </main>
    </div>
  );
}

function Header({
  onRegenerate,
  isRegenerating,
  canRegenerate,
  respondedCount = 0,
  totalTensions = 0,
}: {
  onRegenerate: () => void;
  isRegenerating: boolean;
  canRegenerate: boolean;
  respondedCount?: number;
  totalTensions?: number;
}) {
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
            disabled={isRegenerating || !canRegenerate}
            className="text-xs text-[#A09080] hover:text-[#2C2416] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canRegenerate ? `Respond to all tensions first (${respondedCount}/${totalTensions})` : ''}
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

function TensionCard({
  tension,
  response,
  onResponse,
}: {
  tension: Tension;
  response?: TensionResponse;
  onResponse: (type: ResponseType, text?: string) => void;
}) {
  const [showWontActInput, setShowWontActInput] = useState(false);
  const [wontActReason, setWontActReason] = useState('');

  const strengthLabel = tension.signalStrength === 'strong'
    ? `${tension.signalCount} contributors`
    : tension.signalStrength === 'emerging'
    ? 'Emerging pattern'
    : 'Single observation';

  const handleWontAct = () => {
    if (wontActReason.trim()) {
      onResponse('wont_act', wontActReason);
      setShowWontActInput(false);
    }
  };

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
              &quot;{phrase.replace(/^["']|["']$/g, '')}&quot;
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
        <div className="bg-[#2C2416] text-white px-5 py-4 rounded-lg mb-6">
          <p className="text-xs text-white/60 mb-1">Suggested action</p>
          <p className="text-sm">{tension.suggestedAction}</p>
        </div>
      )}

      {/* Response section */}
      <div className="pt-6 border-t border-[#E8E0D5]">
        {response ? (
          <div className="flex items-center gap-2">
            <ResponseBadge type={response.response_type} />
            {response.response_text && (
              <span className="text-xs text-[#6B5D4D]">: {response.response_text}</span>
            )}
          </div>
        ) : showWontActInput ? (
          <div className="space-y-3">
            <textarea
              value={wontActReason}
              onChange={(e) => setWontActReason(e.target.value)}
              placeholder="Why won't this be addressed?"
              className="w-full px-3 py-2 text-sm border border-[#E8E0D5] rounded-lg focus:outline-none focus:border-[#C9A962]"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleWontAct}
                disabled={!wontActReason.trim()}
                className="px-3 py-1.5 text-xs bg-[#2C2416] text-white rounded-full disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowWontActInput(false)}
                className="px-3 py-1.5 text-xs text-[#6B5D4D]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <ResponseButton
              label="Acknowledged"
              onClick={() => onResponse('acknowledged')}
            />
            <ResponseButton
              label="Action planned"
              onClick={() => onResponse('action_planned')}
              variant="primary"
            />
            <ResponseButton
              label="Needs discussion"
              onClick={() => onResponse('needs_discussion')}
            />
            <ResponseButton
              label="Won't act"
              onClick={() => setShowWontActInput(true)}
              variant="muted"
            />
          </div>
        )}
      </div>
    </article>
  );
}

function EmergingTensionCard({
  tension,
  response,
  onResponse,
}: {
  tension: Tension;
  response?: TensionResponse;
  onResponse: (type: ResponseType) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A962] mt-2.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-[#2C2416] font-medium">{tension.title}</p>
        <p className="text-[#6B5D4D] text-sm mt-1">{tension.synthesis}</p>
        <div className="mt-3">
          {response ? (
            <ResponseBadge type={response.response_type} small />
          ) : (
            <button
              onClick={() => onResponse('acknowledged')}
              className="text-xs text-[#8B7355] hover:text-[#2C2416] transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseButton({
  label,
  onClick,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'muted';
}) {
  const styles = {
    default: 'border-[#E8E0D5] text-[#6B5D4D] hover:border-[#C9A962] hover:text-[#2C2416]',
    primary: 'border-[#2C2416] bg-[#2C2416] text-white hover:bg-[#3D3425]',
    muted: 'border-[#E8E0D5] text-[#A09080] hover:text-[#6B5D4D]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border rounded-full transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function ResponseBadge({ type, small = false }: { type: ResponseType; small?: boolean }) {
  const labels: Record<ResponseType, { label: string; color: string }> = {
    acknowledged: { label: 'Acknowledged', color: 'bg-gray-100 text-gray-700' },
    action_planned: { label: 'Action planned', color: 'bg-green-100 text-green-700' },
    wont_act: { label: 'Won\'t act', color: 'bg-amber-100 text-amber-700' },
    needs_discussion: { label: 'Needs discussion', color: 'bg-blue-100 text-blue-700' },
  };

  const { label, color } = labels[type];

  return (
    <span className={`inline-flex items-center gap-1 ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'} rounded-full ${color}`}>
      {type === 'action_planned' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </span>
  );
}

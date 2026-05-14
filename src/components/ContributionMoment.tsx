'use client';

import { useState } from 'react';
import type { QuotePermission, ContributionCard } from '@/lib/supabase/types';

interface ContributionMomentProps {
  card: ContributionCard;
  defaultQuotePreference: QuotePermission;
  onContribute: (quotePermission: QuotePermission, attributedName?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContributionMoment({
  card,
  defaultQuotePreference,
  onContribute,
  onCancel,
  isLoading = false,
}: ContributionMomentProps) {
  const [showQuoteOptions, setShowQuoteOptions] = useState(false);
  const [quotePermission, setQuotePermission] = useState<QuotePermission>(defaultQuotePreference);
  const [attributedName, setAttributedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContribute = async () => {
    setIsSubmitting(true);
    try {
      await onContribute(
        quotePermission,
        quotePermission === 'attributed' ? attributedName : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const quoteLabels: Record<QuotePermission, { title: string; description: string }> = {
    anonymous: {
      title: 'Anonymous quotes OK',
      description: 'Your exact words may appear in The Read, without your name',
    },
    synthesize_only: {
      title: "Synthesize only — don't quote me",
      description: 'Your input shapes the narrative but won\'t be quoted directly',
    },
    attributed: {
      title: 'Attribute this contribution',
      description: 'Your name appears when your words are used',
    },
  };

  return (
    <div className="bg-[#F5F0E8] rounded-2xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg text-[#2C2416] font-medium mb-1">
          Share this with The Read?
        </h3>
        <p className="text-sm text-[#6B5D4D]">
          This is what leadership may see — your name will not be attached.
        </p>
      </div>

      {/* Contribution Card Preview */}
      <div className="mx-6 mb-4 bg-white rounded-xl border border-[#E8E0D5] overflow-hidden">
        <div className="p-4">
          <p className="text-[#2C2416] leading-relaxed">
            &ldquo;{card.summary}&rdquo;
          </p>
        </div>
        {card.themes.length > 0 && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {card.themes.map((theme) => (
              <span
                key={theme}
                className="px-2.5 py-1 bg-[#F5F0E8] rounded-full text-xs text-[#6B5D4D]"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quote Options (expandable) */}
      {!showQuoteOptions ? (
        <div className="px-6 pb-4">
          <button
            onClick={() => setShowQuoteOptions(true)}
            className="text-sm text-[#8B7355] hover:text-[#2C2416] transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Quote settings
          </button>
        </div>
      ) : (
        <div className="px-6 pb-4">
          <p className="text-sm text-[#6B5D4D] mb-3">How should this be used?</p>
          <div className="space-y-2">
            {(Object.keys(quoteLabels) as QuotePermission[]).map((permission) => (
              <label
                key={permission}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  quotePermission === permission
                    ? 'border-[#C9A962] bg-white'
                    : 'border-[#E8E0D5] bg-white/50 hover:border-[#C9A962]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="quotePermission"
                    value={permission}
                    checked={quotePermission === permission}
                    onChange={() => setQuotePermission(permission)}
                    className="mt-1 accent-[#C9A962]"
                  />
                  <div>
                    <p className="text-sm text-[#2C2416] font-medium">
                      {quoteLabels[permission].title}
                    </p>
                    <p className="text-xs text-[#6B5D4D]">
                      {quoteLabels[permission].description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Name input for attributed contributions */}
          {quotePermission === 'attributed' && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Your name as it should appear"
                value={attributedName}
                onChange={(e) => setAttributedName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E8E0D5] text-sm text-[#2C2416] placeholder-[#A09080] focus:outline-none focus:border-[#C9A962]"
              />
            </div>
          )}

          <button
            onClick={() => setShowQuoteOptions(false)}
            className="mt-3 text-sm text-[#8B7355] hover:text-[#2C2416] transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
          className="px-5 py-2.5 text-[#6B5D4D] hover:text-[#2C2416] transition-colors disabled:opacity-50"
        >
          Keep private
        </button>
        <button
          onClick={handleContribute}
          disabled={isSubmitting || isLoading || (quotePermission === 'attributed' && !attributedName.trim())}
          className="px-5 py-2.5 bg-[#2C2416] text-white rounded-full font-medium hover:bg-[#3D3425] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sharing...
            </>
          ) : (
            'Share'
          )}
        </button>
      </div>

      {/* Trust reminder */}
      <div className="px-6 pb-6 pt-2 border-t border-[#E8E0D5]">
        <p className="text-xs text-[#A09080] text-center">
          {quotePermission === 'attributed'
            ? 'Your name will be visible to leadership for this contribution.'
            : 'Your identity is never revealed to leadership.'}
        </p>
      </div>
    </div>
  );
}

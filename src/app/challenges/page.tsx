'use client';

import Link from 'next/link';
import { IconArrowRight, IconClock, IconCheck, IconPlus } from '@/components/ui/icons';
import { challenges, ideas } from '@/data/demo';

export default function ChallengesPage() {
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const upcomingChallenges = challenges.filter((c) => c.status === 'upcoming');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');

  const getChallengeIdeas = (challengeId: string) => {
    return ideas.filter((i) => i.challengeId === challengeId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-2">Challenges</h1>
        <p className="text-[var(--color-gray-600)]">
          Focused initiatives to gather ideas around specific topics. Your contributions make a difference.
        </p>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <section className="mb-12">
          <p className="pulse-label">Active Now</p>
          <div className="space-y-4">
            {activeChallenges.map((challenge) => {
              const challengeIdeas = getChallengeIdeas(challenge.id);
              const daysLeft = Math.ceil(
                (new Date(challenge.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={challenge.id}
                  className="p-6 bg-white rounded-2xl border-2 border-[var(--color-accent)] hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-accent)]/20 text-[var(--color-accent-dim)] rounded-full text-sm font-medium mb-3">
                        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
                        Active
                      </span>
                      <h2 className="text-xl font-semibold text-[var(--color-black)]">
                        {challenge.title}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-[var(--color-black)]">{daysLeft}</p>
                      <p className="text-sm text-[var(--color-gray-500)]">days left</p>
                    </div>
                  </div>

                  <p className="text-[var(--color-gray-600)] mb-6">
                    {challenge.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[var(--color-gray-100)]">
                    <div>
                      <p className="text-2xl font-semibold text-[var(--color-black)]">
                        {challenge.ideaCount}
                      </p>
                      <p className="text-sm text-[var(--color-gray-500)]">Ideas submitted</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-[var(--color-black)]">
                        {challenge.participantCount}
                      </p>
                      <p className="text-sm text-[var(--color-gray-500)]">Contributors</p>
                    </div>
                  </div>

                  {/* Recent Ideas in Challenge */}
                  {challengeIdeas.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-[var(--color-gray-500)] mb-3">
                        Recent contributions
                      </p>
                      <div className="space-y-2">
                        {challengeIdeas.slice(0, 2).map((idea) => (
                          <div
                            key={idea.id}
                            className="flex items-center gap-3 p-3 bg-[var(--color-gray-50)] rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-xs font-medium text-[var(--color-gray-600)]">
                              {idea.contributor.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--color-black)] truncate">
                                {idea.summary}
                              </p>
                              <p className="text-xs text-[var(--color-gray-500)]">
                                by {idea.contributor.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href="/submit"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-accent)] rounded-xl text-[var(--color-black)] font-medium hover:bg-[var(--color-accent-dim)] transition-colors"
                  >
                    <IconPlus size={18} />
                    Share Your Idea
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <section className="mb-12">
          <p className="pulse-label">Coming Soon</p>
          <div className="space-y-4">
            {upcomingChallenges.map((challenge) => {
              const startsIn = Math.ceil(
                (new Date(challenge.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={challenge.id}
                  className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)] opacity-75"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-gray-100)] text-[var(--color-gray-500)] rounded-full text-sm font-medium mb-3">
                        <IconClock size={14} />
                        Upcoming
                      </span>
                      <h2 className="text-lg font-semibold text-[var(--color-black)]">
                        {challenge.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-[var(--color-gray-600)]">
                    {challenge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Info */}
      <div className="p-6 bg-[var(--color-gray-50)] rounded-2xl border border-[var(--color-gray-200)]">
        <h3 className="font-semibold text-[var(--color-black)] mb-2">How Challenges Work</h3>
        <ul className="space-y-2 text-[var(--color-gray-600)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-accent)]">1.</span>
            Challenges are time-boxed initiatives around specific themes or problems
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-accent)]">2.</span>
            Share your ideas before the deadline — all contributions are attributed to you
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-accent)]">3.</span>
            Ideas are synthesized and connected to surface patterns and insights
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-accent)]">4.</span>
            The best ideas get implemented — and you get the credit
          </li>
        </ul>
      </div>
    </div>
  );
}

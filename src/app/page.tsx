'use client';

import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock } from '@/components/ui/icons';
import { pulseSynthesis, themes, ideas, challenges, company } from '@/data/demo';

export default function PulsePage() {
  const { headline, keyInsight, emergingThemes, tensions, recommendedActions, stats } = pulseSynthesis;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Date & Context */}
      <div className="mb-8">
        <p className="text-sm text-[var(--color-gray-500)]">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })} · {company.name}
        </p>
      </div>

      {/* Main Headline */}
      <section className="mb-16">
        <h1 className="pulse-headline text-balance mb-6">
          {headline}
        </h1>
        <p className="text-xl text-[var(--color-gray-600)] leading-relaxed max-w-3xl">
          {keyInsight}
        </p>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-4 gap-4 mb-16 p-6 bg-white rounded-2xl border border-[var(--color-gray-200)]">
        <div>
          <p className="text-3xl font-medium text-[var(--color-black)]">{stats.totalIdeas}</p>
          <p className="text-sm text-[var(--color-gray-500)]">Total ideas</p>
        </div>
        <div>
          <p className="text-3xl font-medium text-[var(--color-success)]">+{stats.newThisWeek}</p>
          <p className="text-sm text-[var(--color-gray-500)]">This week</p>
        </div>
        <div>
          <p className="text-3xl font-medium text-[var(--color-black)]">{stats.activeContributors}</p>
          <p className="text-sm text-[var(--color-gray-500)]">Contributors</p>
        </div>
        <div>
          <p className="text-3xl font-medium text-[var(--color-accent)]">{stats.implementedThisMonth}</p>
          <p className="text-sm text-[var(--color-gray-500)]">Implemented</p>
        </div>
      </section>

      {/* Emerging Themes */}
      <section className="mb-16">
        <p className="pulse-label">Emerging Themes</p>
        <div className="space-y-4">
          {emergingThemes.map((item, index) => (
            <div
              key={item.theme.id}
              className="p-6 bg-white rounded-2xl border border-[var(--color-gray-200)] card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`theme-pill ${item.theme.color}`}>
                    {item.theme.name}
                  </span>
                  <span className="text-sm text-[var(--color-gray-500)]">
                    {item.theme.ideaCount} ideas
                  </span>
                  {item.momentum === 'strong' && (
                    <span className="text-xs px-2 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full">
                      Strong momentum
                    </span>
                  )}
                  {item.momentum === 'growing' && (
                    <span className="text-xs px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent-dim)] rounded-full">
                      Growing
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[var(--color-gray-700)] mb-4">
                {item.insight}
              </p>

              {/* Contributors */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {item.contributors.slice(0, 4).map((contributor) => (
                    <div
                      key={contributor.id}
                      className="w-8 h-8 rounded-full bg-[var(--color-gray-200)] border-2 border-white flex items-center justify-center text-xs font-medium text-[var(--color-gray-600)]"
                      title={contributor.name}
                    >
                      {contributor.avatar}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[var(--color-gray-500)]">
                  {item.contributors.map(c => c.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tensions */}
      {tensions.length > 0 && (
        <section className="mb-16">
          <p className="pulse-label">Tensions to Watch</p>
          {tensions.map((tension, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-2xl border-l-4 border-l-[var(--color-warning)] border border-[var(--color-gray-200)]"
            >
              <h3 className="text-lg font-medium text-[var(--color-black)] mb-2">
                {tension.title}
              </h3>
              <p className="text-[var(--color-gray-600)]">
                {tension.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Recommended Actions */}
      <section className="mb-16">
        <p className="pulse-label">Recommended Actions</p>
        <div className="space-y-3">
          {recommendedActions.map((action, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)] transition-colors cursor-pointer"
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${action.priority === 'high'
                  ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                  : 'bg-[var(--color-gray-100)] text-[var(--color-gray-500)]'
                }
              `}>
                {action.priority === 'high' ? '!' : <IconClock size={16} />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--color-black)] mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {action.description}
                </p>
              </div>
              <IconArrowRight size={20} className="text-[var(--color-gray-400)]" />
            </div>
          ))}
        </div>
      </section>

      {/* Active Challenges */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <p className="pulse-label mb-0">Active Challenges</p>
          <Link href="/challenges" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-black)]">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {challenges.filter(c => c.status === 'active').map((challenge) => (
            <div
              key={challenge.id}
              className="p-5 bg-white rounded-xl border border-[var(--color-gray-200)] hover:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <h4 className="font-medium text-[var(--color-black)] mb-2">
                {challenge.title}
              </h4>
              <p className="text-sm text-[var(--color-gray-500)] mb-4 line-clamp-2">
                {challenge.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-gray-500)]">
                  {challenge.ideaCount} ideas · {challenge.participantCount} contributors
                </span>
                <span className="text-[var(--color-gray-400)]">
                  Due {new Date(challenge.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Ideas with Attribution */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="pulse-label mb-0">Recent Ideas</p>
          <Link href="/ideas" className="text-sm text-[var(--color-gray-500)] hover:text-[var(--color-black)]">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {ideas.slice(0, 5).map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-[var(--color-gray-200)] hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              {/* Contributor Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)] flex-shrink-0"
                title={idea.contributor.name}
              >
                {idea.contributor.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[var(--color-black)]">
                    {idea.contributor.name}
                  </span>
                  <span className="text-sm text-[var(--color-gray-400)]">
                    {idea.contributor.role}
                  </span>
                </div>
                <p className="text-[var(--color-gray-700)] mb-3 line-clamp-2">
                  {idea.summary}
                </p>
                <div className="flex items-center gap-3">
                  {idea.themes.map((theme) => (
                    <span key={theme} className="theme-pill text-xs">
                      {theme}
                    </span>
                  ))}
                  <span className="text-xs text-[var(--color-gray-400)]">
                    {idea.reactions.helpful} found helpful
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {idea.status === 'implemented' && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                    <IconCheck size={14} /> Implemented
                  </span>
                )}
                {idea.status === 'building' && (
                  <span className="text-xs px-2 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full">
                    Building
                  </span>
                )}
                {idea.status === 'validating' && (
                  <span className="text-xs px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent-dim)] rounded-full">
                    Validating
                  </span>
                )}
                {idea.status === 'exploring' && (
                  <span className="text-xs px-2 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full">
                    Exploring
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

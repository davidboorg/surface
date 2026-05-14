'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconCheck, IconClock, IconSearch } from '@/components/ui/icons';
import { ideas, themes, employees } from '@/data/demo';

type StatusFilter = 'all' | 'new' | 'exploring' | 'validating' | 'building' | 'implemented' | 'parked';
type SortOption = 'recent' | 'helpful' | 'similar';

export default function IdeasPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter((idea) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          idea.summary.toLowerCase().includes(searchLower) ||
          idea.content.toLowerCase().includes(searchLower) ||
          idea.contributor.name.toLowerCase().includes(searchLower) ||
          idea.themes.some((t) => t.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && idea.status !== statusFilter) return false;

      // Theme filter
      if (themeFilter !== 'all' && !idea.themes.includes(themeFilter)) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.reactions.helpful - a.reactions.helpful;
        case 'similar':
          return b.reactions.similar - a.reactions.similar;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const statusOptions: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: ideas.length },
    { value: 'new', label: 'New', count: ideas.filter((i) => i.status === 'new').length },
    { value: 'exploring', label: 'Exploring', count: ideas.filter((i) => i.status === 'exploring').length },
    { value: 'validating', label: 'Validating', count: ideas.filter((i) => i.status === 'validating').length },
    { value: 'building', label: 'Building', count: ideas.filter((i) => i.status === 'building').length },
    { value: 'implemented', label: 'Implemented', count: ideas.filter((i) => i.status === 'implemented').length },
    { value: 'parked', label: 'Parked', count: ideas.filter((i) => i.status === 'parked').length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-2">Idea Bank</h1>
        <p className="text-[var(--color-gray-600)]">
          {ideas.length} ideas from {employees.length} contributors across the organization
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
          <input
            type="text"
            placeholder="Search ideas, contributors, or themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--color-gray-200)] rounded-xl text-[var(--color-black)] placeholder:text-[var(--color-gray-400)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-gray-100)] rounded-lg">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${statusFilter === option.value
                    ? 'bg-white text-[var(--color-black)] shadow-sm'
                    : 'text-[var(--color-gray-600)] hover:text-[var(--color-black)]'
                  }
                `}
              >
                {option.label}
                <span className="ml-1.5 text-[var(--color-gray-400)]">{option.count}</span>
              </button>
            ))}
          </div>

          {/* Theme Filter */}
          <select
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-[var(--color-gray-200)] rounded-lg text-sm text-[var(--color-gray-700)] focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">All Themes</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.name}>
                {theme.name} ({theme.ideaCount})
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-white border border-[var(--color-gray-200)] rounded-lg text-sm text-[var(--color-gray-700)] focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="similar">Most Similar</option>
          </select>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--color-gray-200)]">
            <p className="text-[var(--color-gray-500)]">No ideas match your filters</p>
          </div>
        ) : (
          filteredIdeas.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="block p-6 bg-white rounded-2xl border border-[var(--color-gray-200)] hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              {/* Header with Contributor */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-semibold text-[var(--color-gray-600)] flex-shrink-0"
                  title={idea.contributor.name}
                >
                  {idea.contributor.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--color-black)]">
                      {idea.contributor.name}
                    </span>
                    <span className="text-sm text-[var(--color-gray-400)]">·</span>
                    <span className="text-sm text-[var(--color-gray-500)]">
                      {idea.contributor.role}
                    </span>
                    <span className="text-sm text-[var(--color-gray-400)]">·</span>
                    <span className="text-sm text-[var(--color-gray-400)]">
                      {idea.contributor.department}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-gray-400)]">
                    {new Date(idea.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {idea.status === 'implemented' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full text-sm font-medium">
                      <IconCheck size={14} /> Implemented
                    </span>
                  )}
                  {idea.status === 'building' && (
                    <span className="px-3 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full text-sm font-medium">
                      Building
                    </span>
                  )}
                  {idea.status === 'validating' && (
                    <span className="px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent-dim)] rounded-full text-sm font-medium">
                      Validating
                    </span>
                  )}
                  {idea.status === 'exploring' && (
                    <span className="px-3 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full text-sm font-medium">
                      Exploring
                    </span>
                  )}
                  {idea.status === 'new' && (
                    <span className="px-3 py-1 bg-[var(--color-gray-100)] text-[var(--color-gray-600)] rounded-full text-sm font-medium">
                      New
                    </span>
                  )}
                  {idea.status === 'parked' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-[var(--color-gray-100)] text-[var(--color-gray-400)] rounded-full text-sm font-medium">
                      <IconClock size={14} /> Parked
                    </span>
                  )}
                </div>
              </div>

              {/* Idea Content */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-[var(--color-black)] mb-2">
                  {idea.summary}
                </h3>
                <p className="text-[var(--color-gray-600)] leading-relaxed">
                  {idea.content}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-gray-100)]">
                {/* Themes */}
                <div className="flex items-center gap-2">
                  {idea.themes.map((theme) => {
                    const themeData = themes.find((t) => t.name === theme);
                    return (
                      <span
                        key={theme}
                        className={`theme-pill text-xs ${themeData?.color || ''}`}
                      >
                        {theme}
                      </span>
                    );
                  })}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-4 text-sm text-[var(--color-gray-500)]">
                  <span>{idea.reactions.helpful} found helpful</span>
                  {idea.reactions.similar > 0 && (
                    <span>{idea.reactions.similar} similar ideas</span>
                  )}
                  {idea.relatedIdeas && idea.relatedIdeas.length > 0 && (
                    <span className="text-[var(--color-accent-dim)]">
                      {idea.relatedIdeas.length} related
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 p-6 bg-white rounded-2xl border border-[var(--color-gray-200)]">
        <h2 className="text-lg font-semibold text-[var(--color-black)] mb-4">Contribution Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {employees.slice(0, 8).map((emp) => {
            const empIdeas = ideas.filter((i) => i.contributor.id === emp.id);
            const implemented = empIdeas.filter((i) => i.status === 'implemented').length;
            return (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)]">
                  {emp.avatar}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-black)] text-sm">{emp.name}</p>
                  <p className="text-xs text-[var(--color-gray-500)]">
                    {empIdeas.length} ideas{implemented > 0 && ` · ${implemented} implemented`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock, IconPlus, IconSearch } from '@/components/ui/icons';
import { ideas, themes, employees, type Idea, type Employee } from '@/data/demo';

const STATUS_CONFIG: Record<Idea['status'], { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-[var(--color-gray-600)]', bg: 'bg-[var(--color-gray-100)]' },
  exploring: { label: 'Exploring', color: 'text-[var(--color-info)]', bg: 'bg-[var(--color-info)]/10' },
  validating: { label: 'Validating', color: 'text-[var(--color-accent-dim)]', bg: 'bg-[var(--color-accent)]/10' },
  building: { label: 'Building', color: 'text-[var(--color-info)]', bg: 'bg-[var(--color-info)]/10' },
  implemented: { label: 'Implemented', color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success)]/10' },
  parked: { label: 'Parked', color: 'text-[var(--color-gray-400)]', bg: 'bg-[var(--color-gray-100)]' },
};

const LIFECYCLE_STAGES: Idea['status'][] = ['new', 'exploring', 'validating', 'building', 'implemented'];

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [liveResearch, setLiveResearch] = useState<typeof ideas[0]['research']>([]);

  const idea = ideas.find((i) => i.id === params.id);

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-black)] mb-4">Idea not found</h1>
        <Link href="/ideas" className="text-[var(--color-accent-dim)] hover:underline">
          Back to Ideas
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[idea.status];
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(idea.status);
  const isParked = idea.status === 'parked';

  const handleJoin = async () => {
    setIsJoining(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsJoining(false);
    setShowJoinSuccess(true);
    setTimeout(() => setShowJoinSuccess(false), 3000);
  };

  const handleResearch = async () => {
    if (!idea) return;
    setIsResearching(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          ideaSummary: idea.summary,
          ideaContent: idea.content,
          themes: idea.themes,
          industry: 'healthcare technology', // From demo company
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiveResearch(data.research.map((r: { id: string; type: string; title: string; body: string; source?: string; sourceUrl?: string }) => ({
          ...r,
          createdAt: new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Research error:', error);
    }

    setIsResearching(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // In real app, this would post to API
    setNewComment('');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Back Link */}
      <Link
        href="/ideas"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-gray-500)] hover:text-[var(--color-black)] mb-6"
      >
        ← Back to Ideas
      </Link>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            {/* Status & Themes */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                {statusConfig.label}
              </span>
              {idea.themes.map((theme) => {
                const themeData = themes.find((t) => t.name === theme);
                return (
                  <span key={theme} className={`theme-pill text-xs ${themeData?.color || ''}`}>
                    {theme}
                  </span>
                );
              })}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-[var(--color-black)] mb-4">
              {idea.summary}
            </h1>

            {/* Original Content */}
            <p className="text-[var(--color-gray-600)] leading-relaxed mb-6">
              "{idea.content}"
            </p>

            {/* Contributor */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-gray-100)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)]">
                {idea.contributor.avatar}
              </div>
              <div>
                <p className="font-medium text-[var(--color-black)]">{idea.contributor.name}</p>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {idea.contributor.role} · {idea.contributor.department}
                </p>
              </div>
              <span className="ml-auto text-sm text-[var(--color-gray-400)]">
                {new Date(idea.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Lifecycle Progress */}
          {!isParked && (
            <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-black)] mb-4">Lifecycle</h2>
              <div className="flex items-center gap-2">
                {LIFECYCLE_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const stageConfig = STATUS_CONFIG[stage];

                  return (
                    <div key={stage} className="flex-1 flex items-center">
                      <div
                        className={`
                          flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium
                          ${isCompleted ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : ''}
                          ${isCurrent ? `${stageConfig.bg} ${stageConfig.color}` : ''}
                          ${!isCompleted && !isCurrent ? 'bg-[var(--color-gray-50)] text-[var(--color-gray-400)]' : ''}
                        `}
                      >
                        {isCompleted && <IconCheck size={14} className="mr-1" />}
                        {stageConfig.label}
                      </div>
                      {index < LIFECYCLE_STAGES.length - 1 && (
                        <div className={`w-4 h-0.5 mx-1 ${index < currentStageIndex ? 'bg-[var(--color-success)]' : 'bg-[var(--color-gray-200)]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {idea.nextStep && (
                <div className="mt-4 p-3 bg-[var(--color-gray-50)] rounded-lg">
                  <p className="text-sm text-[var(--color-gray-500)]">Next step:</p>
                  <p className="text-[var(--color-black)]">{idea.nextStep}</p>
                </div>
              )}

              {idea.validationScore !== undefined && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-gray-500)] mb-1">Validation Score</p>
                    <div className="h-2 bg-[var(--color-gray-100)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-success)] rounded-full transition-all"
                        style={{ width: `${idea.validationScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-semibold text-[var(--color-black)]">
                    {idea.validationScore}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Research & Validation */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-black)]">Research & Validation</h2>
              <button
                onClick={handleResearch}
                disabled={isResearching}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] rounded-lg text-sm font-medium text-[var(--color-black)] transition-colors disabled:opacity-50"
              >
                <IconSearch size={16} />
                {isResearching ? 'Researching...' : 'Run AI Research'}
              </button>
            </div>

            {(idea.research && idea.research.length > 0) || liveResearch.length > 0 ? (
              <div className="space-y-4">
                {[...(idea.research || []), ...liveResearch].map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      item.type === 'validation'
                        ? 'border-l-[var(--color-success)] bg-[var(--color-success)]/5'
                        : item.type === 'risk'
                        ? 'border-l-[var(--color-error)] bg-[var(--color-error)]/5'
                        : 'border-l-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium uppercase text-[var(--color-gray-500)]">
                        {item.type}
                      </span>
                      {item.source && (
                        <>
                          <span className="text-[var(--color-gray-300)]">·</span>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--color-accent-dim)] hover:underline"
                          >
                            {item.source}
                          </a>
                        </>
                      )}
                    </div>
                    <h3 className="font-medium text-[var(--color-black)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--color-gray-600)]">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--color-gray-500)]">
                <p className="mb-2">No research yet</p>
                <p className="text-sm">Click "Run AI Research" to validate this idea with market data and competitor analysis</p>
              </div>
            )}
          </div>

          {/* Discussion */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-black)] mb-4">Discussion</h2>

            {idea.comments && idea.comments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {idea.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-xs font-medium text-[var(--color-gray-600)] flex-shrink-0">
                      {comment.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[var(--color-black)]">{comment.author.name}</span>
                        <span className="text-xs text-[var(--color-gray-400)]">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--color-gray-600)]">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-gray-500)] mb-6">No comments yet. Be the first to contribute!</p>
            )}

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-xs font-medium text-[var(--color-gray-600)] flex-shrink-0">
                SL
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your thoughts..."
                  className="flex-1 px-4 py-2 bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] rounded-xl text-[var(--color-black)] placeholder:text-[var(--color-gray-400)] focus:outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-[var(--color-black)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-gray-800)] transition-colors disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join Team */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            <h3 className="font-semibold text-[var(--color-black)] mb-4">Join This Idea</h3>
            <p className="text-sm text-[var(--color-gray-600)] mb-4">
              Want to help make this happen? Join the team and contribute.
            </p>
            {showJoinSuccess ? (
              <div className="flex items-center gap-2 text-[var(--color-success)]">
                <IconCheck size={18} />
                <span className="font-medium">You've joined the team!</span>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-accent)] rounded-xl text-[var(--color-black)] font-medium hover:bg-[var(--color-accent-dim)] transition-colors disabled:opacity-50"
              >
                <IconPlus size={18} />
                {isJoining ? 'Joining...' : 'I Want to Be Part of This'}
              </button>
            )}
          </div>

          {/* Team */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            <h3 className="font-semibold text-[var(--color-black)] mb-4">Team</h3>
            <div className="space-y-3">
              {/* Original Contributor */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-sm font-medium text-[var(--color-accent-dim)]">
                  {idea.contributor.avatar}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-black)]">{idea.contributor.name}</p>
                  <p className="text-xs text-[var(--color-gray-500)]">Original contributor</p>
                </div>
              </div>

              {/* Team Members */}
              {idea.team?.filter((m) => m.id !== idea.contributor.id).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)]">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-black)]">{member.name}</p>
                    <p className="text-xs text-[var(--color-gray-500)]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
            <h3 className="font-semibold text-[var(--color-black)] mb-4">Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Found helpful</span>
                <span className="font-medium text-[var(--color-black)]">{idea.reactions.helpful}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Similar ideas</span>
                <span className="font-medium text-[var(--color-black)]">{idea.reactions.similar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Team members</span>
                <span className="font-medium text-[var(--color-black)]">{idea.team?.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-gray-600)]">Comments</span>
                <span className="font-medium text-[var(--color-black)]">{idea.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Related Ideas */}
          {idea.relatedIdeas && idea.relatedIdeas.length > 0 && (
            <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6">
              <h3 className="font-semibold text-[var(--color-black)] mb-4">Related Ideas</h3>
              <div className="space-y-3">
                {idea.relatedIdeas.map((relatedId) => {
                  const related = ideas.find((i) => i.id === relatedId);
                  if (!related) return null;
                  return (
                    <Link
                      key={relatedId}
                      href={`/ideas/${relatedId}`}
                      className="block p-3 bg-[var(--color-gray-50)] rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
                    >
                      <p className="text-sm font-medium text-[var(--color-black)] line-clamp-2">
                        {related.summary}
                      </p>
                      <p className="text-xs text-[var(--color-gray-500)] mt-1">
                        by {related.contributor.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Navigation */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
            <span className="text-white font-medium">S</span>
          </div>
          <span className="text-xl text-[#2C2416] font-medium">Surface</span>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/read" className="text-[#6B5D4D] hover:text-[#2C2416] transition-colors">
            The Read
          </Link>
          <Link
            href="/companion"
            className="px-5 py-2.5 bg-[#2C2416] text-white rounded-full hover:bg-[#3D3425] transition-colors"
          >
            Start contributing
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-light text-[#2C2416] leading-tight mb-8">
            The easiest way for intelligence inside organizations to surface.
          </h1>
          <p className="text-xl text-[#6B5D4D] leading-relaxed mb-12 max-w-2xl">
            Most organizations already contain enormous amounts of intelligence, insight,
            and opportunity. The problem is friction. Surface removes it.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/companion"
              className="px-8 py-4 bg-[#2C2416] text-white rounded-full text-lg hover:bg-[#3D3425] transition-colors"
            >
              Try the companion
            </Link>
            <Link
              href="/read"
              className="px-8 py-4 text-[#2C2416] rounded-full text-lg border border-[#E8E0D5] hover:border-[#C9A962] transition-colors"
            >
              See The Read
            </Link>
          </div>
        </div>
      </main>

      {/* The problem */}
      <section className="bg-[#2C2416] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-[#C9A962] text-sm uppercase tracking-wider mb-4">The problem</p>
            <h2 className="text-3xl md:text-4xl text-white font-light leading-tight mb-8">
              Ideas die inside organizations every day.
            </h2>
            <p className="text-xl text-white/70 leading-relaxed mb-8">
              They die in Slack threads. In meeting notes nobody reads. In decks that get archived.
              In hallway conversations that evaporate. In voice notes that go unheard.
            </p>
            <p className="text-xl text-white/70 leading-relaxed">
              Not because they&apos;re bad ideas. Because organizations create friction
              around expressing them.
            </p>
          </div>
        </div>
      </section>

      {/* Two parts */}
      <section className="py-24 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#8B7355] text-sm uppercase tracking-wider mb-4">The solution</p>
          <h2 className="text-3xl md:text-4xl text-[#2C2416] font-light leading-tight mb-16 max-w-2xl">
            An AI-native system for organizational intelligence.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Companion */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl text-[#2C2416] mb-4">The Companion</h3>
              <p className="text-[#6B5D4D] leading-relaxed mb-6">
                Contributing intelligence should feel lighter than sending a Slack message.
                The Companion is a warm AI that helps you articulate observations, frustrations,
                and opportunities through natural conversation.
              </p>
              <p className="text-[#A09080] text-sm">
                Type, speak, or share screenshots. The AI helps clarify and connect.
              </p>
            </div>

            {/* The Read */}
            <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl text-[#2C2416] mb-4">The Read</h3>
              <p className="text-[#6B5D4D] leading-relaxed mb-6">
                Leadership doesn&apos;t need another dashboard. They need to understand what the
                organization is trying to tell them. The Read synthesizes signals into
                narrative intelligence, delivered weekly.
              </p>
              <p className="text-[#A09080] text-sm">
                Recurring tensions. Emerging patterns. Blind spots. Recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Not this */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#8B7355] text-sm uppercase tracking-wider mb-4">What we&apos;re not</p>
            <h2 className="text-3xl md:text-4xl text-[#2C2416] font-light leading-tight mb-8">
              Not another idea management platform.
            </h2>
            <p className="text-lg text-[#6B5D4D] leading-relaxed mb-12">
              We&apos;re not building submission workflows, voting systems, governance layers,
              or innovation portfolios. The market is full of those. Surface is something different.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4">
                <p className="text-[#A09080] line-through mb-2">Submission forms</p>
                <p className="text-[#2C2416]">Natural conversation</p>
              </div>
              <div className="p-4">
                <p className="text-[#A09080] line-through mb-2">Dashboards</p>
                <p className="text-[#2C2416]">Narrative synthesis</p>
              </div>
              <div className="p-4">
                <p className="text-[#A09080] line-through mb-2">Voting systems</p>
                <p className="text-[#2C2416]">Pattern recognition</p>
              </div>
              <div className="p-4">
                <p className="text-[#A09080] line-through mb-2">Workflows</p>
                <p className="text-[#2C2416]">Organic surfacing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The feeling */}
      <section className="py-24 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-[#8B7355] text-sm uppercase tracking-wider mb-4">The feeling</p>
            <h2 className="text-3xl md:text-4xl text-[#2C2416] font-light leading-tight mb-8">
              &ldquo;Like sending a voice note to a very smart, kind colleague.&rdquo;
            </h2>
            <p className="text-xl text-[#6B5D4D] leading-relaxed mb-8">
              Innovation is emotional. If the tool feels corporate, bureaucratic, or evaluative,
              people stop contributing. Surface is designed to feel warm, human, and safe.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Immediate', 'Warm', 'Low-pressure', 'Intelligent', 'Forgiving', 'Conversational'].map((word) => (
                <span
                  key={word}
                  className="px-4 py-2 bg-white border border-[#E8E0D5] rounded-full text-[#6B5D4D]"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#2C2416]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl text-white font-light leading-tight mb-8">
            Let intelligence surface.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/companion"
              className="px-8 py-4 bg-white text-[#2C2416] rounded-full text-lg hover:bg-[#F5F0E8] transition-colors"
            >
              Try the companion
            </Link>
            <Link
              href="/read"
              className="px-8 py-4 text-white rounded-full text-lg border border-white/30 hover:border-white/60 transition-colors"
            >
              See The Read
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#FFFBF5] border-t border-[#E8E0D5]">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
              <span className="text-white text-sm font-medium">S</span>
            </div>
            <span className="text-[#2C2416] font-medium">Surface</span>
          </div>
          <p className="text-sm text-[#A09080]">
            AI-native organizational intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}

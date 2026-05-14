'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconSignal, IconGraph, IconBoard, IconPlus, IconDecisions } from '@/components/ui/icons';
import { company } from '@/data/demo';

const navigation = [
  { name: 'Pulse', href: '/', icon: IconSignal },
  { name: 'Ideas', href: '/ideas', icon: IconBoard },
  { name: 'Challenges', href: '/challenges', icon: IconDecisions },
  { name: 'Graph', href: '/graph', icon: IconGraph },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-cream)]/95 backdrop-blur-sm border-b border-[var(--color-gray-200)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Company */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--color-black)]">S</span>
                </div>
                <span className="font-semibold text-[var(--color-black)]">Surface</span>
              </Link>
              <div className="h-6 w-px bg-[var(--color-gray-200)]" />
              <span className="text-sm text-[var(--color-gray-500)]">{company.name}</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-[var(--color-black)] text-white'
                        : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)]'
                      }
                    `}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/submit"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-black)] text-sm font-medium hover:bg-[var(--color-accent-dim)] transition-colors"
              >
                <IconPlus size={18} />
                Share idea
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}

// In-memory store for signals
// In production, this would be a database

import { Signal, Tension, PulseEntry, Contributor } from '@/data/intelligence';

// Demo contributors
const contributors: Contributor[] = [
  { id: 'c1', name: 'Sara Lindqvist', role: 'Customer Success Lead', department: 'Customer Success' },
  { id: 'c2', name: 'Erik Bergman', role: 'Senior Product Designer', department: 'Product' },
  { id: 'c3', name: 'Maria Johansson', role: 'Support Engineer', department: 'Support' },
  { id: 'c4', name: 'Johan Nilsson', role: 'Sales Director', department: 'Sales' },
  { id: 'c5', name: 'Emma Karlsson', role: 'Engineering Manager', department: 'Engineering' },
];

// Seed with some demo signals
const seedSignals: Signal[] = [
  {
    id: 's-seed-1',
    content: 'Customers always seem confused during onboarding. Had three calls this week where they didn\'t understand what to do first.',
    refinedInsight: 'Recurring onboarding confusion indicating unclear first-value-moment communication',
    type: 'text',
    contributor: contributors[0],
    createdAt: '2024-01-15T09:23:00Z',
    themes: ['Onboarding', 'Customer Confusion'],
    emotionalMarkers: ['frustration', 'repetition'],
  },
  {
    id: 's-seed-2',
    content: 'The design team never knows what engineering is building until it\'s almost done. We keep getting surprised by features that don\'t match the designs.',
    refinedInsight: 'Cross-functional visibility gap between design and engineering',
    type: 'text',
    contributor: contributors[1],
    createdAt: '2024-01-14T14:20:00Z',
    themes: ['Cross-team Communication', 'Process Gap'],
    emotionalMarkers: ['surprise', 'frustration'],
  },
  {
    id: 's-seed-3',
    content: 'Lost two deals this month because prospects couldn\'t understand our pricing page. One said "I gave up trying to figure out which plan I need."',
    refinedInsight: 'Pricing complexity causing deal loss',
    type: 'text',
    contributor: contributors[3],
    createdAt: '2024-01-13T16:00:00Z',
    themes: ['Pricing', 'Conversion'],
    emotionalMarkers: ['loss', 'frustration'],
  },
];

// The store
class SignalStore {
  private signals: Signal[] = [...seedSignals];
  private cachedPulse: PulseEntry | null = null;
  private pulseGeneratedAt: Date | null = null;

  // Get all signals
  getSignals(): Signal[] {
    return [...this.signals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Add a new signal
  addSignal(signal: Omit<Signal, 'id' | 'createdAt'>): Signal {
    const newSignal: Signal = {
      ...signal,
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.signals.push(newSignal);
    this.cachedPulse = null; // Invalidate pulse cache
    return newSignal;
  }

  // Get signal count
  getSignalCount(): number {
    return this.signals.length;
  }

  // Get unique departments
  getDepartments(): string[] {
    return [...new Set(this.signals.map(s => s.contributor.department))];
  }

  // Get cached pulse
  getCachedPulse(): PulseEntry | null {
    return this.cachedPulse;
  }

  // Set cached pulse
  setCachedPulse(pulse: PulseEntry): void {
    this.cachedPulse = pulse;
    this.pulseGeneratedAt = new Date();
  }

  // Check if pulse needs refresh (older than 5 minutes or new signals added)
  needsPulseRefresh(): boolean {
    if (!this.cachedPulse || !this.pulseGeneratedAt) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.pulseGeneratedAt < fiveMinutesAgo;
  }

  // Get random contributor for demo
  getRandomContributor(): Contributor {
    return contributors[Math.floor(Math.random() * contributors.length)];
  }
}

// Singleton instance
export const signalStore = new SignalStore();

// Surface: Organizational Intelligence Data Model
// This is NOT idea management. This is organizational cognition infrastructure.

export interface Contributor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

export interface Signal {
  id: string;
  // Raw intelligence input
  content: string;
  // AI-refined summary
  refinedInsight?: string;
  // Input type
  type: 'text' | 'voice' | 'image' | 'document';
  // Who contributed
  contributor: Contributor;
  // When
  createdAt: string;
  // AI-detected themes
  themes: string[];
  // Emotional markers detected by AI
  emotionalMarkers?: string[];
  // Related tensions this feeds into
  tensionIds?: string[];
  // Conversation thread with AI
  conversation?: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface Tension {
  id: string;
  // Core tension description
  title: string;
  // Synthesized understanding
  synthesis: string;
  // Departments observing this
  observedAcross: string[];
  // Momentum indicator
  momentum: 'emerging' | 'growing' | 'sustained' | 'declining';
  // Emotional intensity
  intensity: 'low' | 'moderate' | 'high' | 'critical';
  // Most repeated phrases from contributors
  repeatedPhrases: string[];
  // Contributing signals
  signalCount: number;
  // First observed
  firstObserved: string;
  // Last signal
  lastSignal: string;
  // Leadership blind spot analysis
  blindSpot?: string;
  // Suggested action
  suggestedAction?: string;
  // Related tensions
  relatedTensionIds?: string[];
}

export interface PulseEntry {
  id: string;
  // Generated timestamp
  generatedAt: string;
  // Period covered
  periodStart: string;
  periodEnd: string;
  // Top tensions
  topTensions: Tension[];
  // Emerging patterns
  emergingPatterns: string[];
  // Organizational mood
  mood: {
    overall: 'optimistic' | 'concerned' | 'frustrated' | 'energized' | 'uncertain';
    shifts: string[];
  };
  // Narrative synthesis
  narrative: string;
  // What leadership might be missing
  blindSpots: string[];
  // Recommended focus areas
  recommendations: string[];
}

// Demo data representing organizational intelligence
export const contributors: Contributor[] = [
  {
    id: 'c1',
    name: 'Sara Lindqvist',
    role: 'Customer Success Lead',
    department: 'Customer Success',
  },
  {
    id: 'c2',
    name: 'Erik Bergman',
    role: 'Senior Product Designer',
    department: 'Product',
  },
  {
    id: 'c3',
    name: 'Maria Johansson',
    role: 'Support Engineer',
    department: 'Support',
  },
  {
    id: 'c4',
    name: 'Johan Nilsson',
    role: 'Sales Director',
    department: 'Sales',
  },
  {
    id: 'c5',
    name: 'Emma Karlsson',
    role: 'Engineering Manager',
    department: 'Engineering',
  },
  {
    id: 'c6',
    name: 'Anders Svensson',
    role: 'Account Executive',
    department: 'Sales',
  },
];

export const signals: Signal[] = [
  {
    id: 's1',
    content: 'Customers always seem confused during onboarding. Had three calls this week where they didn\'t understand what to do first.',
    refinedInsight: 'Recurring onboarding confusion indicating unclear first-value-moment communication',
    type: 'text',
    contributor: contributors[0],
    createdAt: '2024-01-15T09:23:00Z',
    themes: ['Onboarding', 'Customer Confusion', 'First Value Moment'],
    emotionalMarkers: ['frustration', 'repetition'],
    tensionIds: ['t1'],
    conversation: [
      {
        id: 'conv1-1',
        role: 'user',
        content: 'Customers always seem confused during onboarding. Had three calls this week where they didn\'t understand what to do first.',
        timestamp: '2024-01-15T09:23:00Z',
      },
      {
        id: 'conv1-2',
        role: 'ai',
        content: 'That sounds like a recurring friction point. Where does the confusion usually happen? Is it during account setup, or when they\'re trying to accomplish their first task?',
        timestamp: '2024-01-15T09:23:15Z',
      },
      {
        id: 'conv1-3',
        role: 'user',
        content: 'It\'s right after they log in for the first time. The dashboard shows everything at once and they don\'t know where to start.',
        timestamp: '2024-01-15T09:24:00Z',
      },
      {
        id: 'conv1-4',
        role: 'ai',
        content: 'So the first-time experience lacks a clear starting point. This could indicate either information overload or missing progressive disclosure. Who else might be observing this pattern?',
        timestamp: '2024-01-15T09:24:15Z',
      },
    ],
  },
  {
    id: 's2',
    content: 'The design team never knows what engineering is building until it\'s almost done. We keep getting surprised by features that don\'t match the designs.',
    refinedInsight: 'Cross-functional visibility gap between design and engineering creating rework',
    type: 'text',
    contributor: contributors[1],
    createdAt: '2024-01-14T14:20:00Z',
    themes: ['Cross-team Communication', 'Design-Engineering Gap', 'Visibility'],
    emotionalMarkers: ['surprise', 'frustration'],
    tensionIds: ['t2'],
  },
  {
    id: 's3',
    content: 'Support tickets about the same onboarding issue keep coming in. We answer the same questions every day.',
    refinedInsight: 'Repetitive support burden indicating systemic onboarding documentation failure',
    type: 'text',
    contributor: contributors[2],
    createdAt: '2024-01-15T11:45:00Z',
    themes: ['Onboarding', 'Support Load', 'Documentation'],
    emotionalMarkers: ['repetition', 'fatigue'],
    tensionIds: ['t1'],
  },
  {
    id: 's4',
    content: 'Lost two deals this month because prospects couldn\'t understand our pricing page. One said "I gave up trying to figure out which plan I need."',
    refinedInsight: 'Pricing complexity directly causing deal loss and prospect abandonment',
    type: 'text',
    contributor: contributors[3],
    createdAt: '2024-01-13T16:00:00Z',
    themes: ['Pricing', 'Conversion', 'Complexity'],
    emotionalMarkers: ['loss', 'frustration'],
    tensionIds: ['t3'],
  },
  {
    id: 's5',
    content: 'New customers keep asking "what should I do first?" even though we have a getting started guide. The guide might not be visible enough.',
    refinedInsight: 'Getting started resources not discoverable at moment of need',
    type: 'text',
    contributor: contributors[0],
    createdAt: '2024-01-16T08:15:00Z',
    themes: ['Onboarding', 'Documentation', 'Discoverability'],
    emotionalMarkers: ['confusion'],
    tensionIds: ['t1'],
  },
  {
    id: 's6',
    content: 'Engineering shipped a feature last week that design never reviewed. Now we have inconsistent UI patterns in the app.',
    refinedInsight: 'Process gap allowing features to ship without design review',
    type: 'text',
    contributor: contributors[1],
    createdAt: '2024-01-16T10:30:00Z',
    themes: ['Cross-team Communication', 'Design Consistency', 'Process'],
    emotionalMarkers: ['frustration', 'inconsistency'],
    tensionIds: ['t2'],
  },
  {
    id: 's7',
    content: 'Customers on the Pro plan keep asking for features that are actually on Business. Our tier names don\'t mean anything to them.',
    refinedInsight: 'Tier naming fails to communicate value differentiation',
    type: 'text',
    contributor: contributors[5],
    createdAt: '2024-01-14T09:00:00Z',
    themes: ['Pricing', 'Naming', 'Customer Confusion'],
    emotionalMarkers: ['confusion', 'mismatch'],
    tensionIds: ['t3'],
  },
  {
    id: 's8',
    content: 'Had to explain the difference between Workspace and Project to 5 customers this week. Even I find it confusing sometimes.',
    refinedInsight: 'Core concept naming creating persistent confusion for customers and staff',
    type: 'text',
    contributor: contributors[2],
    createdAt: '2024-01-15T15:20:00Z',
    themes: ['Naming', 'Product Clarity', 'Onboarding'],
    emotionalMarkers: ['confusion', 'repetition'],
    tensionIds: ['t1'],
  },
];

export const tensions: Tension[] = [
  {
    id: 't1',
    title: 'Customer onboarding confusion',
    synthesis: 'Customers consistently struggle to understand where to start after signing up. The first-time experience presents too many options without clear guidance, leading to confusion, support tickets, and potentially churn. This is being observed across Customer Success, Support, and Sales, suggesting a systemic issue rather than isolated incidents.',
    observedAcross: ['Customer Success', 'Support', 'Sales', 'Product'],
    momentum: 'growing',
    intensity: 'high',
    repeatedPhrases: [
      '"Customers don\'t understand the first value moment"',
      '"What should I do first?"',
      '"The dashboard shows everything at once"',
    ],
    signalCount: 4,
    firstObserved: '2024-01-10T00:00:00Z',
    lastSignal: '2024-01-16T08:15:00Z',
    blindSpot: 'Leadership may perceive this as a documentation issue, while teams experience it as a fundamental product clarity problem.',
    suggestedAction: 'Run a focused onboarding simplification sprint. Consider implementing progressive disclosure and a clear "first win" moment.',
  },
  {
    id: 't2',
    title: 'Design-Engineering visibility gap',
    synthesis: 'There is a recurring disconnect between what design creates and what engineering ships. Features are being built without design review, leading to inconsistent UI patterns and rework. This suggests a process gap rather than a people problem.',
    observedAcross: ['Product', 'Engineering'],
    momentum: 'sustained',
    intensity: 'moderate',
    repeatedPhrases: [
      '"Design never knows until it\'s done"',
      '"Doesn\'t match the designs"',
      '"Inconsistent UI patterns"',
    ],
    signalCount: 2,
    firstObserved: '2024-01-08T00:00:00Z',
    lastSignal: '2024-01-16T10:30:00Z',
    blindSpot: 'This may be seen as a communication issue when it\'s actually a workflow gap.',
    suggestedAction: 'Introduce mandatory design review checkpoint before feature completion.',
  },
  {
    id: 't3',
    title: 'Pricing complexity causing conversion loss',
    synthesis: 'The current pricing structure with 4 tiers and unclear naming is directly causing deal losses and customer confusion. Prospects are abandoning the evaluation process because they cannot determine which plan fits their needs.',
    observedAcross: ['Sales', 'Support'],
    momentum: 'growing',
    intensity: 'high',
    repeatedPhrases: [
      '"I gave up trying to figure out which plan"',
      '"Tier names don\'t mean anything"',
      '"What\'s the difference between Pro and Business?"',
    ],
    signalCount: 2,
    firstObserved: '2024-01-12T00:00:00Z',
    lastSignal: '2024-01-14T09:00:00Z',
    blindSpot: 'Leadership may see pricing as a strategic positioning tool while customers experience it as a barrier.',
    suggestedAction: 'Simplify to 2-3 tiers with outcome-based naming that communicates clear value.',
  },
];

export const currentPulse: PulseEntry = {
  id: 'pulse-2024-01-16',
  generatedAt: '2024-01-16T12:00:00Z',
  periodStart: '2024-01-10T00:00:00Z',
  periodEnd: '2024-01-16T12:00:00Z',
  topTensions: tensions,
  emergingPatterns: [
    'Customer-facing friction is being observed simultaneously across Sales, Support, and Customer Success',
    'Internal process gaps between Design and Engineering may be contributing to external product confusion',
    'Naming and clarity issues appear systemic rather than isolated',
  ],
  mood: {
    overall: 'concerned',
    shifts: [
      'Frustration around onboarding has increased over the past week',
      'Teams feel heard but waiting for action',
    ],
  },
  narrative: 'The organization is signaling a clear pattern: customers are experiencing unnecessary friction at critical moments—onboarding, pricing evaluation, and feature understanding. While each team observes this through their own lens, the underlying issue appears to be product clarity rather than documentation or communication. The most urgent signal is onboarding confusion, which is being observed with increasing frequency across four departments.',
  blindSpots: [
    'Leadership may be treating symptoms (documentation, support staffing) rather than the root cause (product clarity)',
    'The connection between internal process gaps and external customer confusion may not be visible at the leadership level',
  ],
  recommendations: [
    'Prioritize onboarding simplification as a cross-functional initiative',
    'Consider pricing structure simplification before the next sales quarter',
    'Establish design review checkpoints in the development process',
  ],
};

// Prompts for the Employee Intelligence Companion
export const companionPrompts = [
  'What keeps repeating?',
  'What feels inefficient?',
  'What frustrates customers?',
  'What should leadership understand?',
  'What are people internally ignoring?',
  'What should exist that doesn\'t?',
  'What feels broken?',
  'What tension keeps showing up?',
];

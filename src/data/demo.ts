// Demo data for a fictional company: Meridian Health (healthcare tech company)

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
}

export interface Comment {
  id: string;
  author: Employee;
  content: string;
  createdAt: string;
}

export interface ResearchItem {
  id: string;
  type: 'market' | 'competitor' | 'validation' | 'risk';
  title: string;
  body: string;
  source?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  content: string;
  summary: string;
  contributor: Employee;
  createdAt: string;
  themes: string[];
  status: 'new' | 'exploring' | 'validating' | 'building' | 'implemented' | 'parked';
  reactions: {
    helpful: number;
    similar: number;
  };
  relatedIdeas?: string[];
  challengeId?: string;
  // Extended fields for lifecycle
  team?: Employee[];
  comments?: Comment[];
  research?: ResearchItem[];
  validationScore?: number;
  nextStep?: string;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
  ideaCount: number;
  trend: 'growing' | 'stable' | 'fading';
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'completed' | 'upcoming';
  ideaCount: number;
  participantCount: number;
}

// Employees at Meridian Health
export const employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sara Lindqvist',
    avatar: 'SL',
    role: 'Product Designer',
    department: 'Product',
  },
  {
    id: 'emp-2',
    name: 'Marcus Chen',
    avatar: 'MC',
    role: 'Customer Success Manager',
    department: 'Customer Success',
  },
  {
    id: 'emp-3',
    name: 'Emma Johansson',
    avatar: 'EJ',
    role: 'Software Engineer',
    department: 'Engineering',
  },
  {
    id: 'emp-4',
    name: 'Erik Bergman',
    avatar: 'EB',
    role: 'Sales Director',
    department: 'Sales',
  },
  {
    id: 'emp-5',
    name: 'Linnea Ström',
    avatar: 'LS',
    role: 'Operations Lead',
    department: 'Operations',
  },
  {
    id: 'emp-6',
    name: 'Johan Nilsson',
    avatar: 'JN',
    role: 'Support Specialist',
    department: 'Customer Success',
  },
  {
    id: 'emp-7',
    name: 'Frida Karlsson',
    avatar: 'FK',
    role: 'Marketing Manager',
    department: 'Marketing',
  },
  {
    id: 'emp-8',
    name: 'Anders Holm',
    avatar: 'AH',
    role: 'Data Analyst',
    department: 'Product',
  },
];

// Themes emerging from ideas
export const themes: Theme[] = [
  {
    id: 'theme-1',
    name: 'Onboarding Friction',
    color: 'theme-pill-1',
    ideaCount: 12,
    trend: 'growing',
    description: 'Multiple signals pointing to confusion and drop-off in the first 7 days',
  },
  {
    id: 'theme-2',
    name: 'Internal Communication',
    color: 'theme-pill-2',
    ideaCount: 8,
    trend: 'stable',
    description: 'Teams struggling to share context across departments',
  },
  {
    id: 'theme-3',
    name: 'Pricing Complexity',
    color: 'theme-pill-3',
    ideaCount: 6,
    trend: 'growing',
    description: 'Customers and sales confused by tier structure',
  },
  {
    id: 'theme-4',
    name: 'Mobile Experience',
    color: 'theme-pill-4',
    ideaCount: 5,
    trend: 'fading',
    description: 'Feature requests for better mobile app functionality',
  },
  {
    id: 'theme-5',
    name: 'AI Integration',
    color: 'theme-pill-5',
    ideaCount: 9,
    trend: 'growing',
    description: 'Opportunities to use AI for automation and insights',
  },
];

// Ideas from employees
export const ideas: Idea[] = [
  {
    id: 'idea-1',
    content: 'Customers keep asking the same questions during onboarding. We explain the same thing 10 times a day. What if we had a smart checklist that adapts based on what they\'ve already done?',
    summary: 'Adaptive onboarding checklist to reduce repetitive support questions',
    contributor: employees[1], // Marcus Chen
    createdAt: '2024-01-15T09:30:00Z',
    themes: ['Onboarding Friction'],
    status: 'validating',
    reactions: { helpful: 14, similar: 8 },
    relatedIdeas: ['idea-3', 'idea-7'],
    team: [employees[1], employees[0], employees[7]], // Marcus, Sara, Anders
    validationScore: 78,
    nextStep: 'Waiting for UX research findings on checklist patterns',
    comments: [
      {
        id: 'comment-1',
        author: employees[0], // Sara
        content: 'Love this idea. I can help with the design — we should look at how Notion does progressive disclosure.',
        createdAt: '2024-01-15T10:15:00Z',
      },
      {
        id: 'comment-2',
        author: employees[7], // Anders
        content: 'The data backs this up. Users who complete all onboarding steps have 4x lower churn. I can pull the exact numbers.',
        createdAt: '2024-01-15T11:30:00Z',
      },
    ],
    research: [
      {
        id: 'research-1',
        type: 'market',
        title: 'Notion\'s onboarding reduces time-to-value by 40%',
        body: 'Notion uses a progressive checklist that adapts based on user behavior. Users who complete the checklist are 3x more likely to invite team members.',
        source: 'Product-Led Growth Collective',
        sourceUrl: 'https://example.com/notion-onboarding',
        createdAt: '2024-01-15T12:00:00Z',
      },
      {
        id: 'research-2',
        type: 'validation',
        title: 'Internal data supports the hypothesis',
        body: '67% of support tickets in first week are about features covered in onboarding. Users skip steps they don\'t understand, then ask support.',
        createdAt: '2024-01-15T12:30:00Z',
      },
    ],
  },
  {
    id: 'idea-2',
    content: 'The design team never knows what engineering is building until it\'s done. We need some kind of shared space where work-in-progress is visible to everyone.',
    summary: 'Cross-team visibility for work-in-progress',
    contributor: employees[0], // Sara Lindqvist
    createdAt: '2024-01-14T14:20:00Z',
    themes: ['Internal Communication'],
    status: 'in_progress',
    reactions: { helpful: 11, similar: 5 },
  },
  {
    id: 'idea-3',
    content: 'New users don\'t understand the difference between "Workspace" and "Project". I\'ve seen 3 customers this week create workspaces when they meant projects. The naming is confusing.',
    summary: 'Rename Workspace/Project to reduce user confusion',
    contributor: employees[5], // Johan Nilsson
    createdAt: '2024-01-15T11:45:00Z',
    themes: ['Onboarding Friction'],
    status: 'new',
    reactions: { helpful: 9, similar: 12 },
    relatedIdeas: ['idea-1'],
  },
  {
    id: 'idea-4',
    content: 'Our pricing page has 4 tiers and 47 different features. Even I can\'t explain the difference between Pro and Business. Customers are choosing based on price alone, not fit.',
    summary: 'Simplify pricing tiers from 4 to 2-3 with clearer differentiation',
    contributor: employees[3], // Erik Bergman
    createdAt: '2024-01-13T16:00:00Z',
    themes: ['Pricing Complexity'],
    status: 'reviewing',
    reactions: { helpful: 18, similar: 4 },
  },
  {
    id: 'idea-5',
    content: 'We could use AI to automatically tag and categorize support tickets. Right now I spend 30 minutes every morning just sorting through the queue.',
    summary: 'AI-powered automatic ticket categorization',
    contributor: employees[5], // Johan Nilsson
    createdAt: '2024-01-12T08:15:00Z',
    themes: ['AI Integration'],
    status: 'building',
    reactions: { helpful: 7, similar: 3 },
    challengeId: 'challenge-1',
    team: [employees[5], employees[2]], // Johan, Emma
    validationScore: 92,
    nextStep: 'Engineering building MVP — target launch next week',
    comments: [
      {
        id: 'comment-3',
        author: employees[2], // Emma
        content: 'I\'ve prototyped this with Claude. Works surprisingly well — 89% accuracy on historical tickets.',
        createdAt: '2024-01-13T09:00:00Z',
      },
      {
        id: 'comment-4',
        author: employees[5], // Johan
        content: 'This would save me 2-3 hours per week. Let me know if you need more training data.',
        createdAt: '2024-01-13T14:00:00Z',
      },
    ],
    research: [
      {
        id: 'research-3',
        type: 'validation',
        title: 'Prototype achieves 89% accuracy',
        body: 'Tested on 500 historical tickets. Main errors are edge cases with ambiguous categories. Adding a "needs review" flag for low-confidence classifications.',
        createdAt: '2024-01-13T10:00:00Z',
      },
      {
        id: 'research-4',
        type: 'market',
        title: 'Zendesk AI tagging benchmarks',
        body: 'Zendesk\'s similar feature claims 85% accuracy. Our prototype is slightly better, likely due to domain-specific training.',
        source: 'Zendesk Documentation',
        sourceUrl: 'https://example.com/zendesk-ai',
        createdAt: '2024-01-13T11:00:00Z',
      },
    ],
  },
  {
    id: 'idea-6',
    content: 'The mobile app is basically unusable for anything except viewing. If someone could just approve things from their phone, that would save hours of back-and-forth.',
    summary: 'Add approval workflows to mobile app',
    contributor: employees[4], // Linnea Ström
    createdAt: '2024-01-11T13:30:00Z',
    themes: ['Mobile Experience'],
    status: 'parked',
    reactions: { helpful: 6, similar: 2 },
  },
  {
    id: 'idea-7',
    content: 'What if the onboarding showed a video of someone actually using the product instead of a bunch of text tooltips? People learn by watching, not reading.',
    summary: 'Video-based onboarding instead of text tooltips',
    contributor: employees[6], // Frida Karlsson
    createdAt: '2024-01-14T10:00:00Z',
    themes: ['Onboarding Friction'],
    status: 'new',
    reactions: { helpful: 8, similar: 6 },
    relatedIdeas: ['idea-1', 'idea-3'],
  },
  {
    id: 'idea-8',
    content: 'Our data shows that users who complete the "invite team" step have 3x higher retention. But only 12% do it. We should make this way more prominent.',
    summary: 'Increase team invite completion from 12% to improve retention',
    contributor: employees[7], // Anders Holm
    createdAt: '2024-01-15T15:20:00Z',
    themes: ['Onboarding Friction'],
    status: 'reviewing',
    reactions: { helpful: 15, similar: 2 },
  },
  {
    id: 'idea-9',
    content: 'Every enterprise deal takes 3+ months because legal reviews our terms from scratch each time. If we had pre-approved templates for common scenarios, we could close faster.',
    summary: 'Pre-approved contract templates for faster enterprise deals',
    contributor: employees[3], // Erik Bergman
    createdAt: '2024-01-10T09:00:00Z',
    themes: ['Internal Communication'],
    status: 'implemented',
    reactions: { helpful: 12, similar: 1 },
  },
  {
    id: 'idea-10',
    content: 'I noticed our AI suggestions are often wrong because they don\'t know what industry the customer is in. If we asked during signup, the AI could be way more relevant.',
    summary: 'Collect industry during signup to improve AI relevance',
    contributor: employees[2], // Emma Johansson
    createdAt: '2024-01-14T16:45:00Z',
    themes: ['AI Integration', 'Onboarding Friction'],
    status: 'new',
    reactions: { helpful: 10, similar: 4 },
    challengeId: 'challenge-1',
  },
];

// Active challenges
export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'AI Opportunities',
    description: 'Where can we use AI to save time, improve accuracy, or delight customers?',
    deadline: '2024-02-01',
    status: 'active',
    ideaCount: 9,
    participantCount: 14,
  },
  {
    id: 'challenge-2',
    title: 'Reduce Customer Churn',
    description: 'What signals tell us a customer might leave? What could we do differently?',
    deadline: '2024-02-15',
    status: 'active',
    ideaCount: 4,
    participantCount: 8,
  },
  {
    id: 'challenge-3',
    title: 'Sustainability Ideas',
    description: 'How can we reduce our environmental impact as a company?',
    deadline: '2024-01-31',
    status: 'upcoming',
    ideaCount: 0,
    participantCount: 0,
  },
];

// Pulse synthesis data
export const pulseSynthesis = {
  headline: 'Onboarding friction is the loudest signal this week — 4 departments are saying the same thing differently',
  date: new Date().toISOString(),
  keyInsight: 'The pattern is clear: customers understand our product\'s value, but they\'re getting lost in the first 7 days. This isn\'t a feature problem — it\'s a clarity problem.',
  emergingThemes: [
    {
      theme: themes[0], // Onboarding Friction
      momentum: 'strong',
      contributors: [employees[1], employees[5], employees[6], employees[7]],
      insight: '4 ideas from 4 different departments all point to the same issue: the gap between signup and first value is too wide.',
    },
    {
      theme: themes[4], // AI Integration
      momentum: 'growing',
      contributors: [employees[5], employees[2]],
      insight: 'Two tactical AI opportunities identified: ticket categorization and industry-aware suggestions.',
    },
    {
      theme: themes[2], // Pricing Complexity
      momentum: 'watch',
      contributors: [employees[3]],
      insight: 'Sales is raising pricing confusion. Worth investigating if this is blocking deals.',
    },
  ],
  tensions: [
    {
      title: 'Speed vs. Quality in Onboarding',
      description: 'Product wants to ship quick fixes. Design wants a full redesign. Both have valid points.',
    },
  ],
  recommendedActions: [
    {
      title: 'Investigate onboarding drop-off points',
      description: 'Anders has data. Sara has design perspective. Marcus has customer stories. Connect them.',
      priority: 'high',
    },
    {
      title: 'Review pricing tier structure',
      description: 'Erik\'s signal is strong. Get customer research to validate.',
      priority: 'medium',
    },
  ],
  stats: {
    totalIdeas: ideas.length,
    newThisWeek: 6,
    activeContributors: 8,
    implementedThisMonth: 1,
  },
};

// Company info
export const company = {
  name: 'Meridian Health',
  industry: 'Healthcare Technology',
  employees: 127,
  description: 'Digital health platform for patient engagement',
};

import Anthropic from '@anthropic-ai/sdk';
import type { Cluster } from './clustering';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClusterExtraction {
  clusterId: string;
  title: string;
  synthesis: string;
  repeatedPhrases: string[];
  momentum: 'emerging' | 'growing' | 'sustained' | 'declining';
  intensity: 'low' | 'moderate' | 'high' | 'critical';
  signalCount: number;
  contributorCount: number;
  blindSpot: string | null;
  suggestedAction: string;
  themes: string[];
}

/**
 * Extract structured tension data from a single cluster.
 * This is Stage 2 of the synthesis pipeline.
 */
export async function extractFromCluster(
  cluster: Cluster & { strength: 'strong' | 'emerging' | 'singular' }
): Promise<ClusterExtraction> {
  const signalTexts = cluster.signals
    .map((s, i) => `Signal ${i + 1}: "${s.summary}"`)
    .join('\n');

  const prompt = `Analyze these ${cluster.signals.length} organizational signals that share a common pattern.

SIGNALS:
${signalTexts}

THEMES DETECTED: ${cluster.themes.join(', ')}
CLUSTER STRENGTH: ${cluster.strength} (${cluster.signals.length} signals)

Extract a tension or pattern. Be specific and grounded in the actual language used.

Respond in strict JSON:
{
  "title": "Short memorable name for this tension (3-6 words)",
  "synthesis": "2-3 sentences explaining the pattern. Use second person ('You're hearing...'). Reference specific language from the signals.",
  "repeatedPhrases": ["Verbatim phrases that appear across multiple signals - exact quotes only"],
  "momentum": "emerging|growing|sustained|declining - based on signal dates and tone",
  "intensity": "low|moderate|high|critical - based on emotional markers and frequency",
  "blindSpot": "What leadership might be missing about this pattern, or null if obvious",
  "suggestedAction": "One specific, actionable recommendation"
}

IMPORTANT:
- repeatedPhrases must be EXACT quotes from the signals, not paraphrases
- If signals are too varied, use the most representative phrase
- synthesis should feel like editorial insight, not summary
- For ${cluster.strength} clusters, calibrate confidence appropriately`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  let extraction;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    extraction = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    extraction = null;
  }

  if (!extraction) {
    // Fallback for failed extraction
    extraction = {
      title: cluster.themes[0] || 'Unnamed Pattern',
      synthesis: `${cluster.signals.length} signals relate to ${cluster.themes.join(' and ')}.`,
      repeatedPhrases: [],
      momentum: 'emerging',
      intensity: 'moderate',
      blindSpot: null,
      suggestedAction: 'Investigate further.',
    };
  }

  return {
    clusterId: cluster.id,
    title: extraction.title,
    synthesis: extraction.synthesis,
    repeatedPhrases: extraction.repeatedPhrases || [],
    momentum: extraction.momentum,
    intensity: extraction.intensity,
    signalCount: cluster.signals.length,
    contributorCount: cluster.signals.length, // Approximation; real count would need identity lookup
    blindSpot: extraction.blindSpot,
    suggestedAction: extraction.suggestedAction,
    themes: cluster.themes,
  };
}

/**
 * Generate the narrative opening for The Read.
 * Takes all extractions and creates editorial synthesis.
 */
export async function generateNarrative(
  extractions: ClusterExtraction[],
  totalSignals: number,
  periodStart: Date,
  periodEnd: Date
): Promise<{ narrative: string; mood: { overall: string; shifts: string[] } }> {
  const tensionSummaries = extractions
    .slice(0, 5) // Top 5 tensions
    .map((e, i) => `${i + 1}. "${e.title}" (${e.signalCount} signals, ${e.intensity} intensity)`)
    .join('\n');

  const prompt = `Write the opening narrative for a leadership briefing called "The Read."

TOP TENSIONS THIS WEEK:
${tensionSummaries}

TOTAL SIGNALS: ${totalSignals}
PERIOD: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}

Write a 2-3 sentence opening that:
- Uses second person ("You're hearing...", "The organization is telling you...")
- Names the dominant pattern without being alarmist
- Hints at what deserves attention
- Reads like a trusted advisor, not a report generator

Also assess the overall organizational mood.

Respond in JSON:
{
  "narrative": "The opening paragraph",
  "mood": {
    "overall": "concerned|frustrated|optimistic|energized|uncertain|determined",
    "shifts": ["Notable mood shift 1", "Notable mood shift 2"]
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  let result;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    result = null;
  }

  if (!result) {
    return {
      narrative: `This week, ${totalSignals} signals point to patterns around ${extractions[0]?.title || 'organizational dynamics'}.`,
      mood: { overall: 'uncertain', shifts: [] },
    };
  }

  return result;
}

/**
 * Generate recommendations based on all extractions.
 */
export async function generateRecommendations(
  extractions: ClusterExtraction[]
): Promise<string[]> {
  const tensions = extractions
    .map(e => `- ${e.title}: ${e.synthesis} (Suggested: ${e.suggestedAction})`)
    .join('\n');

  const prompt = `Based on these organizational tensions, provide 3 prioritized recommendations for leadership.

TENSIONS:
${tensions}

Write 3 recommendations that:
- Are specific and actionable
- Address root causes, not symptoms
- Can be acted on this week
- Are written in imperative form ("Investigate...", "Schedule...", "Review...")

Respond as a JSON array of 3 strings:
["Recommendation 1", "Recommendation 2", "Recommendation 3"]`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : ['Review the top tension with your team.'];
  } catch {
    return ['Review the top tension with your team.'];
  }
}

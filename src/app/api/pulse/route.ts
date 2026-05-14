import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { signalStore } from '@/lib/store';
import { PulseEntry, Tension } from '@/data/intelligence';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GET - Generate or return cached Pulse
export async function GET() {
  const signals = signalStore.getSignals();

  // If no signals, return empty state
  if (signals.length === 0) {
    return NextResponse.json({
      pulse: null,
      message: 'No signals yet. Start contributing to generate organizational intelligence.',
      signalCount: 0,
    });
  }

  // Check if we have a valid cached pulse
  const cachedPulse = signalStore.getCachedPulse();
  if (cachedPulse && !signalStore.needsPulseRefresh()) {
    return NextResponse.json({
      pulse: cachedPulse,
      cached: true,
      signalCount: signals.length,
    });
  }

  // Generate new pulse using AI
  try {
    const signalsSummary = signals.map(s => ({
      content: s.content,
      refinedInsight: s.refinedInsight,
      themes: s.themes,
      emotionalMarkers: s.emotionalMarkers,
      department: s.contributor.department,
      createdAt: s.createdAt,
    }));

    const synthesisPrompt = `You are an organizational intelligence system. Analyze these signals from employees and synthesize them into a leadership pulse.

SIGNALS (${signals.length} total):
${JSON.stringify(signalsSummary, null, 2)}

Generate a comprehensive organizational pulse. Respond in this exact JSON format:

{
  "narrative": "2-3 sentences describing what the organization is collectively signaling right now. Be specific and actionable.",
  "tensions": [
    {
      "title": "Short tension title",
      "synthesis": "2-3 sentences explaining this tension based on the signals",
      "observedAcross": ["Department1", "Department2"],
      "momentum": "emerging|growing|sustained|declining",
      "intensity": "low|moderate|high|critical",
      "repeatedPhrases": ["Exact or paraphrased quotes from signals"],
      "blindSpot": "What leadership might be missing about this",
      "suggestedAction": "Concrete recommended action"
    }
  ],
  "emergingPatterns": ["Pattern 1", "Pattern 2"],
  "mood": {
    "overall": "optimistic|concerned|frustrated|energized|uncertain",
    "shifts": ["Shift or trend 1", "Shift or trend 2"]
  },
  "blindSpots": ["What leadership might not see"],
  "recommendations": ["Prioritized action 1", "Prioritized action 2", "Prioritized action 3"]
}

Important:
- Base everything on actual signal content
- Identify 2-4 tensions maximum
- Be specific, not generic
- Use actual phrases from signals when possible
- Think about what patterns emerge when you look across all signals`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: synthesisPrompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let pulseData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      pulseData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      pulseData = null;
    }

    if (!pulseData) {
      return NextResponse.json(
        { error: 'Failed to parse pulse synthesis' },
        { status: 500 }
      );
    }

    // Format tensions with IDs
    const tensions: Tension[] = (pulseData.tensions || []).map((t: Omit<Tension, 'id' | 'signalCount' | 'firstObserved' | 'lastSignal'>, i: number) => ({
      id: `tension-${Date.now()}-${i}`,
      title: t.title,
      synthesis: t.synthesis,
      observedAcross: t.observedAcross || [],
      momentum: t.momentum || 'emerging',
      intensity: t.intensity || 'moderate',
      repeatedPhrases: t.repeatedPhrases || [],
      signalCount: signals.filter(s =>
        s.themes.some(theme =>
          t.title.toLowerCase().includes(theme.toLowerCase()) ||
          theme.toLowerCase().includes(t.title.toLowerCase().split(' ')[0])
        )
      ).length || 1,
      firstObserved: signals[signals.length - 1]?.createdAt || new Date().toISOString(),
      lastSignal: signals[0]?.createdAt || new Date().toISOString(),
      blindSpot: t.blindSpot,
      suggestedAction: t.suggestedAction,
    }));

    const pulse: PulseEntry = {
      id: `pulse-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      periodStart: signals[signals.length - 1]?.createdAt || new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      topTensions: tensions,
      emergingPatterns: pulseData.emergingPatterns || [],
      mood: pulseData.mood || { overall: 'uncertain', shifts: [] },
      narrative: pulseData.narrative || 'Analyzing organizational signals...',
      blindSpots: pulseData.blindSpots || [],
      recommendations: pulseData.recommendations || [],
    };

    // Cache the pulse
    signalStore.setCachedPulse(pulse);

    return NextResponse.json({
      pulse,
      cached: false,
      signalCount: signals.length,
      departments: signalStore.getDepartments(),
    });
  } catch (error) {
    console.error('Pulse generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pulse' },
      { status: 500 }
    );
  }
}

// POST - Force regenerate pulse
export async function POST() {
  // Clear cache and regenerate
  signalStore.setCachedPulse(null as unknown as PulseEntry);

  // Redirect to GET which will regenerate
  return GET();
}

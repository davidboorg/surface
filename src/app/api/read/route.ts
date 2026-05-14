import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient, createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GET - Retrieve the latest Read for the user's tenant
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Type assertion for profile data
    const profile = profileData as { tenant_id: string; role: string };

    // Only leadership can view The Read
    if (profile.role !== 'leadership' && profile.role !== 'admin' && profile.role !== 'cos') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the latest read for this tenant
    const { data: latestRead } = await supabase
      .from('reads')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get signal count for this tenant (anonymous - no identity data)
    const { count: signalCount } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id);

    // Get unique themes as proxy for departments
    const { data: signalsData } = await supabase
      .from('signals')
      .select('themes')
      .eq('tenant_id', profile.tenant_id);

    const themes = new Set<string>();
    const signals = signalsData as Array<{ themes: string[] }> | null;
    signals?.forEach(s => {
      s.themes?.forEach((t: string) => themes.add(t));
    });

    return NextResponse.json({
      read: latestRead,
      signalCount: signalCount || 0,
      themes: Array.from(themes),
    });
  } catch (error) {
    console.error('Read API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Generate a new Read synthesis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant
    const { data: profileData2, error: profileError2 } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError2 || !profileData2) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Type assertion for profile data
    const profile = profileData2 as { tenant_id: string; role: string };

    // Only leadership can generate The Read
    if (profile.role !== 'leadership' && profile.role !== 'admin' && profile.role !== 'cos') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all signals from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    interface SignalRow {
      id: string;
      contribution_card: { summary?: string } | null;
      themes: string[];
      created_at: string;
    }

    const { data: signalsData } = await supabase
      .from('signals')
      .select('id, contribution_card, themes, created_at')
      .eq('tenant_id', profile.tenant_id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    const signals = signalsData as SignalRow[] | null;

    if (!signals || signals.length === 0) {
      return NextResponse.json({
        read: null,
        signalCount: 0,
        message: 'Not enough signals to generate a Read',
      });
    }

    // Prepare signal summaries for synthesis (no identity information)
    const signalSummaries = signals.map(s => ({
      summary: s.contribution_card?.summary || 'No summary',
      themes: s.themes || [],
      date: s.created_at,
    }));

    // Generate The Read using Claude
    const synthesisPrompt = `You are analyzing anonymous organizational signals to create "The Read" - a weekly editorial synthesis for leadership.

SIGNALS (${signals.length} total from the past week):
${signalSummaries.map((s, i) => `${i + 1}. "${s.summary}" [Themes: ${s.themes.join(', ')}]`).join('\n')}

Generate a comprehensive Read that includes:

1. NARRATIVE: A 2-3 sentence executive summary of what the organization is trying to tell leadership this week. Write in second person ("You're hearing..." not "The organization is...").

2. MOOD: Overall organizational mood (one of: concerned, frustrated, optimistic, energized, uncertain, determined) and 1-2 notable shifts or patterns.

3. TOP TENSIONS: Identify 2-4 key tensions or patterns. For each:
   - title: Short, memorable name
   - synthesis: 2-3 sentences explaining the tension
   - themes: Which themes it appears in
   - intensity: low, moderate, high, or critical
   - momentum: emerging, growing, sustained, or declining
   - blindSpot: What leadership might be missing
   - suggestedAction: A specific, actionable recommendation

4. EMERGING PATTERNS: 2-3 new patterns that are just starting to appear

5. BLIND SPOTS: 2-3 things leadership might be missing

6. RECOMMENDATIONS: 3 prioritized action items

Respond in JSON format:
{
  "narrative": "string",
  "mood": {
    "overall": "concerned|frustrated|optimistic|energized|uncertain|determined",
    "shifts": ["string", "string"]
  },
  "topTensions": [
    {
      "id": "t1",
      "title": "string",
      "synthesis": "string",
      "observedAcross": ["theme1", "theme2"],
      "repeatedPhrases": ["phrase1", "phrase2"],
      "intensity": "low|moderate|high|critical",
      "momentum": "emerging|growing|sustained|declining",
      "blindSpot": "string",
      "suggestedAction": "string"
    }
  ],
  "emergingPatterns": ["string"],
  "blindSpots": ["string"],
  "recommendations": ["string"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: synthesisPrompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let synthesis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      synthesis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      console.error('Failed to parse synthesis JSON');
      return NextResponse.json({ error: 'Failed to generate synthesis' }, { status: 500 });
    }

    if (!synthesis) {
      return NextResponse.json({ error: 'Failed to generate synthesis' }, { status: 500 });
    }

    // Use service client to write to reads table
    const serviceClient = createServiceClient();

    const now = new Date();
    const periodStart = oneWeekAgo.toISOString();
    const periodEnd = now.toISOString();

    // Create the Read
    // Note: Using type assertion because Supabase types aren't properly recognized
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readsTable = serviceClient.from('reads') as any;
    const { data: newRead, error: insertError } = await readsTable
      .insert({
        tenant_id: profile.tenant_id,
        narrative: synthesis.narrative,
        mood: synthesis.mood,
        top_tensions: synthesis.topTensions,
        emerging_patterns: synthesis.emergingPatterns,
        blind_spots: synthesis.blindSpots,
        recommendations: synthesis.recommendations,
        period_start: periodStart,
        period_end: periodEnd,
        signal_count: signals.length,
        status: 'published',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save Read:', insertError);
      return NextResponse.json({ error: 'Failed to save Read' }, { status: 500 });
    }

    // Get unique themes
    const themes = new Set<string>();
    signals.forEach(s => {
      s.themes?.forEach((t: string) => themes.add(t));
    });

    return NextResponse.json({
      read: newRead,
      signalCount: signals.length,
      themes: Array.from(themes),
    });
  } catch (error) {
    console.error('Read generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

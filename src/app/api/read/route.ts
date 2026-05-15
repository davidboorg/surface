import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import {
  generateEmbedding,
  clusterSignals,
  sortClusters,
  categorizeClusterStrength,
  extractFromCluster,
  generateNarrative,
  generateRecommendations,
  type SignalWithEmbedding,
  type ClusterExtraction,
} from '@/lib/synthesis';

interface SignalRow {
  id: string;
  contribution_card: { summary?: string } | null;
  themes: string[];
  embedding: string | number[] | null;
  created_at: string;
}

// GET - Retrieve the latest Read for the user's tenant
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileData as { tenant_id: string; role: string };

    // Only leadership can view The Read
    if (!['leadership', 'admin', 'cos'].includes(profile.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the latest published read
    const { data: latestRead } = await supabase
      .from('reads')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get signal count
    const { count: signalCount } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id);

    // Get unique themes
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

// POST - Generate a new Read using 2-stage synthesis pipeline
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileData as { tenant_id: string; role: string };

    // Only leadership can generate The Read
    if (!['leadership', 'admin', 'cos'].includes(profile.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Get signals from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: signalsData } = await supabase
      .from('signals')
      .select('id, contribution_card, themes, embedding, created_at')
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

    // ============================================
    // STAGE 1: Deterministic Clustering
    // ============================================

    // Prepare signals with embeddings
    const signalsWithEmbeddings: SignalWithEmbedding[] = [];

    for (const signal of signals) {
      const summary = signal.contribution_card?.summary || '';
      if (!summary) continue;

      let embedding: number[];

      if (signal.embedding) {
        // Parse existing embedding
        embedding = typeof signal.embedding === 'string'
          ? JSON.parse(signal.embedding)
          : signal.embedding;
      } else {
        // Generate embedding if missing (backfill)
        try {
          embedding = await generateEmbedding(summary);
          // Store for future use
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const signalsTable = serviceClient.from('signals') as any;
          await signalsTable
            .update({ embedding: JSON.stringify(embedding) })
            .eq('id', signal.id);
        } catch (err) {
          console.error('Failed to generate embedding for signal', signal.id, err);
          continue;
        }
      }

      signalsWithEmbeddings.push({
        id: signal.id,
        summary,
        themes: signal.themes || [],
        embedding,
        created_at: signal.created_at,
      });
    }

    if (signalsWithEmbeddings.length === 0) {
      return NextResponse.json({
        read: null,
        signalCount: signals.length,
        message: 'Could not process signals for synthesis',
      });
    }

    // Cluster signals by semantic similarity
    const clusters = clusterSignals(signalsWithEmbeddings, 0.70);
    const sortedClusters = sortClusters(clusters);
    const categorizedClusters = categorizeClusterStrength(sortedClusters);

    // ============================================
    // STAGE 2: Per-Cluster Extraction
    // ============================================

    const extractions: ClusterExtraction[] = [];

    // Process top clusters (limit to avoid timeout)
    const clustersToProcess = categorizedClusters.slice(0, 8);

    for (const cluster of clustersToProcess) {
      try {
        const extraction = await extractFromCluster(cluster);
        extractions.push(extraction);

        // Update signals with cluster_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signalsTable = serviceClient.from('signals') as any;
        await signalsTable
          .update({ cluster_id: cluster.id })
          .in('id', cluster.signals.map(s => s.id));
      } catch (err) {
        console.error('Failed to extract from cluster', cluster.id, err);
      }
    }

    if (extractions.length === 0) {
      return NextResponse.json({
        read: null,
        signalCount: signals.length,
        message: 'Failed to extract patterns from signals',
      });
    }

    // ============================================
    // Generate Narrative & Recommendations
    // ============================================

    const periodStart = oneWeekAgo;
    const periodEnd = new Date();

    const [narrativeResult, recommendations] = await Promise.all([
      generateNarrative(extractions, signals.length, periodStart, periodEnd),
      generateRecommendations(extractions),
    ]);

    // ============================================
    // Save The Read
    // ============================================

    // Format tensions for storage
    const topTensions = extractions.map((e, i) => ({
      id: `t${i + 1}`,
      title: e.title,
      synthesis: e.synthesis,
      observedAcross: e.themes,
      repeatedPhrases: e.repeatedPhrases,
      intensity: e.intensity,
      momentum: e.momentum,
      blindSpot: e.blindSpot,
      suggestedAction: e.suggestedAction,
      signalCount: e.signalCount,
      signalStrength: categorizedClusters.find(c => c.id === e.clusterId)?.strength || 'emerging',
    }));

    // Identify emerging patterns (single-signal clusters)
    const emergingPatterns = categorizedClusters
      .filter(c => c.strength === 'singular')
      .slice(0, 3)
      .map(c => c.signals[0]?.summary || 'Unnamed pattern');

    // Blind spots from extractions
    const blindSpots = extractions
      .filter(e => e.blindSpot)
      .map(e => e.blindSpot as string)
      .slice(0, 3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readsTable = serviceClient.from('reads') as any;
    const { data: newRead, error: insertError } = await readsTable
      .insert({
        tenant_id: profile.tenant_id,
        narrative: narrativeResult.narrative,
        mood: narrativeResult.mood,
        top_tensions: topTensions,
        emerging_patterns: emergingPatterns,
        blind_spots: blindSpots,
        recommendations,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        signal_count: signals.length,
        contributor_count: signalsWithEmbeddings.length, // Approximation
        status: 'published', // For MVP; Stage 4 adds 'review' state
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save Read:', insertError);
      return NextResponse.json({ error: 'Failed to save Read' }, { status: 500 });
    }

    // Collect all themes
    const allThemes = new Set<string>();
    extractions.forEach(e => e.themes.forEach(t => allThemes.add(t)));

    return NextResponse.json({
      read: newRead,
      signalCount: signals.length,
      themes: Array.from(allThemes),
      clusterCount: clusters.length,
    });
  } catch (error) {
    console.error('Read generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

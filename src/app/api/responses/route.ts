import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type ResponseType = 'acknowledged' | 'action_planned' | 'wont_act' | 'needs_discussion';

// GET - Fetch responses for a Read
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const readId = searchParams.get('readId');

    if (!readId) {
      return NextResponse.json({ error: 'readId required' }, { status: 400 });
    }

    // Get user's profile to verify tenant access
    const { data: profileData } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileData as { tenant_id: string; role: string };

    // Only leadership can view responses
    if (!['leadership', 'admin', 'cos'].includes(profile.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch responses for this Read
    const { data: responses, error } = await supabase
      .from('read_responses')
      .select('*')
      .eq('read_id', readId);

    if (error) {
      console.error('Failed to fetch responses:', error);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    return NextResponse.json({ responses: responses || [] });
  } catch (error) {
    console.error('Responses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update a response
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { readId, tensionIndex, responseType, responseText } = body as {
      readId: string;
      tensionIndex: number;
      responseType: ResponseType;
      responseText?: string;
    };

    if (!readId || tensionIndex === undefined || !responseType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate response type
    const validTypes: ResponseType[] = ['acknowledged', 'action_planned', 'wont_act', 'needs_discussion'];
    if (!validTypes.includes(responseType)) {
      return NextResponse.json({ error: 'Invalid response type' }, { status: 400 });
    }

    // wont_act requires explanation
    if (responseType === 'wont_act' && !responseText) {
      return NextResponse.json({ error: 'Explanation required for "won\'t act"' }, { status: 400 });
    }

    // Get user's profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileData as { tenant_id: string; role: string };

    // Only leadership can respond
    if (!['leadership', 'cos'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only leadership can respond' }, { status: 403 });
    }

    // Upsert the response (unique on read_id + tension_index)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responsesTable = supabase.from('read_responses') as any;
    const { data: response, error } = await responsesTable
      .upsert({
        read_id: readId,
        tension_index: tensionIndex,
        responder_id: user.id,
        response_type: responseType,
        response_text: responseText || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'read_id,tension_index',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save response:', error);
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
    }

    return NextResponse.json({ response, success: true });
  } catch (error) {
    console.error('Responses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET check if all tensions have been responded to
export async function checkAllResponded(supabase: Awaited<ReturnType<typeof createClient>>, readId: string, tensionCount: number): Promise<boolean> {
  const { count } = await supabase
    .from('read_responses')
    .select('*', { count: 'exact', head: true })
    .eq('read_id', readId);

  return (count || 0) >= tensionCount;
}

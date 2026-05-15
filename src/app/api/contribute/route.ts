import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/synthesis/embeddings';
import type { ContributionCard, QuotePermission } from '@/lib/supabase/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationMessage {
  role: 'user' | 'ai';
  content: string;
}

// POST /api/contribute/card - Generate contribution card from conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, conversation, conversationId } = body;

    if (action === 'generate_card') {
      // Generate contribution card from conversation
      const messages = conversation as ConversationMessage[];
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);

      const cardPrompt = `Analyze this conversation and extract the core insight for organizational leadership.

CONVERSATION:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Generate a contribution card that captures what this person is observing. The card should be:
- 1-2 sentences maximum
- Written in first person as if the contributor is speaking
- Focused on the core observation or tension, not the conversation
- Specific enough to be actionable, general enough to not identify the person

Also extract 1-3 relevant themes (short labels like "Onboarding", "Customer Confusion", "Pricing").

Respond in JSON:
{
  "summary": "The core observation in 1-2 sentences",
  "themes": ["Theme1", "Theme2"],
  "originalExcerpt": "The most quotable phrase from the user (optional, only if there's something distinctive)"
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: cardPrompt }],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      let card: ContributionCard;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        card = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          summary: userMessages.join(' ').slice(0, 200),
          themes: ['General'],
        };
      } catch {
        card = {
          summary: userMessages.join(' ').slice(0, 200),
          themes: ['General'],
        };
      }

      return NextResponse.json({ card });
    }

    if (action === 'submit') {
      // Submit the contribution
      const { card, quotePermission, attributedName } = body as {
        card: ContributionCard;
        quotePermission: QuotePermission;
        attributedName?: string;
      };

      // Get user's profile for tenant_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Type assertion for profile data
      const profile = profileData as { tenant_id: string };
      const tenantId = profile.tenant_id;

      // Use service client to write to protected tables
      const serviceClient = createServiceClient();

      // Get the raw content from conversation
      const messages = conversation as ConversationMessage[];
      const rawContent = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');

      // Call the create_contribution function
      // Note: Using type assertion because Supabase types don't know about custom RPC functions
      // In production, generate proper types with: npx supabase gen types typescript
      const { data: signalId, error: insertError } = await (serviceClient.rpc as Function)(
        'create_contribution',
        {
          p_tenant_id: tenantId,
          p_user_id: user.id,
          p_raw_content: rawContent,
          p_contribution_card: card,
          p_themes: card.themes,
          p_quote_permission: quotePermission,
          p_attributed_name: attributedName || null,
        }
      );

      if (insertError) {
        console.error('Contribution insert error:', insertError);
        return NextResponse.json({ error: 'Failed to save contribution' }, { status: 500 });
      }

      // Generate embedding for the signal (async, non-blocking for response)
      // Uses the summary for embedding as it's the refined insight
      try {
        const embedding = await generateEmbedding(card.summary);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signalsTable = serviceClient.from('signals') as any;
        await signalsTable
          .update({ embedding: JSON.stringify(embedding) })
          .eq('id', signalId);
      } catch (embeddingError) {
        // Log but don't fail the contribution - embedding can be regenerated later
        console.error('Embedding generation error:', embeddingError);
      }

      // Update the conversation to mark it as contributed
      if (conversationId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conversationsTable = serviceClient.from('conversations') as any;
        await conversationsTable
          .update({
            contributed: true,
            contributed_signal_id: signalId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId);
      }

      return NextResponse.json({
        success: true,
        signalId,
        message: 'Your observation has been added to the organizational intelligence.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Contribute API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

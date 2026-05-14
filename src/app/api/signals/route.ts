import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { signalStore } from '@/lib/store';
import { ConversationMessage } from '@/data/intelligence';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GET - Retrieve all signals
export async function GET() {
  const signals = signalStore.getSignals();
  return NextResponse.json({
    signals,
    count: signals.length,
    departments: signalStore.getDepartments(),
  });
}

// POST - Save a new signal from a conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversation, contributorName, contributorRole, contributorDepartment } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Use AI to extract themes and refine the insight
    const analysisPrompt = `Analyze this organizational observation and extract key information.

OBSERVATION:
"${content}"

${conversation ? `CONVERSATION CONTEXT:
${conversation.map((m: ConversationMessage) => `${m.role}: ${m.content}`).join('\n')}` : ''}

Respond in JSON format:
{
  "refinedInsight": "One sentence capturing the core insight",
  "themes": ["Theme1", "Theme2"], // 1-3 themes, short labels
  "emotionalMarkers": ["marker1", "marker2"] // e.g., "frustration", "confusion", "opportunity", "urgency"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        refinedInsight: content.slice(0, 100),
        themes: ['General'],
        emotionalMarkers: [],
      };
    } catch {
      analysis = {
        refinedInsight: content.slice(0, 100),
        themes: ['General'],
        emotionalMarkers: [],
      };
    }

    // Create the signal
    const contributor = contributorName ? {
      id: `c-${Date.now()}`,
      name: contributorName,
      role: contributorRole || 'Team Member',
      department: contributorDepartment || 'General',
    } : signalStore.getRandomContributor();

    const signal = signalStore.addSignal({
      content,
      refinedInsight: analysis.refinedInsight,
      type: 'text',
      contributor,
      themes: analysis.themes,
      emotionalMarkers: analysis.emotionalMarkers,
      conversation: conversation || [],
    });

    return NextResponse.json({
      success: true,
      signal,
      message: 'Signal captured and added to organizational intelligence',
    });
  } catch (error) {
    console.error('Signal API error:', error);
    return NextResponse.json(
      { error: 'Failed to save signal' },
      { status: 500 }
    );
  }
}

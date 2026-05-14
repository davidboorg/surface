import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Known competitors in the idea management / innovation space
const COMPETITORS = [
  { name: 'IdeaScale', domain: 'ideascale.com' },
  { name: 'Brightidea', domain: 'brightidea.com' },
  { name: 'Wazoku', domain: 'wazoku.com' },
  { name: 'Qmarkets', domain: 'qmarkets.net' },
  { name: 'Planview Spigit', domain: 'planview.com' },
  { name: 'HYPE Innovation', domain: 'hypeinnovation.com' },
];

interface ResearchRequest {
  ideaId: string;
  ideaSummary: string;
  ideaContent: string;
  themes: string[];
  industry?: string;
}

interface ResearchItem {
  id: string;
  type: 'market' | 'competitor' | 'validation' | 'risk';
  title: string;
  body: string;
  source?: string;
  sourceUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { ideaId, ideaSummary, ideaContent, themes, industry = 'healthcare technology' } = body;

    if (!ideaSummary || !ideaContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Search for relevant market data using Tavily
    const tavilyKey = process.env.TAVILY_API_KEY;
    let marketSignals: Array<{ title: string; content: string; url: string; category: string }> = [];

    if (tavilyKey) {
      // Build comprehensive search queries
      const searchQueries = [
        // Market/trend queries
        { query: `${ideaSummary} enterprise software case study 2024 2025`, category: 'market' },
        { query: `${themes[0] || 'innovation management'} best practices enterprise`, category: 'market' },
        // Competitor queries
        { query: `IdeaScale Brightidea Wazoku innovation management comparison`, category: 'competitor' },
        { query: `idea management software enterprise features pricing`, category: 'competitor' },
        // Validation queries
        { query: `${ideaSummary} ROI benefits statistics`, category: 'validation' },
      ];

      for (const { query, category } of searchQueries) {
        try {
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: tavilyKey,
              query,
              search_depth: 'advanced',
              max_results: 5,
              include_answer: false,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const results = data.results || [];
            marketSignals.push(
              ...results.map((r: { title: string; content: string; url: string }) => ({
                title: r.title,
                content: r.content,
                url: r.url,
                category,
              }))
            );
          }
        } catch (err) {
          console.error('Tavily search error:', err);
        }
      }
    }

    // Step 2: Use Claude to analyze and synthesize research
    const competitorContext = COMPETITORS.map(c => c.name).join(', ');

    const researchPrompt = `You are a research analyst at an innovation studio validating an internal business idea for a client. Your job is to provide concrete, actionable research findings.

## CONTEXT
We're building "Surface" — an AI-native platform for organizational intelligence. The tagline is "The easiest way for intelligence inside an organization to surface."

Key differentiators from competitors (${competitorContext}):
- AI synthesis that turns 1000 ideas into actionable narratives
- Clear employee attribution (not anonymous suggestion boxes)
- Pulse view for leadership (not dashboards)
- Warm, human design (not enterprise blue)

## THE IDEA BEING VALIDATED
Title: ${ideaSummary}
Description: ${ideaContent}
Themes: ${themes.join(', ')}
Industry context: ${industry}

${marketSignals.length > 0 ? `## MARKET INTELLIGENCE FROM WEB SEARCH
${marketSignals.map((s, i) => `[${s.category.toUpperCase()}] ${s.title}
${s.content}
Source: ${s.url}`).join('\n\n')}` : ''}

## YOUR TASK
Analyze this idea in the context of the innovation management market. Provide 4-5 research findings:

1. At least one COMPETITOR finding — how do IdeaScale, Brightidea, Wazoku, Qmarkets handle similar problems?
2. At least one MARKET finding — trends, market size, buyer behavior
3. At least one VALIDATION finding — data or evidence supporting the idea
4. At least one RISK finding — potential challenges or reasons this might fail

Be specific. Use actual data from the search results when available. Don't be generic.

Respond in this exact JSON format:
{
  "findings": [
    {
      "type": "market|competitor|validation|risk",
      "title": "Specific, concrete title",
      "body": "2-3 sentences with specific insights, numbers if available",
      "source": "Source name",
      "sourceUrl": "URL"
    }
  ],
  "validationScore": 0-100,
  "summary": "One sentence: is this idea worth pursuing and why?"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: researchPrompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let researchData;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        responseText.match(/\{[\s\S]*"findings"[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      researchData = JSON.parse(jsonStr);
    } catch {
      // Fallback if JSON parsing fails
      researchData = {
        findings: [
          {
            type: 'validation',
            title: 'AI Analysis Generated',
            body: responseText.slice(0, 300),
          },
        ],
        validationScore: 65,
        summary: 'Research analysis completed.',
      };
    }

    // Format findings with IDs
    const findings: ResearchItem[] = researchData.findings.map(
      (f: Omit<ResearchItem, 'id'>, i: number) => ({
        id: `research-${ideaId}-${Date.now()}-${i}`,
        type: f.type,
        title: f.title,
        body: f.body,
        source: f.source,
        sourceUrl: f.sourceUrl,
      })
    );

    return NextResponse.json({
      success: true,
      ideaId,
      research: findings,
      validationScore: researchData.validationScore || 70,
      summary: researchData.summary || 'Research completed.',
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate research' },
      { status: 500 }
    );
  }
}

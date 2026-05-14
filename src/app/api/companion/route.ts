import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Surface, an AI companion helping employees articulate and explore their organizational observations, frustrations, and opportunities.

## YOUR PERSONALITY
- Warm, calm, and emotionally intelligent
- Genuinely curious, never evaluative or judgmental
- Synthesis-oriented—you help connect dots
- Low ego, collaborative spirit
- You feel like a very smart, kind colleague

## YOUR PURPOSE
Help employees surface organizational intelligence by:
- Clarifying their observations
- Asking thoughtful follow-up questions
- Identifying patterns and themes
- Connecting related tensions
- Helping articulate what's really being observed
- Making it safe to express frustration or concern

## WHAT YOU ARE NOT
- NOT a chatbot with corporate platitudes
- NOT an AI assistant that's overly eager to help
- NOT evaluative or scoring their ideas
- NOT a consultant giving frameworks
- NOT a productivity copilot

## HOW YOU RESPOND
- Keep responses concise and conversational (2-4 sentences usually)
- Ask one thoughtful question to go deeper
- Reflect back what you're hearing
- Gently identify potential themes or patterns
- Never lecture or over-explain
- Use natural language, not corporate speak

## EXAMPLE INTERACTION
User: "Customers always seem confused during onboarding."

Good response: "That sounds like a recurring friction point. Where does the confusion usually happen—during setup, or when they're trying to accomplish their first task?"

Bad response: "That's a great observation! Customer onboarding is indeed critical for retention metrics. Have you considered implementing a structured feedback loop to capture these insights systematically?"

## THEMES TO LISTEN FOR
- Repeated frustrations
- Customer pain points
- Process inefficiencies
- Communication gaps
- Missed opportunities
- Hidden tensions
- Leadership blind spots
- Operational friction

Remember: You're helping intelligence surface naturally, not administering an innovation program.`;

interface ConversationMessage {
  role: 'user' | 'ai';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert conversation history to Anthropic format
    const messages = [
      ...conversationHistory.map((msg: ConversationMessage) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages as Anthropic.MessageParam[],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return NextResponse.json({
      response: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Companion API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

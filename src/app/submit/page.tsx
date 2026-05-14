'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck } from '@/components/ui/icons';
import { themes, employees } from '@/data/demo';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Hi! I'm here to help capture your idea. What's on your mind? Don't worry about making it perfect — just share what you're thinking.",
};

const FOLLOW_UP_QUESTIONS = [
  "That's interesting! Can you tell me more about what problem this would solve?",
  "Who do you think would benefit most from this?",
  "Have you seen this work somewhere else, or is this based on something you've experienced?",
  "Is there anything else you'd like to add before we wrap up?",
];

export default function SubmitPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [ideaSummary, setIdeaSummary] = useState<string | null>(null);
  const [detectedThemes, setDetectedThemes] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate AI response
  const getAIResponse = (userMessage: string, step: number): { message: string; themes?: string[]; summary?: string } => {
    // Detect themes from user input
    const detectedThemes: string[] = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('onboard') || lowerMessage.includes('new user') || lowerMessage.includes('signup') || lowerMessage.includes('start')) {
      detectedThemes.push('Onboarding Friction');
    }
    if (lowerMessage.includes('team') || lowerMessage.includes('communicate') || lowerMessage.includes('share') || lowerMessage.includes('collaborate')) {
      detectedThemes.push('Internal Communication');
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('tier') || lowerMessage.includes('plan') || lowerMessage.includes('cost')) {
      detectedThemes.push('Pricing Complexity');
    }
    if (lowerMessage.includes('mobile') || lowerMessage.includes('app') || lowerMessage.includes('phone')) {
      detectedThemes.push('Mobile Experience');
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('automat') || lowerMessage.includes('machine') || lowerMessage.includes('smart')) {
      detectedThemes.push('AI Integration');
    }

    if (step < FOLLOW_UP_QUESTIONS.length) {
      return { message: FOLLOW_UP_QUESTIONS[step], themes: detectedThemes };
    }

    // Final summary
    return {
      message: "Thanks for sharing this! I've captured your idea. Here's a summary — let me know if you'd like to adjust anything before submitting.",
      themes: detectedThemes,
      summary: `Based on your input, this idea focuses on improving the user experience by ${userMessage.slice(0, 50).toLowerCase()}...`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = getAIResponse(input, currentStep);

    if (response.themes) {
      setDetectedThemes((prev) => [...new Set([...prev, ...response.themes!])]);
    }

    if (response.summary) {
      setIdeaSummary(response.summary);
    }

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.message,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setCurrentStep((prev) => prev + 1);
    setIsTyping(false);
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
    // In real app, this would save to database
    setTimeout(() => {
      router.push('/ideas');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-6">
          <IconCheck size={32} className="text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-black)] mb-3">
          Your idea has been shared!
        </h1>
        <p className="text-[var(--color-gray-600)] mb-6">
          Thanks for contributing. Your idea will be reviewed and connected with similar thinking across the organization.
        </p>
        <p className="text-sm text-[var(--color-gray-400)]">
          Redirecting to Ideas...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-black)] mb-2">
          Share Your Idea
        </h1>
        <p className="text-[var(--color-gray-600)]">
          Every idea matters. Let's capture yours together.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-[var(--color-gray-200)] overflow-hidden">
        {/* Messages */}
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] px-4 py-3 rounded-2xl
                  ${message.role === 'user'
                    ? 'bg-[var(--color-black)] text-white rounded-br-md'
                    : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)] rounded-bl-md'
                  }
                `}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-gray-100)] text-[var(--color-gray-500)] px-4 py-3 rounded-2xl rounded-bl-md">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-[var(--color-gray-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-gray-400)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-gray-400)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Detected Themes */}
        {detectedThemes.length > 0 && (
          <div className="px-6 py-3 border-t border-[var(--color-gray-100)] bg-[var(--color-gray-50)]">
            <p className="text-xs text-[var(--color-gray-500)] mb-2">Detected themes:</p>
            <div className="flex flex-wrap gap-2">
              {detectedThemes.map((theme) => {
                const themeData = themes.find((t) => t.name === theme);
                return (
                  <span
                    key={theme}
                    className={`theme-pill text-xs ${themeData?.color || ''}`}
                  >
                    {theme}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        {!ideaSummary ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-gray-200)]">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your thoughts..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] rounded-xl text-[var(--color-black)] placeholder:text-[var(--color-gray-400)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 rounded-xl bg-[var(--color-accent)] text-[var(--color-black)] hover:bg-[var(--color-accent-dim)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconArrowRight size={20} />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 border-t border-[var(--color-gray-200)]">
            {/* Summary Card */}
            <div className="p-4 bg-[var(--color-gray-50)] rounded-xl mb-4">
              <p className="text-sm font-medium text-[var(--color-gray-500)] mb-2">Summary</p>
              <p className="text-[var(--color-black)]">{ideaSummary}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIdeaSummary(null);
                  setCurrentStep(0);
                }}
                className="flex-1 px-4 py-3 border border-[var(--color-gray-200)] rounded-xl text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 px-4 py-3 bg-[var(--color-accent)] rounded-xl text-[var(--color-black)] font-medium hover:bg-[var(--color-accent-dim)] transition-colors"
              >
                Submit Idea
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attribution Preview */}
      <div className="mt-6 p-4 bg-white rounded-xl border border-[var(--color-gray-200)]">
        <p className="text-xs text-[var(--color-gray-500)] mb-2">Your idea will be attributed to:</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-sm font-medium text-[var(--color-gray-600)]">
            SL
          </div>
          <div>
            <p className="font-medium text-[var(--color-black)]">Sara Lindqvist</p>
            <p className="text-sm text-[var(--color-gray-500)]">Product Designer · Product</p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <p className="mt-4 text-center text-xs text-[var(--color-gray-400)]">
        Your idea will be visible to everyone in the organization.
        <br />
        Ideas are never anonymous — attribution builds trust.
      </p>
    </div>
  );
}

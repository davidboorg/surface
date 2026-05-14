'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice' | 'image';
}

const suggestedPrompts = [
  'What keeps repeating?',
  'What feels inefficient?',
  'What frustrates customers?',
  'What should leadership understand?',
  'What tension keeps showing up?',
  'What feels broken?',
];

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'ai',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Companion error:', error);
    }

    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <header className="border-b border-[#E8E0D5] bg-[#FFFBF5]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center">
              <span className="text-white text-sm font-medium">S</span>
            </div>
            <span className="text-[#2C2416] font-medium group-hover:text-[#8B7355] transition-colors">
              Surface
            </span>
          </Link>
          <Link
            href="/pulse"
            className="text-sm text-[#6B5D4D] hover:text-[#2C2416] transition-colors"
          >
            View Pulse
          </Link>
        </div>
      </header>

      {/* Main conversation area */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {messages.length === 0 ? (
          // Empty state
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-[#2C2416] mb-3">
              What&apos;s on your mind?
            </h1>
            <p className="text-[#6B5D4D] text-center max-w-md mb-10 leading-relaxed">
              Share an observation, frustration, or opportunity. I&apos;ll help you
              clarify and connect it to what others are seeing.
            </p>

            {/* Suggested prompts */}
            <div className="flex flex-wrap justify-center gap-3 max-w-lg">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 rounded-full bg-white border border-[#E8E0D5] text-sm text-[#6B5D4D] hover:border-[#C9A962] hover:text-[#2C2416] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Conversation
          <div className="space-y-6 pb-32">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-[#2C2416] text-white rounded-2xl rounded-br-md'
                      : 'bg-white border border-[#E8E0D5] text-[#2C2416] rounded-2xl rounded-bl-md'
                  } px-5 py-4`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/50' : 'text-[#A09080]'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E8E0D5] rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#C9A962] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#C9A962] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#C9A962] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-[#A09080]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-transparent pt-8 pb-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] shadow-lg shadow-[#8B7355]/5 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what you're observing..."
              rows={1}
              className="w-full px-5 py-4 text-[#2C2416] placeholder-[#A09080] resize-none focus:outline-none bg-transparent max-h-40"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                {/* Voice input */}
                <button
                  onClick={handleVoiceToggle}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording
                      ? 'bg-red-500 text-white'
                      : 'text-[#A09080] hover:text-[#6B5D4D] hover:bg-[#F5F0E8]'
                  }`}
                  title="Voice input"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                {/* Image upload */}
                <button
                  className="p-2 rounded-full text-[#A09080] hover:text-[#6B5D4D] hover:bg-[#F5F0E8] transition-colors"
                  title="Upload image or screenshot"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="px-5 py-2 bg-[#2C2416] text-white rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3D3425] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-[#A09080] mt-3">
            Your observations help the organization understand itself better
          </p>
        </div>
      </div>
    </div>
  );
}

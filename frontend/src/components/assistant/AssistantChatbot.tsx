import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles } from 'lucide-react';
import { AIService } from '../../services/ai.service';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-slate-800 rounded-2xl">
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

export default function AssistantChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hi! I am your TradeSphere AI assistant. Ask me about trading, orders, wallet, portfolio, watchlist, or account features.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function sendMessage() {
    const cleanInput = input.trim();

    if (!cleanInput || thinking) return;

    const userMessage: Message = {
      role: 'user',
      text: cleanInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setThinking(true);

    try {
      const [response] = await Promise.all([
        AIService.chat(cleanInput),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      const botMessage: Message = {
        role: 'bot',
        text:
          response?.data?.reply ||
          'I could not generate a response right now. Please try again.',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            err?.response?.data?.message ||
            'AI assistant is temporarily unavailable. Please check your backend and Gemini API key.',
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 flex items-center justify-center transition"
        >
          <MessageCircle />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Bot size={21} />
              </div>

              <div>
                <h3 className="font-black flex items-center gap-2">
                  TradeSphere AI
                  <Sparkles size={15} className="text-indigo-400" />
                </h3>
                <p className="text-xs text-green-400">
                  {thinking ? 'Thinking...' : 'Powered by Gemini'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-[430px] overflow-y-auto p-5 space-y-4 bg-[#020617]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-md'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <TypingDots />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900">
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'How do I place a buy order?',
                'Explain portfolio P&L',
                'What is a limit order?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  disabled={thinking}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                disabled={thinking}
                placeholder={
                  thinking
                    ? 'Gemini is thinking...'
                    : 'Ask TradeSphere AI...'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-60"
              />

              <button
                onClick={sendMessage}
                disabled={thinking}
                className="w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
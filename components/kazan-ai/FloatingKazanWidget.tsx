'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CalendarCheck, GraduationCap, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const quickActions = [
  {
    label: 'Food cost 38%',
    icon: '🍳',
    prompt: 'Food cost-um 38 faizdir. 30-32 faizə necə endirim?',
  },
  {
    label: 'P&L oxu',
    icon: '📊',
    prompt: 'Restoran P&L hesabatında ilk hansı rəqəmlərə baxmalıyam?',
  },
  {
    label: 'AQTA hazırlıq',
    icon: '🧼',
    prompt: 'AQTA yoxlamasına hazırlaşmaq üçün bu həftə nə etməliyəm?',
  },
  {
    label: 'Delivery marja',
    icon: '🛵',
    prompt: 'Wolt və Bolt Food komissiyası ilə delivery menyusunu necə mənfəətli saxlayım?',
  },
];

const welcomeMessage =
  'Salam. Mən **KAZAN AI**-yam. Food cost, P&L, AQTA, delivery və açılış qərarlarını rəqəmlə izah edirəm.';

export default function FloatingKazanWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcomeMessage }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    });

    try {
      const response = await fetch('/api/kazan-ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || 'KAZAN AI cavab verə bilmədi.');
      }
      setMessages((current) => [...current, { role: 'assistant', content: payload.message || '' }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'Hazırda canlı cavab gecikir. Problemi ölç: food cost, əmək xərci, delivery komissiyası və satış mixini ayrı yaz. Sonra uyğun toolkit-dən başla: [Toolkit](/toolkit).',
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="kazan-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[min(690px,calc(100vh-110px))] w-[calc(100vw-32px)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-center justify-between bg-[var(--dk-navy)] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--dk-navy)]">
                  <Bot size={22} />
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[var(--dk-navy)] bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-base font-black">
                    KAZAN AI
                    <Sparkles size={15} className="text-[var(--dk-gold)]" />
                  </div>
                  <p className="text-xs font-semibold text-white/65">HoReCa qərar katibi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="KAZAN AI panelini bağla"
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'bg-[var(--dk-red)] text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-1 prose-a:text-[var(--dk-red)]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => void sendMessage(action.prompt)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-bold text-slate-700 transition hover:border-[var(--dk-gold)] hover:bg-amber-50"
                    >
                      <span className="mr-1.5">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {loading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <Loader2 size={16} className="animate-spin" />
                    KAZAN hesablayır...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <Link
                  href="/uzvluk"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <CalendarCheck size={14} />
                  Görüş al
                </Link>
                <Link
                  href="/toolkit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <GraduationCap size={14} />
                  Toolkit
                </Link>
              </div>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={1}
                  placeholder="Məsələn: food cost 38%, nə edim?"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Mesaj göndər"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--dk-red)] text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send size={17} />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] font-medium text-slate-400">AI cavabları qərar dəstəyi üçündür.</p>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'KAZAN AI panelini bağla' : 'KAZAN AI panelini aç'}
        className="ml-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--dk-navy)] text-[var(--dk-gold)] shadow-2xl shadow-[var(--dk-navy)]/30"
      >
        {open ? <X size={30} /> : <MessageCircle size={30} />}
      </motion.button>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  parseKazanContext,
  hasContext,
  buildPnlGreeting,
  buildReadinessGreeting,
} from '@/lib/kazan-ai/context-greetings';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function KazanAiChatClient() {
  const t = useTranslations('kazanAi');
  const searchParams = useSearchParams();
  const sampleQuestions = [t('samples.0'), t('samples.1'), t('samples.2'), t('samples.3'), t('samples.4')];

  const contextGreeting = useMemo(() => {
    const ctx = parseKazanContext(searchParams);
    if (!hasContext(ctx)) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translate = t as any;
    if (ctx.context === 'weekly_actions' && ctx.metrics) {
      return buildPnlGreeting(ctx.metrics, translate);
    }
    if (ctx.context === 'ai_readiness_result' && ctx.segment && ctx.score !== null) {
      return buildReadinessGreeting(ctx.segment, ctx.score, translate);
    }
    return null;
  }, [searchParams, t]);

  const initialMessage = contextGreeting || t('chat.initialMessage');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: initialMessage }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [throttleError, setThrottleError] = useState('');

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    const now = Date.now();
    const waitMs = 3000 - (now - lastSentAt);
    if (waitMs > 0) {
      setThrottleError(t('errors.throttle', { seconds: Math.ceil(waitMs / 1000) }));
      return;
    }

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setThrottleError('');
    setLastSentAt(now);

    try {
      const ctx = parseKazanContext(searchParams);
      const response = await fetch('/api/kazan-ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          ...(hasContext(ctx) ? { pnlContext: ctx } : {}),
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || t('errors.server'));
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: payload.message || '' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('errors.aiUnavailable'),
        },
      ]);
      if (error instanceof Error) console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-16">
      <div className="border-b border-[var(--dk-gold)]/20 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--dk-navy)] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
            <Sparkles size={14} />
            {t('hero.badge')}
          </div>
          <h1 className="max-w-3xl text-4xl font-display font-black tracking-tight text-slate-900 sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {t('hero.intro')}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <section className="flex min-h-[68vh] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-[var(--dk-navy)] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                <Bot size={22} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--dk-gold)]">{t('chat.header')}</div>
                <div className="text-lg font-bold text-white">KAZAN AI</div>
              </div>
            </div>
            <Link href="/toolkit" className="text-sm font-bold text-[var(--dk-gold)] transition-colors hover:text-amber-200">
              {t('chat.toolkitLabel')}
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[color-mix(in srgb, var(--dk-paper) 78%, white)] px-4 py-5 sm:px-6">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-[1.5rem] px-4 py-3 shadow-sm sm:max-w-[78%] ${
                    message.role === 'user'
                      ? 'bg-[var(--dk-navy)] text-white'
                      : 'border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-slate-900">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => {
                            const url = href || '#';
                            if (url.startsWith('/')) {
                              return (
                                <Link href={url} className="font-semibold text-[var(--dk-red)] underline underline-offset-4">
                                  {children}
                                </Link>
                              );
                            }

                            return (
                              <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-[var(--dk-red)] underline underline-offset-4">
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {t('chat.loading')}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t('chat.placeholder')}
                rows={3}
                className="min-h-[84px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--dk-red)] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {t('chat.sendButton')}
                <Send size={16} />
              </button>
            </div>
            {throttleError ? <p className="mt-3 text-sm font-medium text-[var(--dk-red)]">{throttleError}</p> : null}
          </form>
        </section>

        <aside className="space-y-6">
          <Image
            src="/images/ai-consulting.png"
            alt={t('chat.imageAlt')}
            width={420}
            height={320}
            priority
            className="hidden max-h-[320px] w-full object-contain lg:block"
          />

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--dk-gold)]">{t('sidebar.heading')}</div>
            <div className="mt-4 space-y-3">
              {sampleQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => void sendMessage(question)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-[var(--dk-gold)] hover:bg-amber-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t('sidebar.integrationHeading')}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t('sidebar.body')}
            </p>
            <div className="mt-4 space-y-3">
              <Link href="/toolkit/food-cost" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                {t('sidebar.toolLinks.foodCost')}
              </Link>
              <Link href="/toolkit/pnl" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                {t('sidebar.toolLinks.pnl')}
              </Link>
              <Link href="/toolkit/delivery-calc" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                {t('sidebar.toolLinks.delivery')}
              </Link>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--dk-red)]/20 bg-rose-50 p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--dk-red)]">{t('sales.heading')}</div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {t('sales.body')}
            </p>
            <Link href="/elaqe" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--dk-red)] transition-colors hover:text-rose-700">
              {t('sales.cta')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

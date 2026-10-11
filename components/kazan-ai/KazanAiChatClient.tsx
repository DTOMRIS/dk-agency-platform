'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Bot, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import s from '@/components/inner/inner.module.css';
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
  // TASK-0542: ?q= (blog «KAZAN-dan soruş») fills the box — the visitor reads it and presses Send.
  const [input, setInput] = useState(() => (searchParams.get('q') ?? '').slice(0, 300));
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

  const card = 'rounded-[22px] border border-[#E4DCCD] bg-white p-6';
  const cardLabel = 'text-[11.5px] font-black uppercase tracking-[0.14em]';

  return (
    <div className={`${s.page} ${inter.className}`}>
      <div className={home.wrap}>
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('hero.badge')}
              </span>
            </div>
            <h1>{t('hero.title')}</h1>
            <p className={s.lead}>{t('hero.intro')}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="flex min-h-[68vh] flex-col overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#EFE9DE] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F172A] text-white">
                  <Bot size={20} aria-hidden="true" />
                </div>
                <div>
                  <div className={`${cardLabel} text-[#BE2F47]`}>{t('chat.header')}</div>
                  <div className="text-[17px] font-black tracking-[-0.01em] text-[#0F172A]">KAZAN AI</div>
                </div>
              </div>
              <Link
                href="/toolkit"
                className="inline-flex min-h-10 items-center rounded-full border border-[#E4DCCD] bg-white px-4 text-[13.5px] font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]"
              >
                {t('chat.toolkitLabel')}
              </Link>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#FBF8F3] px-4 py-5 sm:px-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] rounded-[18px] px-4 py-3 sm:max-w-[78%] ${
                      message.role === 'user'
                        ? 'bg-[#0F172A] text-white'
                        : 'border border-[#E4DCCD] bg-white text-slate-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-[#0F172A]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => {
                              const url = href || '#';
                              if (url.startsWith('/')) {
                                return (
                                  <Link href={url} className="font-semibold text-[#BE2F47] underline underline-offset-4">
                                    {children}
                                  </Link>
                                );
                              }

                              return (
                                <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-[#BE2F47] underline underline-offset-4">
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
                  <div className="inline-flex items-center gap-2 rounded-[18px] border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-slate-600">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    {t('chat.loading')}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#EFE9DE] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t('chat.placeholder')}
                  rows={3}
                  className="min-h-[84px] flex-1 resize-none rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-slate-500 focus:border-[#0F172A]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {t('chat.sendButton')}
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>
              {throttleError ? <p className="mt-3 text-sm font-medium text-[#BE2F47]">{throttleError}</p> : null}
            </form>
          </section>

          <aside className="space-y-5">
            <Image
              src="/images/ai-consulting.png"
              alt={t('chat.imageAlt')}
              width={420}
              height={320}
              priority
              className="hidden max-h-[320px] w-full object-contain lg:block"
            />

            <div className={card}>
              <div className={`${cardLabel} text-[#BE2F47]`}>{t('sidebar.heading')}</div>
              <div className="mt-4 space-y-2.5">
                {sampleQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    className="w-full rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-left text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#0F172A] hover:bg-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <div className={`${cardLabel} text-slate-500`}>{t('sidebar.integrationHeading')}</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t('sidebar.body')}</p>
              <div className="mt-4 space-y-2.5">
                <Link href="/toolkit/food-cost" className="flex items-center justify-between rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]">
                  {t('sidebar.toolLinks.foodCost')}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/toolkit/pnl" className="flex items-center justify-between rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]">
                  {t('sidebar.toolLinks.pnl')}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link href="/toolkit/delivery-calc" className="flex items-center justify-between rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]">
                  {t('sidebar.toolLinks.delivery')}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="rounded-[22px] bg-[#0F172A] p-6 text-white">
              <div className={`${cardLabel} text-[#F28A9B]`}>{t('sales.heading')}</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{t('sales.body')}</p>
              <Link
                href="/elaqe"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep"
              >
                {t('sales.cta')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

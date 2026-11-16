'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  ChefHat,
  ExternalLink,
  Loader2,
  Send,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import KazanContactAction from "@/components/kazan-ai/KazanContactAction";
import { openContact } from "@/lib/contact/message-form";
import { whatsappHref as siteWhatsappHref } from "@/lib/contact-channels";
import { buildWhatsappLink } from '@/lib/utils/whatsapp';

// TASK-0531: the markdown renderer loads only when a reply is drawn (not on every page view).
const KazanMarkdown = dynamic(() => import('@/components/kazan-ai/KazanMarkdown'), {
  loading: () => null,
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type BusinessType = 'restoran' | 'kafe' | 'franchise' | 'diger';
type LeadIntent = 'food_cost' | 'pnl' | 'aqta' | 'delivery' | 'general';

type KazanLead = {
  id: string;
  name: string;
  phone: string;
  businessType: BusinessType;
  intent: LeadIntent;
};

function detectIntent(text: string): LeadIntent {
  const value = text.toLowerCase();
  if (value.includes('food') || value.includes('cost') || value.includes('maya'))
    return 'food_cost';
  if (
    value.includes('p&l') ||
    value.includes('pnl') ||
    value.includes('mənfəət') ||
    value.includes('menfeet')
  )
    return 'pnl';
  if (value.includes('aqta') || value.includes('gigiyena')) return 'aqta';
  if (value.includes('delivery') || value.includes('wolt') || value.includes('bolt'))
    return 'delivery';
  return 'general';
}

function recentMessages(messages: Message[], pendingQuestion?: string) {
  const context = messages.slice(-3);
  if (pendingQuestion) {
    return [...context, { role: 'user' as const, content: pendingQuestion }].slice(-3);
  }
  return context;
}

function lastUserQuestions(messages: Message[], pendingQuestion?: string) {
  return recentMessages(messages, pendingQuestion)
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .reverse();
}

export default function FloatingKazanWidget() {
  const t = useTranslations('kazanWidget');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('welcome') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<KazanLead | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const contactContextAddedRef = useRef(false);

  const samplePrompts = [t('prompt1'), t('prompt2'), t('prompt3'), t('prompt4')];
  function toolkitAction(intent: LeadIntent) {
    if (intent === 'pnl') return { label: t('toolAction.pnl'), href: '/toolkit/pnl' };
    if (intent === 'aqta') return { label: t('toolAction.aqta'), href: '/toolkit/aqta-checklist' };
    if (intent === 'delivery')
      return { label: t('toolAction.delivery'), href: '/toolkit/delivery-calc' };
    return { label: t('toolAction.foodCost'), href: '/toolkit/food-cost' };
  }

  const activeIntent =
    lead?.intent ||
    detectIntent(messages.map((message) => message.content).join(' '));
  const toolAction = toolkitAction(activeIntent);
  const whatsappHref = buildWhatsappLink(
    {
      name: lead?.name,
      businessType: lead?.businessType,
    },
    lastUserQuestions(messages)
  );

  // TASK-0536: the proactive question bubble (KazanNudge) asks one question; the visitor's answer arrives here
  // via `kazan:ask` — the panel opens with that question as KAZAN's line and sends the answer.
  const [pendingAsk, setPendingAsk] = useState<{ intro: string; question: string } | null>(null);
  useEffect(() => {
    function onAsk(event: Event) {
      const detail = (event as CustomEvent<{ intro?: string; question?: string }>).detail;
      if (!detail?.question) return;
      setOpen(true);
      // The question goes into the list right away; the answer is sent on the next render, when `messages`
      // already holds it (sending in the same tick used a stale list and dropped the question).
      if (detail.intro) setMessages((current) => [...current, { role: 'assistant', content: detail.intro as string }]);
      setPendingAsk({ intro: '', question: detail.question });
    }
    window.addEventListener('kazan:ask', onAsk);
    return () => window.removeEventListener('kazan:ask', onAsk);
  }, []);
  useEffect(() => {
    if (!pendingAsk || loading) return;
    const ask = pendingAsk;
    const id = window.requestAnimationFrame(() => {
      setPendingAsk(null);
      void sendMessage(ask.question);
    });
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAsk, loading]);

  useEffect(() => {
    function openFromContactPage(event: Event) {
      const customEvent = event as CustomEvent<{ context?: string }>;
      setOpen(true);
      if (contactContextAddedRef.current) return;
      contactContextAddedRef.current = true;
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: customEvent.detail?.context || t('contactPageFallback'),
        },
      ]);
    }

    window.addEventListener('kazan:open', openFromContactPage);
    window.addEventListener('dk:kazan-ai:open', openFromContactPage);
    return () => {
      window.removeEventListener('kazan:open', openFromContactPage);
      window.removeEventListener('dk:kazan-ai:open', openFromContactPage);
    };
  }, [t]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  async function patchLead(
    payload: Partial<{ whatsappHandoff: boolean; meetingRequested: boolean; status: string }>
  ) {
    if (!lead?.id) return;
    try {
      // fake-scan-ok: CTA analytics only — the visitor's WhatsApp/meeting step must not depend on it
      await fetch('/api/kazan-ai/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: lead.id, ...payload }),
      });
    } catch {
      // CTA click should still continue even if analytics update fails.
    }
  }

  async function callAi(question: string, currentMessages: Message[]) {
    const nextMessages: Message[] = [...currentMessages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch('/api/kazan-ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || t('errorAiFailed'));
      }
      setMessages((current) => [...current, { role: 'assistant', content: payload.message || '' }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: t('errorFallback'),
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    await callAi(trimmed, messages);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function requireLeadForAction(event: MouseEvent<HTMLAnchorElement>) {
    if (lead) return false;
    event.preventDefault();
    openContact(siteWhatsappHref(lastUserQuestions(messages)[0] || t('welcome')), { source: 'kazan_widget', messages, onSaved: contact => setLead({ ...contact, id: contact.id ?? '' }) });
    return true;
  }

  function renderAssistantActions() {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            if (requireLeadForAction(event)) return;
            void patchLead({ whatsappHandoff: true });
          }}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-black text-white transition hover:bg-emerald-700"
        >
          {t('whatsappCta')}
          <ExternalLink size={13} />
        </a>
        <Link
          href="/elaqe"
          onClick={(event) => {
            if (requireLeadForAction(event)) return;
            void patchLead({ meetingRequested: true });
          }}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#D63B54]"
        >
          {t('meetingCta')}
        </Link>
        <Link
          href={toolAction.href}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#D63B54]"
        >
          {toolAction.label}
        </Link>
      </div>
    );
  }

  return (
    // TASK-0516: lifts above the cookie bar while it is shown (--dk-cookie-bar-h, set by CookiesBanner).
    // TASK-0518: also above the tool result sheet (--dk-tool-sheet-h) and hidden while that sheet is open.
    <div className="fixed bottom-[calc(5.5rem+var(--dk-cookie-bar-h,0px)+var(--dk-tool-sheet-h,0px))] [[data-dk-sheet-open]_&]:hidden right-3 z-[70] sm:right-6 lg:bottom-[calc(2rem+var(--dk-cookie-bar-h,0px))] lg:right-8">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="kazan-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex h-[min(680px,calc(100dvh-180px))] w-[calc(100vw-20px)] max-w-[460px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:mb-4 sm:h-[min(720px,calc(100dvh-190px))] lg:h-[min(720px,calc(100dvh-110px))] sm:w-[calc(100vw-32px)]"
          >
            <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0F172A]">
                  <ChefHat size={22} />
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#0F172A] bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-base font-black">
                    KAZAN AI
                    <Sparkles size={15} className="text-[#F28A9B]" />
                  </div>
                  <p className="text-xs font-semibold text-white/65">{t('subtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('closePanel')}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'bg-dk-red-strong text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-1 prose-a:text-[var(--dk-red)]">
                          <KazanMarkdown>{message.content}</KazanMarkdown>
                        </div>
                        {index > 0 ? renderAssistantActions() : null}
                      </>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 ? (
                <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                  {samplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-bold text-slate-700 transition hover:border-[#D63B54] hover:bg-[#FBEFF1]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              {loading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <Loader2 size={16} className="animate-spin" />
                    {t('calculating')}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3">
              {!loading && messages.at(-1)?.role === 'assistant' && messages.some(m => m.role === 'user') && <div className="mb-3"><KazanContactAction messages={messages} source="kazan_widget" contactSaved={!!lead} onSaved={contact => setLead({ ...contact, id: contact.id ?? '' })} /></div>}
              <div className="mb-3 grid grid-cols-2 gap-2">
                <Link
                  href="/elaqe"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <CalendarCheck size={14} />
                  {t('getMeeting')}
                </Link>
                <Link
                  href={toolAction.href}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Utensils size={14} />
                  {toolAction.label}
                </Link>
              </div>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={1}
                  placeholder={t('inputPlaceholder')}
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#D63B54]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label={t('sendMessage')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dk-red-strong text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send size={17} />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
                {t('aiDisclaimer')}
              </p>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* TASK-0520: no floating launcher below lg — the bottom nav (also lg:hidden) has KAZAN AI in its
          centre (→ /kazan-ai) and the launcher covered «Pulsuz üzv ol» and form inputs on phones.
          The panel itself still opens on phones via `kazan:open` (e.g. /elaqe) and closes with its own X. */}
      <motion.button
        type="button"
        data-testid="kazan-launcher"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? t('closePanel') : t('openPanel')}
        // TASK-0529 (owner 10.10 «whatsapp digərlərində fərqli olmuş»): the old navy square with a chat
        // bubble read as a second WhatsApp. Now a v2 ink pill that says what it is.
        className="ml-auto hidden h-14 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-5 text-[15px] font-black tracking-[-0.01em] text-white shadow-[0_14px_34px_-12px_rgba(15,23,42,0.55)] lg:flex"
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <Sparkles size={18} className="text-[#F28A9B]" aria-hidden="true" />
            KAZAN AI
          </>
        )}
      </motion.button>
    </div>
  );
}

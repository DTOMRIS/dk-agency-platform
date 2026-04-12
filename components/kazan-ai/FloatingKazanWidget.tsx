'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  CalendarCheck,
  ChefHat,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { FormEvent, MouseEvent, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';

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

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  businessType: BusinessType;
};

const welcomeMessage =
  'Salam. Mən **KAZAN AI**-yam. Food cost, P&L, AQTA, delivery və açılış qərarlarını rəqəmlə izah edirəm.';

const samplePrompts = [
  'Food cost-um 38 faizdir. 30-32 faizə necə endirim?',
  'Restoran P&L hesabatında ilk hansı rəqəmlərə baxmalıyam?',
  'AQTA yoxlamasına hazırlaşmaq üçün bu həftə nə etməliyəm?',
  'Wolt və Bolt Food komissiyası ilə delivery menyusunu necə mənfəətli saxlayım?',
];

const businessTypeLabels: Record<BusinessType, string> = {
  restoran: 'Restoran',
  kafe: 'Kafe',
  franchise: 'Franchise',
  diger: 'Digər',
};

function detectIntent(text: string): LeadIntent {
  const value = text.toLowerCase();
  if (value.includes('food') || value.includes('cost') || value.includes('maya')) return 'food_cost';
  if (value.includes('p&l') || value.includes('pnl') || value.includes('mənfəət') || value.includes('menfeet')) return 'pnl';
  if (value.includes('aqta') || value.includes('gigiyena')) return 'aqta';
  if (value.includes('delivery') || value.includes('wolt') || value.includes('bolt')) return 'delivery';
  return 'general';
}

function toolkitAction(intent: LeadIntent) {
  if (intent === 'pnl') return { label: 'P&L hesabla', href: '/toolkit/pnl' };
  if (intent === 'aqta') return { label: 'AQTA checklist', href: '/toolkit/aqta-checklist' };
  if (intent === 'delivery') return { label: 'Delivery hesabla', href: '/toolkit/delivery-calc' };
  return { label: 'Food cost hesabla', href: '/toolkit/food-cost' };
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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcomeMessage }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [lead, setLead] = useState<KazanLead | null>(null);
  const [leadGateOpen, setLeadGateOpen] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [leadForm, setLeadForm] = useState<LeadFormState>({
    name: '',
    phone: '',
    email: '',
    businessType: 'restoran',
  });
  const messagesRef = useRef<HTMLDivElement>(null);

  const activeIntent = lead?.intent || detectIntent([pendingQuestion, ...messages.map((message) => message.content)].join(' '));
  const toolAction = toolkitAction(activeIntent);
  const whatsappHref = buildWhatsappLink(
    {
      name: lead?.name || leadForm.name,
      businessType: lead?.businessType || leadForm.businessType,
    },
    lastUserQuestions(messages, pendingQuestion),
  );

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  async function patchLead(payload: Partial<{ whatsappHandoff: boolean; meetingRequested: boolean; status: string }>) {
    if (!lead?.id) return;
    try {
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
      scrollToBottom();
    }
  }

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading || leadSaving) return;

    const userMessageCount = messages.filter((message) => message.role === 'user').length;
    if (!lead && userMessageCount >= 2) {
      setPendingQuestion(trimmed);
      setInput('');
      setLeadGateOpen(true);
      setLeadError('AI cavabı davam etdirmək üçün əvvəl əlaqə məlumatını saxlamalıyam.');
      scrollToBottom();
      return;
    }

    await callAi(trimmed, messages);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = leadForm.name.trim();
    const phone = leadForm.phone.trim();

    if (!name || !phone) {
      setLeadError('Ad və telefon yaz, sonra davam edək.');
      return;
    }

    setLeadSaving(true);
    setLeadError('');
    const questionForIntent = pendingQuestion || messages.filter((message) => message.role === 'user').at(-1)?.content || '';

    try {
      const response = await fetch('/api/kazan-ai/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          conversationContext: recentMessages(messages, pendingQuestion),
          intent: detectIntent(questionForIntent),
        }),
      });
      const payload = (await response.json()) as { data?: KazanLead; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Lead saxlanmadı.');
      }

      setLead(payload.data);
      setLeadGateOpen(false);
      const question = pendingQuestion;
      setPendingQuestion('');
      if (question) {
        await callAi(question, messages);
      }
    } catch {
      setLeadError('Məlumat saxlanmadı. Telefon formatını yoxla və yenidən cəhd et.');
    } finally {
      setLeadSaving(false);
      scrollToBottom();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function requireLeadForAction(event: MouseEvent<HTMLAnchorElement>) {
    if (lead) return false;
    event.preventDefault();
    setLeadGateOpen(true);
    setLeadError('Bu addımı açmaq üçün əvvəl ad və telefonunu saxla.');
    scrollToBottom();
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
          WhatsApp-da yaz
          <ExternalLink size={13} />
        </a>
        <Link
          href="/elaqe"
          onClick={(event) => {
            if (requireLeadForAction(event)) return;
            void patchLead({ meetingRequested: true });
          }}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[var(--dk-gold)]"
        >
          Görüş planla
        </Link>
        <Link
          href={toolAction.href}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[var(--dk-gold)]"
        >
          {toolAction.label}
        </Link>
      </div>
    );
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
            className="mb-4 flex h-[min(720px,calc(100vh-110px))] w-[calc(100vw-32px)] max-w-[460px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-center justify-between bg-[var(--dk-navy)] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--dk-navy)]">
                  <ChefHat size={22} />
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
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'bg-[var(--dk-red)] text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-1 prose-a:text-[var(--dk-red)]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
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
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-bold text-slate-700 transition hover:border-[var(--dk-gold)] hover:bg-amber-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              {leadGateOpen ? (
                <form onSubmit={submitLead} className="rounded-2xl border border-[var(--dk-gold)] bg-white p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[var(--dk-gold)]">
                      <Bot size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--dk-navy)]">Sənə daha dəqiq cavab vermək üçün:</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Ad, telefon və işletmə tipini saxlayım, sonra sualına davam edim.</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <input
                      value={leadForm.name}
                      onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Ad"
                      className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
                    />
                    <input
                      value={leadForm.phone}
                      onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="+994 50 000 00 00"
                      className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
                    />
                    <input
                      value={leadForm.email}
                      onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email (istəyə bağlı)"
                      className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
                    />
                    <select
                      value={leadForm.businessType}
                      onChange={(event) =>
                        setLeadForm((current) => ({ ...current, businessType: event.target.value as BusinessType }))
                      }
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--dk-gold)]"
                    >
                      {Object.entries(businessTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {leadError ? <p className="mt-2 text-xs font-semibold text-[var(--dk-red)]">{leadError}</p> : null}
                  <button
                    type="submit"
                    disabled={leadSaving}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--dk-red)] px-4 text-sm font-black text-white transition hover:bg-rose-600 disabled:bg-slate-300"
                  >
                    {leadSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                    Davam et
                  </button>
                </form>
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
                  href="/elaqe"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <CalendarCheck size={14} />
                  Görüş al
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
                  placeholder="Məsələn: food cost 38%, nə edim?"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
                />
                <button
                  type="submit"
                  disabled={loading || leadSaving || !input.trim()}
                  aria-label="Mesaj göndər"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--dk-red)] text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
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

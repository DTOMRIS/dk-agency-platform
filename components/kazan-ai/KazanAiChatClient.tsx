'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Bot, Loader2, Send, Sparkles } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SAMPLE_QUESTIONS = [
  'Food cost-um %38, nə etməliyəm?',
  'P&L necə oxunur?',
  'AQTA yoxlamasına necə hazırlaşım?',
  'Delivery mənfəətlidirmi?',
  'Menyu neçə yemək olmalıdır?',
];

const INITIAL_ASSISTANT =
  'Salam. Mən **KAZAN AI**-yam. Food cost, P&L, AQTA, delivery, açılış və marka qərarlarını Azərbaycan HoReCa reallığına görə şərh edirəm.\n\nBaşlamaq üçün belə soruş:\n- Food cost-um %38-dir, nə etməliyəm?\n- P&L-də ilk hansı rəqəmə baxım?\n- Delivery menyusunu necə mənfəətli edim?\n\nToolkit: [Food Cost kalkulyatoru](/toolkit/food-cost)\nBlog: [Food Cost yazısı](/blog/1-porsiya-food-cost-hesablama)';

export default function KazanAiChatClient() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: INITIAL_ASSISTANT }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/kazan-ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || 'Server xətası');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: payload.message || '' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Hazırda server tərəfdə AI bağlantısı əlçatan deyil. Yenə də ölçünü itirmə:\n\n1. Problemi ölç\n2. Uyğun toolkit-i işə sal\n3. Sonra qərarı ver və ya görüş təyin et\n\nToolkit: [Bütün alətlər](/toolkit)\nBlog: [Bloq bölməsi](/blog)\nKonsultasiya: [DK Agency ilə görüş](/elaqe)',
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
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--dk-navy)] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
            <Sparkles size={14} />
            KAZAN AI Beta
          </div>
          <h1 className="max-w-3xl text-4xl font-display font-black tracking-tight text-slate-900 sm:text-5xl">
            KAZAN AI — Restoranının AI danışmanı
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            KAZAN AI food cost, P&L, AQTA, delivery və açılış qərarlarını tək cavabla deyil, növbəti düzgün addımla verir.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <section className="flex min-h-[68vh] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dk-navy)] text-white">
                <Bot size={22} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Canlı Chat</div>
                <div className="text-lg font-bold text-slate-900">KAZAN AI</div>
              </div>
            </div>
            <Link href="/toolkit" className="text-sm font-bold text-[var(--dk-red)] transition-colors hover:text-rose-700">
              Toolkit →
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
                  KAZAN hesablayır...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Məsələn: Food cost-um %38-dir, 30%-ə necə düşürəm?"
                rows={3}
                className="min-h-[84px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--dk-red)] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Göndər
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--dk-gold)]">Nümunə suallar</div>
            <div className="mt-4 space-y-3">
              {SAMPLE_QUESTIONS.map((question) => (
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
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">İnteqrasiya</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Food Cost kalkulyatorunu sınadın? Nəticəni burada paylaş və KAZAN-dan onu necə yaxşılaşdıracağını soruş.
            </p>
            <div className="mt-4 space-y-3">
              <Link href="/toolkit/food-cost" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                Food Cost kalkulyatoru
              </Link>
              <Link href="/toolkit/pnl" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                P&L simulyatoru
              </Link>
              <Link href="/toolkit/delivery-calc" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
                Delivery kalkulyatoru
              </Link>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--dk-red)]/20 bg-rose-50 p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--dk-red)]">Satış layer</div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              KAZAN AI problemi ölçməyə kömək edir. Sistem qurmaq, audit etmək və nəticəni real mənfəətə çevirmək üçün növbəti addım danışmanlıqdır.
            </p>
            <Link href="/elaqe" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--dk-red)] transition-colors hover:text-rose-700">
              DK Agency ilə görüş
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

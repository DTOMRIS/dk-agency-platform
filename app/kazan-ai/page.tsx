import Link from 'next/link';
import { ArrowRight, Bot, CircleHelp, Sparkles, Zap } from 'lucide-react';

export const metadata = {
  title: 'KAZAN AI — Restoranının AI danışmanı',
  description: 'KAZAN AI restoranlar üçün satış odaklı AI danışmanı və konsultasiya teaser səhifəsidir.',
};

const sampleAnswer = [
  'Food cost-u dərhal 33% hədəfinə yaxınlaşdır.',
  'Aşağı marjlı məhsulları menyudan çıxar və ya qiyməti düzəlt.',
  'Portion ölçüsünü qramla sabitləşdir, resepti standartlaşdır.',
  'Delivery və dine-in qiymətlərini ayır, kanalı ayrıca izlət.',
  'Hər həftə P&L, food cost və kassaya görə 1 qərar çıxart.',
];

const integrationCards = [
  {
    title: 'Food Cost kalkulyatoru',
    desc: 'Önce hesabla, sonra KAZAN AI-a sor: nəticəni necə yaxşılaşdırmaq olar?',
    href: '/toolkit/food-cost',
  },
  {
    title: 'P&L və başabaş',
    desc: 'Marjanı, sabit xərci və real profit xəttini bir yerdə gör.',
    href: '/toolkit/pnl',
  },
];

export default function KazanAiPage() {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#0f1722] px-4 py-10 text-[#f4f5f2] sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101a27] via-[#132233] to-[#0f1722] shadow-2xl shadow-black/30">
          <div className="absolute inset-0">
            <div className="absolute left-[-8%] top-[-18%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute right-[-10%] top-[-10%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          </div>

          <div className="relative grid gap-10 px-6 py-10 md:px-10 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:px-12 lg:py-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#a8c2d7]">
                <Sparkles size={14} className="text-cyan-300" />
                Tezliklə
              </div>

              <h1 className="max-w-2xl text-4xl font-display font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                KAZAN AI
                <span className="mt-3 block bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                  Restoranının AI danışmanı
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#c8d4e2] sm:text-lg">
                Burada məqsəd sadəcə cavab vermək deyil. KAZAN AI menyu, food cost, marja,
                delivery və əməliyyat qərarlarını satışa yönəlmiş konsultasiya formatında izah edəcək.
                Hələ teaser mərhələsidir, amma kontur artıq hazırdır.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#87a4bf]">
                    Fokus
                  </div>
                  <div className="text-lg font-bold text-white">Satış, marja və qərar</div>
                  <p className="mt-2 text-sm leading-6 text-[#b9c8d7]">
                    AI cavabları ümumi deyil, konkret biznes addımına bağlanacaq.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#87a4bf]">
                    Status
                  </div>
                  <div className="text-lg font-bold text-white">Teaser səhifə</div>
                  <p className="mt-2 text-sm leading-6 text-[#b9c8d7]">
                    Hələ tam işləmir. İlk olaraq maraqlı lead toplayırıq, sonra AI-i qat-qat açırıq.
                  </p>
                </div>
              </div>
            </div>

            <aside className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#0e1a28]/80 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                  <Bot size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Nümunə sual-cavab</div>
                  <div className="text-xs text-[#87a4bf]">Food cost krizi üçün ilk yardım</div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                  Sual
                </div>
                <p className="mt-2 text-sm leading-6 text-white">
                  Food cost-um %38, nə etməliyəm?
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                  5 addım
                </div>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-[#dce7f0]">
                  {sampleAnswer.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-bold text-emerald-300">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#121c2a] p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center gap-2 text-cyan-300">
              <CircleHelp size={18} />
              <h2 className="text-base font-bold text-white">Hazır olanda xəbər ver</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[#b9c8d7]">
              KAZAN AI açılan kimi xəbər alsın. Bu siyahıdan gələnlərə daha sonra consult/upsell flow bağlanacaq.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email ünvanın"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-[#6f859b] focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400">
                Hazır olanda xəbər ver
                <Zap size={16} />
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#121c2a] p-6 shadow-xl shadow-black/20">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#87a4bf]">
              Consult satış
            </div>
            <p className="text-sm leading-6 text-[#dce7f0]">
              KAZAN AI təkcə chatbot olmayacaq. Food Cost, P&L, delivery və menyu matrisi ilə inteqrasiya edib
              konkret konsultasiya paketi satacaq.
            </p>
            <Link
              href="/elaqe"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-100"
            >
              Konsultasiya soruş
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[#121c2a] p-6">
          <div className="mb-4 flex items-center gap-2 text-emerald-300">
            <Sparkles size={18} />
            <h2 className="text-base font-bold text-white">Alət inteqrasiyası</h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#b9c8d7]">
            Food Cost kalkulyatorunu sınadın? İndi KAZAN AI-a sor, nəticəni necə yaxşılaşdıra bilərsən.
            Eyni xəttdə P&L, delivery və başabaş analizini də bir araya gətirəcəyik.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {integrationCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-cyan-300/30 hover:bg-white/8"
              >
                <div className="text-sm font-bold text-white">{card.title}</div>
                <p className="mt-2 text-sm leading-6 text-[#b9c8d7]">{card.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition-all group-hover:gap-3">
                  Aç
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

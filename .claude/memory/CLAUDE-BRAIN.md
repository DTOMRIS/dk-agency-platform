# 🧠 CLAUDE BRAIN — hər session başında avtomatik yüklənir

> Bu fayl `scripts/session-brain.mjs` ilə SessionStart-da kontekstə inject olunur.
> Məqsəd: hər yeni session SIFIRDAN deyil, **bütün kritik bilik ilə** başlasın.
> Qısa və yüksək-siqnal saxla. Tam detal → `docs/LESSONS.md`, `docs/STATE.md`, `docs/DECISIONS.md`.

## 0) NƏ İŞ GÖRÜRÜK
DK Agency — Azərbaycanın AI-dəstəkli HoReCa B2B platforması (consulting + digital tools + AI).
Stack: Next.js 16 (App Router) · next-intl (AZ/RU/EN/TR, default **az**, `localePrefix: 'as-needed'`) ·
Drizzle + Neon Postgres · Tailwind · AI router: **DeepSeek (primary) + Claude (fallback)**.
Deploy: **Hostinger Web Apps, `main`-dən auto-deploy.**

## 1) DƏYİŞMƏZ QAYDALAR (pozma)
- HƏR task = branch + PR + dk-validator. `git push --no-verify` QADAĞAN.
- PROTECTED (icazəsiz toxunma): `lib/member-access.ts`, `lib/listingFieldConfig.ts`,
  `lib/marketing-tools-config.ts`, `middleware.ts`, `Header.tsx`, `Footer.tsx`,
  `app/layout.tsx`, `next.config.ts`, `package.json`, `tailwind.config.ts`. `.env*`-ə yazma (Hostinger panel).
- `any` yox → `unknown`. Production-da `console.log` yox. UI default dili **AZ**.
- i18n yalnız **Pattern A** (`useTranslations`) — inline `copyByLocale`/Record yox (L-004, L-009).
- Kontrast: işıqlı fonda `text-white` QADAĞAN; interaktiv element həmişə `text-slate-700/900` (WCAG AA).
- AQTA SST (dəyişdirmə): «AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.»

## 2) ARXİTEKTURA İNVARİANTLARI (səhv etmə)
- **L-038 ROOT-MIRROR**: default-locale (az) prefix-siz route-lar middleware rewrite ilə YOX,
  hər route üçün ROOT-LEVEL mirror ilə işləyir. Yeni `app/[locale]/X` yaradanda HƏMİŞƏ
  `app/X/page.tsx` → `export { default } from '@/app/[locale]/X/page';` mirror-u da yarat.
  Yoxlamanı HƏMİŞƏ prefix-siz URL ilə et (`/sektor/otel`, `/marketinq/menyu-analitik`), təkcə `/en/...` yox.
- `[locale]` səhifədə locale-i `params`-dan yox, lazım gəldikdə `getLocale()` (next-intl/server)-dən al ki, mirror da işləsin.
- **AI insight**: yeni alət üçün YENİ API route açma. `app/actions/toolkit-insight.ts`-də
  `TOOL_PROMPTS` reyestrinə prompt əlavə et + `getToolkitInsight` çağır (L-009 DRY, rate-limit + fallback hazır).
- AI router yalnız 2 provayder: `lib/ai-router.ts` (`deepseek` | `claude`). Yeni provayder = ayrı task.
- Böyük faylları (`messages/*.json` ~830KB, DEVLOG, SYSTEM-AUDIT) TAM oxuma → `grep`/offset+limit (L-033).

## 3) DEPLOY REALLIĞI (ən çox bura ilişirik)
- **merge ≠ canlı.** main-ə merge etmək kifayət deyil — Hostinger deploy + **Node restart** olmalı.
  Build yarımçıq/OOM olarsa köhnə `.next` qalır → 404/503. "Çıxmadı" deyəndə ƏVVƏL deploy/restart yoxla.
- **503 = resurs/OOM**: paylaşılan planda çox sayt + `next build` 4GB RAM çəkir → app öldürülür. Kod yox, infra.
- `next build` bu mühitdə `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` istəyir (Google Fonts TLS), yoxsa font-da fail — kod problemi deyil.
- Hostinger idle prosesi öldürür → self-ping faydasız, xarici ping lazım (`scripts/keep-alive.sh`) (L-034).
- `@types/*` `dependencies`-də olmalı (Hostinger devDeps install etmir) (L-005).

## 4) TƏKRARLANAN TƏLƏLƏR (tam: docs/LESSONS.md)
- **L-001/L-008**: PR merge ≠ done. Production smoke məcburi. Köhnə PR-sız commit-ləri nümunə götürmə.
- **L-003 SARMAL**: eyni fix 2 dəfə fail-sə DUR, kök səbəbi araşdır (web/GitHub), 3-cünü kor-koranə yazma.
- **L-031/L-032**: "yoxdur/boşluq" demədən əvvəl grep et — çox vaxt onsuz da var. Schema-ya əl vurmadan mövcud export-ları yoxla.
- **L-016**: target fayl təmizdirsə, repo-wide köhnə lint debt task-ı bloklamamalı — ayrı task aç.
- **L-017/L-018/L-028**: i18n audit rəqəmi ≠ avtomatik tərcümə; orphan + missing + nested leaf ayrıca yoxla.

## 5) İŞ AXINI
- Plan əvvəl, kod sonra. Hər PR-da diff oxunur. Atomic commit: `[TASK-XXXX] type(scope): mesaj`.
- DoD (Stop hook 5/8 avtomatik): build 0 error, lint 0 yeni, verify:staged, smoke, route 200/307, API 401 gating, hardcoded 0, DEVLOG+CHANGELOG.
- Builder TASK bitirəndə: `Use the dk-validator subagent` / `npm run dk:validate`.
- Vizual dəyişiklik: əvvəl branch-da qur → Doğan lokalda baxır (`git pull` + `npm run dev`) → sonra merge. Görünməyən dəyişiklik = dəyişiklik deyil.

## 6) HARADA NƏ VAR
- Acı dərslər: `docs/LESSONS.md` · State: `docs/STATE.md` · Qərarlar: `docs/DECISIONS.md` · Handoff: `docs/HANDOFF.md`
- Listing SST: `lib/listingFieldConfig.ts` · Marketing tools: `lib/marketing-tools-config.ts` · Member access: `lib/member-access.ts`
- Skill matrisi: `docs/SKILL-MATRIX.md` · Agent: `.claude/agents/` · Skills: `.claude/skills/`

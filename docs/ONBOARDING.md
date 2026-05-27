# DK Agency Onboarding — 5 Dəqiqəlik Başlangıc

Bu sənəd səni 0-dan ilk commit-ə qədər götürür.

## 1. Repo Clone (1 dəqiqə)

```bash
git clone git@github.com:DTOMRIS/dk-agency-platform.git
cd dk-agency-platform
```

## 2. Environment Setup (2 dəqiqə)

```bash
cp .env.example .env.local
# .env.local-ı redaktə et — Doğan-dan dəyərlər al
npm install
```

Lazımlı env-lər (Doğan-dan istə):
- `DATABASE_URL` (Neon PostgreSQL)
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_YANDEX_METRICA_ID` (production only)
- `DEEPSEEK_API_KEY`
- `CLOUDINARY_*` (3 key)
- `SMTP_*` (Hostinger mail)

Tam siyahı: [docs/ENV-SETUP.md](ENV-SETUP.md)

## 3. Database Setup (1 dəqiqə)

```bash
npx drizzle-kit migrate
```

Schema: `lib/db/schema.ts` (30 table, Drizzle ORM)

## 4. Dev Server (30 saniyə)

```bash
npm run dev
```

http://localhost:3000 aç. `/az` ana səhifəyə yönləndirməli.

## 5. İlk PR-a Qədər

**Mütləq oxu (üç sənəd):**
- `CLAUDE.md` (root) — AI agent qaydaları
- `CLAUDE-DESIGN.md` — komponent pattern, rənglər, font-lar
- `docs/LESSONS.md` — L-001..L-028 keçmiş səhvlər

**PR axışı:**
1. Branch yarat: `git checkout -b TASK-XXXX-qisa-tesvir`
2. İş gör
3. `npm run lint && npm run build` keçməli
4. Commit format: `[TASK-XXXX] type(scope): mesaj`
5. Push, PR aç, validator gözlə
6. Doğan merge edir

**Code review prinsipləri:**
- L-004: i18n hardcoded yox, `messages/*.json` + `useTranslations()`
- L-008: 1 faylda çoxlu `Record<Locale>` yox
- L-023: Fakt / şərh / hipotez ayrımı
- Tam siyahı: [docs/LESSONS.md](LESSONS.md)

## 6. Sıxlıq Halında

| Sənəd | Nə tapa bilərsən |
|---|---|
| [CHANGELOG.md](CHANGELOG.md) | Bütün dəyişikliklər tarixlə |
| [DEVLOG.md](DEVLOG.md) | Texniki qərarlar |
| [HANDOFF.md](HANDOFF.md) | Son sessiyanın konteksti |
| [STATE.md](STATE.md) | Auto-generated mövcud vəziyyət |
| [LESSONS.md](LESSONS.md) | Bug debug edirsən, əvvəlcə oxu |
| `docs/tasks/` | 152+ task card (sənin task-ın bənzəyəni axtar) |

## 7. Production-a Necə Gedər?

Hostinger native auto-deploy:
- `main` branch-ə push → avtomatik build və deploy
- Migration manuel: `npx drizzle-kit migrate`
- Detallı: [docs/DEPLOYMENT.md](DEPLOYMENT.md)

---

Xoş gəldin paşam. Suallar varsa Doğan-a yaz: dotomris@gmail.com

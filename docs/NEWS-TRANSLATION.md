# Xəbər Tərcümə Sistemi

RSS feedlərdən gələn xəbərlər (EN/TR) Azərbaycan dilinə avtomatik tərcümə olunur.

## API Açarları

Tərcümə üçün **birini** təyin edin:

| Açar | Xidmət | Qiymət |
|------|--------|--------|
| `DEEPSEEK_API_KEY` | Deep Seek | Ucuz, sürətli |
| `GEMINI_API_KEY` | Google Gemini | Pulsuz tier mövcuddur |

### GitHub Actions (günlük fetch)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** əlavə edin:
   - Name: `DEEPSEEK_API_KEY` və ya `GEMINI_API_KEY`
   - Value: API açarı

Workflow hər gün 08:00 UTC-də işləyir və tərcümə edilmiş xəbərləri `pendingNews.json`-a yazır.

### Lokal test

```bash
# Tərcümə ilə (API açarı lazımdır)
DEEPSEEK_API_KEY=sk-xxx npm run fetch:news

# və ya
GEMINI_API_KEY=xxx npm run fetch:news

# Tərcümə olmadan (yalnız çək)
npm run fetch:news -- --no-translate
```

## Axın

1. **fetch:news** → RSS çəkir, tərcümə edir → `lib/data/pendingNews.json`
2. **Admin** → `/dashboard/haberler` → "RSS Növbəsi" tab → Təsdiq et / Rədd et
3. **Təsdiq** → xəbər `curatedNews.json`-a keçir → /haberler səhifəsində görünür

## Skriptlər

- `npm run fetch:news` — RSS çək, tərcümə et, pending-ə yaz
- `npm run approve:news <id>` — Lokal təsdiq (API işləmirsə)
- `npm run approve:news -- --all` — Hamısını təsdiq et

## Vercel haqqında

Approve/Reject API `fs` ilə fayl yazır. Vercel serverless-də fayl sistemi read-only-dir. Ona görə:

- **Vercel deploy**: Admin panelində təsdiq düyməsi işləməyə bilər. Həll: `npm run approve:news` lokal işlədin, `git add` + `git commit` + `git push`.
- **Self-hosted / Railway / Render**: API normal işləyir.

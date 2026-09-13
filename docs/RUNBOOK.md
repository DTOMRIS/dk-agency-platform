# RUNBOOK

## 1) Giriş/Qeydiyyat kaybolduysa
1. `git status --short` ile beklenmeyen değişiklikleri gör.
2. `rg -n "/auth/login|/auth/register" app components` ile route/linkleri doğrula.
3. `npm run verify && npm run build`.
4. Son sağlam commit'e dönmek için:
   - `git log --oneline`
   - `git revert <sha>`

## 2) Header/Footer standardı bozulduysa
1. Kontrol dosyaları:
   - `components/layout/Header.tsx`
   - `components/layout/Footer.tsx`
   - `app/layout.tsx`
2. Protected verify çalıştır:
   - `npm run verify:protected -- --staged`

## 3) Route drift şüphesi
1. `npm run audit:drift`
2. `docs/DRIFT-REPORT.md` raporunu incele.

## 4) Lock/Dev server sorunu
1. `taskkill /F /IM node.exe` (gerekirse)
2. `.next/dev/lock` sil
3. `npm --prefix <repo> run dev -- --port 3000`

## 5) Restore/rollback kısa komutlar
- Son commit geri al: `git revert <sha>`
- Unstaged temizlemeden önce: `git stash -u`
- Belirli dosyayı eski haline al (dikkatli): `git restore --source=<sha> <file>`

## 6) «column does not exist» — miqrasiya tətbiq olunmayıb

**Simptom:** dashboard səhifəsi «Xəta baş verdi» verir, loglarda
`column "X" does not exist`. Ən çox yeni sütun əlavə edildikdən sonra.

**Səbəb:** `drizzle/` qovluğunda əl ilə yazılmış miqrasiyalar var və
onlar avtomatik tətbiq olunmur (TASK-0440-a qədər ümumiyyətlə heç bir
mexanizm yox idi).

**Addımlar:**

```bash
# 1. ƏVVƏLCƏ oxu — heç nə yazmır
npm run db:migrate:status

# 2. Gözləyən varsa tətbiq et
npm run db:migrate

# 3. Node prosesini restart et (Hostinger panel)
```

`db:migrate` təkrar işlədilə bilər — bütün əl ilə yazılmış miqrasiyalar
idempotentdir (`IF NOT EXISTS`, `DO $$ … EXCEPTION`), artıq mövcud olan
obyektlər atlanır.

**DİQQƏT — `db:migrate:bootstrap` canlıda işlətmə.** O, `drizzle-kit migrate`
ilə başlayır; drizzle-in generasiya etdiyi 0000–0008 miqrasiyaları idempotent
DEYİL və `__drizzle_migrations` cədvəli boş olarsa təkrar tətbiq olunmağa
çalışıb sınacaq. `bootstrap` yalnız SIFIRDAN yeni baza qurarkən işlədilir.

**Yeni sütun əlavə edəndə sıra:** `lib/db/schema.ts` → `drizzle/00XX_ad.sql`
(idempotent yaz) → PR → merge → deploy → `npm run db:migrate` → restart.

---

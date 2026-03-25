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

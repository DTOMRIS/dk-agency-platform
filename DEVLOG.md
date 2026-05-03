# DEVLOG — DK Agency Platform

Sessiya qeydləri. Hər iş sessiyasının nəticəsi burada.

---

## 2026-05-03 — Auth Frontend Fix (TASK-0022)

**Problem:** Login/register formları köhnə `/api/member/auth` endpoint-inə gedirdi (400 error), locale auth route-ları 404 qaytarırdı, password input-larda autocomplete yox idi.

**Həll:**
1. Login form: `/api/member/auth` → `/api/auth/login` (JWT response ilə MemberSession yaradılır)
2. Register form: `/api/member/auth` → `/api/auth/register` (verificationRequired flow)
3. Locale wrappers: `app/[locale]/auth/login/page.tsx` + `register/page.tsx` yaradıldı
4. Autocomplete: `current-password` (login), `new-password` (register + reset)

**Commits:**
- `ae740ae` — fix(auth): update login/register form endpoints
- `6ea8320` — feat(auth): add locale route wrappers for login/register
- `82972a7` — fix(auth): add autocomplete attributes to password inputs

**Build:** PASS (26.6s)
**Protected violations:** 0
**Encoding issues:** 0

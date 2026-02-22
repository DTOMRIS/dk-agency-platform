# Delivery System (No-Regression Mode)

Bu belge, "duzelttik sonra geri bozuldu" sorununu bitirmek icin operasyon kurallarini belirler.

## 1. Branch ve PR Modeli

- Branch ad format: `type/scope-short-desc`
- Ornek: `feat/home-v4-header`, `fix/auth-role-redirect`
- `main`e dogrudan push yok.
- Her degisiklik PR ile merge edilir.

## 2. Definition of Ready (DoR)

Bir task baslamadan once:

- Problem tek cumlede yazildi.
- Kapsam net (in/out).
- Kabul kriteri yazili.
- Etkilenen route/listeler belli.

## 3. Definition of Done (DoD)

Task tamam sayilmasi icin:

- `npm run lint` temiz (en azindan error yok).
- `npm run build` basarili.
- Mobil + desktop manuel smoke yapildi.
- Metin/encoding kontrolu yapildi (mojibake yok).
- CTO daily report girildi.

## 4. Sayfa Duzeltme Sonrasi Geri Donusu Engelleme

- Her bug fix'e bir "regression checklist" satiri eklenir.
- Ayni bug ikinci kez cikarsa "Root Cause Note" zorunlu olur.
- Tekrar eden buglar "Top 10 tekrar eden hata" listesine girer.

## 5. Weekly Ritm

- Pazartesi: Plan + IA freeze
- Sali-Carsamba: Feature implementation
- Persembe: QA + bug burn
- Cuma: Stabilizasyon + release

## 6. Sahiplik Matrisi

- Product/IA: CTO
- UI consistency: Frontend owner
- Auth/Access: Backend owner
- QA gates: QA owner
- Deploy/rollback: DevOps owner

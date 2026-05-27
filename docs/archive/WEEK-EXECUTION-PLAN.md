# DK Agency Week Execution Plan (Fast Track)

Amac: Bu hafta temeli kilitlemek ve tekrar eden kalite sorunlarini bitirmek.

## Gun 1 - Foundation Freeze

- Header/Footer tek kaynakli hale getirme (duplicate header kaldir).
- V4 IA adlandirmalari netlestir: `Basla`, `Hizlandir`, `Buyut`, `Ilanlar`, `Xeberler`, `Qiymet`.
- Auth role modeli dokumante et (Uzv/Sahib).

## Gun 2 - Quality Debt Burn

- Lint error = 0 hedefi.
- `react-hooks/set-state-in-effect` ihlallerini temizle.
- `react/no-unescaped-entities` hatalarini temizle.
- Mojibake metinleri normalize et.

## Gun 3 - Home + Header/Footer Standard

- Home'u global layout ile uyumlu hale getir.
- Nav ve CTA'leri tek standartta birlestir.
- Footer linklerini V4 bilgi mimarisine guncelle.

## Gun 4 - Auth + Cookies

- Login/Register akisini role tabanli yap.
- Test-user/localStorage mock'larini azalt.
- Cookies consent davranisini route genelinde tutarli hale getir.

## Gun 5 - Stabilization + Release Readiness

- Lint/build son gecis.
- Manuel smoke test.
- CTO final haftalik rapor.
- Vercel deployment kontrol.

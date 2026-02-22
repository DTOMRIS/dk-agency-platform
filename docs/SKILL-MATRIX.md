# DK Agency Skill Matrix (v1)

Bu dosya, projede her is tipinde hangi "skill"in kullanilacagini sabitler.
Amac: Ayni hatalarin tekrarini azaltmak ve is akislarini standardize etmek.

## Zorunlu Skill Set (10 adet)

1. `platform-architecture-guardian`
- Kapsam: Route yapisi, bilgi mimarisi, naming standardi, modul sinirlari.
- Cikti: IA karari, route map, teknik karar notu (ADR).

2. `nextjs-app-router-owner`
- Kapsam: App Router, layout sinirlari, server/client component ayrimi.
- Cikti: Tutarli route ve layout uygulamasi.

3. `design-system-enforcer`
- Kapsam: Header/Footer standardi, renk tokenlari, tipografi ve spacing.
- Cikti: Tekil tasarim dili, duplicate UI bloklarinin kaldirilmasi.

4. `newsroom-rss-pipeline`
- Kapsam: Xeberler taxonomy, RSS endpointleri, yayin akisi.
- Cikti: `/xeberler` + `/api/rss/*` + editorial publish checklist.

5. `marketplace-listings-ops`
- Kapsam: `Ilanlar` (Ekipman, Devir, Tedarikci, Reklam) domain modeli.
- Cikti: Listeleme semasi, filtre/arama standardi, moderasyon akisi.

6. `auth-role-access-control`
- Kapsam: Uzv/Sahib auth, role-based redirect, korumali sayfalar.
- Cikti: Auth sozlesmesi, route guard matrisi.

7. `content-localization-qa`
- Kapsam: AZ/TR metin kalitesi, encoding/mojibake kontrolu, SEO metalar.
- Cikti: Copy style guide + yayin oncesi metin QA.

8. `qa-regression-firewall`
- Kapsam: Lint/build gate, smoke checklist, tekrar eden bug kok neden analizi.
- Cikti: CI kapilari + release readiness raporu.

9. `analytics-monetization-ops`
- Kapsam: KPI eventleri, gelir modeli ekranlari, newsletter/reklam olcumleme.
- Cikti: Event tracking plani, temel dashboard metrikleri.

10. `release-devops-owner`
- Kapsam: Branch stratejisi, PR sablonu, release notu, Vercel deploy disiplini.
- Cikti: Haftalik release ritmi ve rollback plani.

## Ise Gore Skill Eslemesi

- `Header/Footer/ana sayfa`: `design-system-enforcer` + `nextjs-app-router-owner`
- `Xeberler`: `newsroom-rss-pipeline` + `content-localization-qa`
- `Ilanlar`: `marketplace-listings-ops` + `auth-role-access-control`
- `BASLA modullari`: `platform-architecture-guardian` + `content-localization-qa`
- `Prod cikis`: `qa-regression-firewall` + `release-devops-owner`

## Operasyon Kurali

- Her task acilirken en fazla 2 ana skill secilir.
- PR acilmadan once "hangi skill(ler) uygulandi" notu zorunludur.
- Skill disi is yapildiysa kisa gerekce yazilir.

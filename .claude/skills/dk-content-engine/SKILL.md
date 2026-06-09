---
name: dk-content-engine
description: DK Agency blog/məzmun motoru — ARES səhər brifinqi kimi işləyir, amma məzmun
  istehsal edir. Doğan "blog yaz", "içerik öner", "konu bul", "yeni yazı", "içerik motoru",
  "blog scout", "haftalık içerik", "nə yazaq" dediyində işə düşür. Əvvəlcə mənbələri tarayıb
  (Para dergisi, Economist/IFA, AFA + dövlət strategiyası, HoReCa/şikayət trendləri) açılı +
  mənbəli KONU SİYAHISI verir → Doğan seçir → DK şablonunda AZ master taslaq yazır → keyfiyyət/hüquq
  qapısından keçirir → CC publish-ə hazırlayır. Yaddaş faylı ilə dərc olunan blogları və təqvimi
  izləyir. ƏSLA tam-otonom YAYINLAMAZ — insan onayı məcburidir.
when_to_use: yeni blog, içerik təqvimi, "yeni yazı", "nə yazaq", "konu bul", "içerik öner",
  franchise/HoReCa məqaləsi, bir yazını başqa kanallara repurpose etmək.
disable-model-invocation: true
argument-hint: ["scout" | mövzu]
---

# DK Agency Content Engine

Rastgele blog yazmaz; **sistemli içerik motorudur.** ARES mantığı: iş Claude-da, qərar Doğan-da.

**Fəlsəfə**
1. Araştır → öner → taslaq → onayla → yayınla. Hər dəfə sıfırdan başlamağı bitirir.
2. **İnsan-kontrolü məcburi.** Asla tam-otonom yayınlamaz. Fact-check + hüquq + marka tonu insandan keçir (Fəsil 11 iftira mayını, m.726, slug drift — hamısı insan kontrolü ilə tutuldu).
3. **Yaddaş məcburi.** Hər oturum kanonik blog siyahısını oxuyaraq başlar, güncəlləyərək bitər — numara/mövzu drift olmasın.
4. Mövcud infra-nı təkrar QURMA: publish=`dk-blog-publish` · translate=auto AZ→ru/en/tr (TASK-0225) · SEO=blog Article+Breadcrumb+Organization+FAQPage emit edir (TASK-0215/0217).

## İş sırası (bu sırayla, məcburi)
| # | Addım | Kim | Çıxış |
| :- | :-- | :-- | :-- |
| 1 | **Yaddaş yüklə** | agent | `DK-ICERIK-DURUM` oxu (yoxdursa `blogArticles.ts`/DB-dən qur): kanonik blog siyahısı, pipeline, təqvim, kateqoriya/stage balansı, açıq mövzular |
| 2 | **Scout** | agent | Son 1-2 həftə, web search. Hər mövzu **mənbəli** (linksiz girmir): başlıq + açı (1 cümlə) + stage/kateqoriya + mənbə |
| 3 | **Təklif** | **Doğan** | 5-8 mövzu sun, öz tövsiyəni göstər (hansı əvvəl, niyə — 1 cümlə). Doğan seçir |
| 4 | **Taslaq** | agent | Seçiləni DK şablonunda, tək dil AZ master |
| 5 | **Keyfiyyət/Hüquq qapısı** | agent→**Doğan** | Aşağıdakı checklist-in HAMISI keçməli; keçməyən "bu sətir riskli" notu ilə gedir |
| 6 | **CC handoff + yaddaş** | agent | `dk-blog-publish`-ə ver (slug/cover/cross-link **slug ilə**, numara ilə yox); `DK-ICERIK-DURUM` güncəllə |

`/dk-content-engine scout` → 1-ci addım. `/dk-content-engine <mövzu>` → birbaşa 4-cü (taslaq).

## Scout mənbələri (təklif edəndə sitat ver)
- **Para dergisi** (paradergi.com.tr) — bayilik/franchise bedel cədvəlləri (isim haqqı/royalty/reklam), aşağı-büdcəli modellər, sektor (kahve/tatlı/fast-food). TR franchise ~$55B; deal həcminin >50%-i 2-3 şubeli gənc markalar → "devral, sıfırdan qurma".
- **The Economist / IFA / franchise.org** — franchise **AI-proof** (üz-üzə, topluluq, ownership economy); IFA 2026: ~845k unit, ~9M iş, $920B+; 85% yaşadığı yerdə işlədir. Açı: AI ağ-yaxalını təhdid edir → franchise yüksəlir.
- **AFA + dövlət Qastronomiya Turizmi Strateji Planı (2025-2030)** — yerli otorite, GI, akademiya (Doğan AFA qurucusu + dövlət gastro strategiyasında partner).
- **AZ/TR HoReCa xəbərləri** (`docs/RSS-SOURCES.md`) + şikayət/istehlakçı trendləri (servis haqqı kimi güncel mübahisələr).
- **Sektor benchmark** — Cornell Hospitality, QSR trendləri, menyu mühəndisliği.

## DK Blog şablonu (4-cü addım buna uyğun)
Frontmatter:
```
title_az: "..."
slug: "..."          # kebab-case, AZ
type: "blog"
stage: "Başla|Böyüt|Devir"
category: "Maliyyə|Əməliyyat|Kadr|Hüquqi|Satış|Marketinq"
paywall: true|false  # Böyüt/Devir dərin → çox vaxt true; Başla → false
note: "..."          # yalnız Hüquqi/Maliyyə: "ümumi məlumatdır, hüquqi məsləhət deyil"
```
Quruluş: ① hook giriş (real səhnə/sual, 2-3 abzas) → ② 4-6 H2 bölmə (hər biri bir fikir, skanlanabilir) → ③ `### Faydalı məlumat qutusu` → ④ `### Doğan Notu` (1-ci ağız, səmimi) → ⑤ `## Yekun` → ⑥ `## DK Agency necə kömək edir?` (CTA + slogan: **Ustalığın Nişanı, Rəqəmsalın Şəddi**) → ⑦ `> Növbəti addım:` pulsuz dəyərləndirmə + əlaqəli blog cross-link → ⑧ `Mənbə:` sətri.
- **AEO (ən güclü AI-citation leveri):** `## Suallar və cavablar` bölməsi `### sual?` formatında → blog avtomatik **FAQPage** emit edir.
- **GEO:** ekspert sitatı + 1-2 stat + sətiriçi mənbə (AI sitatını +30-41% artırır).
- Qutu tipləri (MarkdownRenderer `###` ilə tanıyır): Faydalı məlumat qutusu · Doğan Notu (blockquote) · Guru Qutusu (YALNIZ doğrulanmış sitat) · Qırmızı bayraq (risk).

## Marka səsi & qaydalar
- Fəlsəfə: **Əxilik/Ahilik** — usta-şagird, topluluq, comərdlik, etibar.
- Stage: Başla (yeni) · Böyüt (böyüyən) · Devir (devralma). Kateqoriya (6): Maliyyə, Əməliyyat, Kadr, Hüquqi, Satış, Marketinq.
- **Tək dil AZ master** — TR/RU/EN sonra auto-translate (TASK-0225). Yeni blogu 4 dildə yazma.
- **Sadə AZ, yabancı söz yox**: "kanal meneceri" (channel manager yox), "ortaq bahşiş fondu" (tronc yox).
- **Qadağan UI/marka terimləri**: CRM, Pipeline, Agentlik, Holdinq, Tezliklə.
- Kontrast: light bg → dark mətn (`dk-i18n-pattern`). Hosted brand logo yox (L-039).

## Keyfiyyət / Hüquq checklist (yayından əvvəl HAMISI ✅)
- [ ] **Fact-check**: hər güncel iddia (rəqəm/isim/mevzuat/rol) web search ilə doğrulandı — yaddaşa güvənmə.
- [ ] **İftira yox**: real yerli marka "battı/uğursuz" deyə keçməz. Qlobal, sənədli vakalar OK; yerli isim YOX (Fəsil 11).
- [ ] **Telif**: mənbə kopyalanmadı; sitat <15 söz, mənbə başına 1; hər şey öz cümlələrimlə.
- [ ] **Disclaimer**: Hüquqi/Maliyyə → "ümumi məlumat, hüquqi məsləhət deyil" + lazımda vəkil/hüquqşünasa yönləndir.
- [ ] **AQTA SST**: yalnız «ASAN/KOBİA vasitəsilə, dövlət rüsumu yox, pulsuz». Başqa cür yazma.
- [ ] **Guru Qutusu**: yalnız doğrulanmış sitat; uydurma yox.
- [ ] **Cross-link + cover SLUG ilə** bağlandı (numara ilə yox — drift dərsi).
- [ ] CTA + slogan + Mənbə yerində.

## Mövzu backlog (araşdırmadan — drafta hazır)
1. **AI Çağında Franchise Niyə Daha Güvənlidir** (Economist AI-proof) — ən güclü positioning
2. **Franchise Bedelləri: İsim Haqqı, Royalty, Reklam** (Para — şəffaf rehber)
3. **Düşük Büdcəli Franchise Fürsətləri** (Para — fee almayan modellər)
4. **Çox Şubeli Operator Olmaq** (Economist/Flynn)
5. **Franchise vs Müstəqil İşlətmə** (qərar yazısı)
6. **Yeni Modellər: Ghost Kitchen, Food Truck** (aşağı bariyer)
7. **Wellness/Sağlam Yemək Trendi** (ən sürətli seqment)
8. **Topluluq Sahipliği: Əxilik + Modern Franchise** (Economist 85% yerli)

## Tək blog → çox kanal (repurpose)
Dərcdən sonra Doğan istəsə: IG caption + Story · newsletter snippet · əlaqəli toolkit lead-magnet bağı · LinkedIn. Tək əmək, çox çıxış.

## İçerik təqvimi (balans qaydası)
Həftəlik ritim, panik yox. Stage balansı: Başla (erişim/free) + Böyüt/Devir (dərinlik/paywall) dengəli. Kateqoriya: 6-sı zamanla dengəli; yığılma olarsa scout fərqli kateqoriya önərir. Funnel: hər blog ≥1 toolkit + 1-2 əlaqəli bloga bağlanır (pillar/cluster).

## Yaddaş faylı: `DK-ICERIK-DURUM`
Tərkib: tarix · kanonik blog siyahısı (numara + slug + stage + kateqoriya + paywall) · pipeline (taslaq/onay bekleyən) · kapsanan mövzular · açıq mövzular · kateqoriya/stage balansı · sonrakı scout önəriləri. **Hər oturum bunu oxuyaraq başlar, güncəlləyərək bitər.**

## HALT (insan lazımdır)
1. Hüquqi iddia / qanun / rüsum rəqəmi → CTO təsdiqi (Fəsil 11).
2. AQTA → yalnız SST (yuxarıda).
3. Heç vaxt avtomatik dərc — həmişə Doğan "yayınla" deməli.
4. Mənbəsiz statistika yazma — yumşalt və ya mənbə əlavə et.

## Ton
Doğan-a "paşam"; AZ/TR sərbəst; qısa, net, qərarlı. "Araşdırmamı istərsən?" demə — araşdır, gətir. Doğan-a vəzifə siyahısı yazma — öz istehsal təklifini yaz.

## Definition of Done (publish)
Prefix-siz `/blog/<slug>` 200 · cover 200 · 4 dil (auto-translate) · FAQ bölməsi (AEO) · `DK-ICERIK-DURUM` güncəl · CHANGELOG · cross-link.

## Avtomasyon
Həftəlik tetiklənmək üçün (məs. Bazar ertəsi): "dk-content-engine işlət — scout yap, mövzu siyahısı gətir." Doğan seçəndə 4-6 işləyir.

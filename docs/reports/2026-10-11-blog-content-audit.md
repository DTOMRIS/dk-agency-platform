# Bloq məzmun auditi — 37 yazı (2026-10-11, TASK-0545)

Doğan: «eski yazılar paşam bakarsın» (restoran-acarken-sehvler: «12 ildir», uydurma sitatlar, olmayan alətlər).

## Nə tapıldı
- **Sitatlar (42 qutu + 12 mətn içində):** 5 doğru, 7 fikir müəllifin amma cümlə uydurma, **30 uydurma** (Roger Fields, Donald Burns, David Scott Peters, Jim Sullivan, Jon Taffer — hamısı; Danny Meyer 6-dan 4-ü; «Bar Rescue», «Kitchen Nightmares» kitab deyil; 1997 kitabında «35 000 Starbucks»; «restoranların 90%-i batır» mif — Ohio State: 1-ci ildə ~26%, 3 ildə ~60%). Fuad Nağıyev və Günay Sağlam həqiqi şəxslərdir, amma onlara yazılan rəqəmlər (30%, 248 meyar) tapılmadı. Deming-ə yazılan söz onun deyil (isimsiz «məşhur söz» kimi qalır). Mətn içindəki 6 «Sahə qeydi» Doğan-ın öz sözləridir — toxunulmadı.
- **Məzmun (210 tapıntı):** mənbəsiz rəqəm 79, artefakt 50, olmayan alət/xidmət 30, səhv link 23, il 11, digər 17.
  - Olmayan: «Qiymət Strategiyası Hesablayıcı», rəqib radius xəritəsi, «47 maddəlik AQTA + sənəd şablonları» (həqiqi: 30 maddə, 8 bölmə), «12 aylıq P&L simulyatoru», Toolkit-də işə qəbul / onboarding / çıxış şablonları, devir «sağlamlıq skoru», otel testi «PDF» (PNG-dir), «248 meyar».
  - Səhv linklər: `/aletler`, `/aletler/marketinq-ocagi` (9 yazı), `/danismanlik`, `/franchise/meslehet`, köhnə bloq slug-ları (7).
  - AQTA cərimələri maddə-maddə uydurma (İXM 220.1: hüquqi şəxs 2000–2500 ₼); iki AQTA yazısı bir-birinə zidd.
  - Hesab xətaları: food cost trim nümunəsi, başabaş, «6 ₼ + 30% = 20» (÷ olmalı).
  - «12 ildir» → 40 il; 122 «franchise» → «françayz»; 16 yazıda «Kateqoriya | Oxu müddəti» sətri.

## Nə edilir
- `docs/ops/2026-10-11-blog-content-audit.sql` — 37 yazı (md5 qoruması ilə), 30 sitat silinir (tam mətn: `docs/ops/2026-10-11-guru-boxes-deleted.json`), 9 sitat həqiqi cümlənin tərcüməsi ilə (en = orijinal).
- `docs/ops/2026-10-11-blog-anecdotes-OPTIONAL.sql` — 24 maddə yalnız Doğan bilir: anekdotlar (müştəri rəqəmləri, «Bakı reallığı» nümunələri) və DK iddiaları (AFA qurucusu, AzQuality, OCAQ funksiyaları, gigiyena auditi, kitabça yazma xidməti, CTH proqramları). Doğrudursa həmin UPDATE silinir.
- Bütün tapıntılar: `docs/reports/2026-10-11-blog-content-audit-findings.json`.

## Açıq
- **Tərcümələr:** en/ru/tr mətnləri audit edilmədi — AZ düzəldikdən sonra yenidən tərcümə lazımdır (köhnə uydurmalar orada qalır).
- **Hüquqçu:** Mülki Məcəllə m.726 / m.723–731 və «kommersiya konsessiyası m.800–807» (Rusiya Mülki Məcəlləsindən götürülmüş görünür) — `mulki-mecelle-726-franchise-devri` yazısının başlığı və slug-ı.
- «Qastronomiya Turizmi Strateji İnkişaf Planı (2025–2030)» adlı rəsmi sənəd tapılmadı (rəsmi: Turizm Dövlət Proqramı 2026–2030).
- Türkcə kalkalar mətnlərdə qalır (sıcaqlıq kayıtı, bilinçli, geçici kapatma…) — ayrıca dil redaktəsi.
- 2 yazıda markdown başlıqları itib (franchise-bedelleri, haccp); 31 yazıda başlıq H1 kimi təkrarlanır (səhifə ilkini gizlədir).

# Marketinq Ocağı (24 alət) — audit + dünya araşdırması (09.10.2026)

Mənbə: iki Haiku agent (kod oxuma + veb araşdırma). Əllə təsdiqlənən: marka-kompasi promptu «B2B SaaS / April Dunford» (route.ts:39); ROI gəlir üzrə, marjasız (ROICalculatorV2.tsx:137); 7 AI action aylıq limiti DB-yə yazmır (menu-analytics-ai.ts — marketingToolRuns yoxdur); şikayət cavabında kupon/geri ödəmə məcburidir (complaint-prompt-builder.ts:36,49,62).

## Prioritet 1 — düzgünlük / pul
1. 7 AI action limit yazmır (menu-analytics, persona, complaint-analysis, roi, pl, trend, lokasyon) → ortaq logRun().
2. ROI/ROAS gəlir əsasında → gəlir × marja; başabaş ROAS = 1/marja.
3. P&L breakeven əməyi dəyişən sayır (PLSimulator.tsx:153); ssenari satış artımı COGS-u miqyaslamır (:175).
4. Yemək xərci trim (1+t) → /(1−t) (lib/toolkit/food-cost.ts istifadə et).
5. Marka kompası promptu restoran/Bakı konseptinə yazılmalı; provider config ilə sinxron.
6. KST skoru və şikayət sayları LLM-də → kodda hesabla; «26 səssiz müştəri» mənbəsiz qayda silinsin.
7. Şikayət cavabı: kompensasiya vəd etmir, yalnız sahib seçəndə (Doğan qərarı lazım).
8. AZ promptlar diakritikasız / trend+lokasyon ingiliscə → düzgün AZ çıxış.
9. Menyu analitik eşikləri K&S (70%×1/N, çəkili CM); sezon əmsalları orta=1, «cash-flow» adı səhv; 2026 Ramazan hardcoded.
10. AI JSON formatı (json_object) və 55+55s timeout riski.

## Birləşdirmə
- pl-simulyatoru = /toolkit/pnl (eyni komponent) → tək P&L motoru (viability), AI təhlili USTA.
- yemek-xerci → /toolkit/food-cost; roi-kalkulator + reklam-roi + promosyon-roi (yetim) → bir marja əsaslı ROI; sezon-analitikasi + sezon-planlama → «Sezon»; şikayət 3 versiya → bir səhifə; kst + restoran-audit → bir audit; planned lokasyon-secme/trend-analitigi silinsin; personel/metbex config-dən çıxsın.
- Planned 4 alətin vədləri (audit-robotu «5 foto 30 san», sosial-medya-plan, trend-analitigi, lokasyon-secme) kodda yoxdur → gizlət və ya «Tezliklə».

## Dünya araşdırması — yol xəritəsi (dəyər/zəhmət)
1. Menyu matrisində hər yeməyin aylıq ₼ təsiri (orta) 2. Qiymət «əgər» simulyatoru (kiçik-orta) 3. Şikayət cavabı, 1–2★ təsdiqli (kiçik-orta) 4. Başabaş ROAS / sifariş başına ₼ (kiçik) 5. Həftəlik «tək addım» ₼ kartı (orta) 6. Yavaş saat kampaniya qaralaması AZ (orta) 7. Real datadan həftəlik sosial paket (orta) 8. Audit tapıntısı → məsul/son tarix/foto/bağlama (orta) 9. Keçən ilin eyni həftəsi + bayram bayrağı (kiçik-orta) 10. Saatlıq personel ehtiyacı (böyük).
Etmə: onaysız avtomatik rəy cavabı; vendor «+8% satış» vədləri; öz POS / ticari mövqe datası.
Ən kritik boşluq: Wolt / Bolt Food / Yango merchant panel datası — birbaşa görüşmək lazımdır.
Nümunələr: Toast IQ Grow, Restaurant365 menu engineering, MarginEdge plate-cost alerts, Popmenu, Owner.com, SafetyCulture/Zenput, Lineup.ai, 7shifts, Foodics, Saby.

## OCAQ-dan təkrar istifadə (oxuma, 09.10)
- OCAQ-da «KST» yoxdur: KXT = növbə checklist (tamamlanma faizi), K·X·T·İ = anketin 4 qrupu (Keyfiyyət·Xidmət·Təmizlik·İnsan, src/lib/qonaq/kxt.ts).
- Anket v2: src/data/qonaq-anketi-v2.ts (q1–q11, bal ≤3 → səbəb sualı), skor kodda src/lib/qonaq/hesab-v2.ts (bənd % = Σ/(n×5), NPS, n<10 gizli).
- Anket keyfiyyəti: «hamısı 5 + NPS 10» payı, xəbərdarlıq 80% (biznes qaydası, mənbəsiz), tələsik doldurma 90 san (src/lib/qonaq/anket-rapor.ts).
- Şikayət: 8 kanal, 10 kateqoriya, kök səbəb 9 seçim + tədbir sahibi (kok-sebeb.ts), SLA 1/4/24/48 saat.
- Lisenziya: HACCP siyahısı McDonald's Food Safety Manual əsaslı — DK-ya KÖÇÜRÜLMƏZ; anket sualları Shaurma Excel-indən — öz sözlərimizlə yenidən yazılır; müştəri/filial datası köçürülmür.
- DK üçün: (1) KST yoxlayıcı skoru kodda + 3 ən zəif bənd + AI yalnız 1 addım; (2) anket keyfiyyət yoxlayıcısı (CSV/əl ilə); (3) sadə qonaq anketi generatoru K·X·T·İ + NPS; (4) şikayət triajı (kateqoriya, kök səbəb, SLA, cavab qaralaması — kompensasiya vədsiz); (5) checklist tamamlanma (öz maddələrimiz).
- Açıq: 80% həddini kim təsdiqləyib; OCAQ checklist 44 yoxsa 67 maddə; ₼ dəyəri mənbəyi.

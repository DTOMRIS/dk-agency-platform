# ADR-0016: Dashboard route təmizliyi — saxta səhifələr silinir, real olanlar menyuya, sidebar bölmələnir

## Status
Accepted

## Context
2026-09-13 auditləri (funksiya + dizayn + dünya standartı) göstərdi:
- Dashboard-da **34 top-level route** var idi; sidebar **13**-ünü göstərirdi, 21-i yalnız ünvanla açılırdı.
- 14 səhifə hardcoded massivləri canlı data kimi göstərirdi (`pipeline`, `deal-flow`, `raporlar`, `roller`, `loglar`, `mesajlar`, `etkinlikler`, `b2b-yonetimi`, `trends`, `haberler`, `duyurular`, `toolkit`/`site` — saxta «Saxla», `ilan-onaylari` — yönləndirmə); `settings` boş stub idi.
- 8 real-data səhifə (`franchise-leads`, `faturalar`, `fatura-kateqoriyalar`, `food-cost`, `auditor`, `aqta-checklist`, `profil-onay`, `ayarlar`) menyuda yox idi.
- Dünya standartı araşdırması: «kiçik komanda 34 ekranı yaxşı edə bilməz — səth sahəsi keyfiyyətin düşmənidir». Sahibin əsas şikayəti «acemice» görünüş idi; saxta səhifələr və yarımçıq naviqasiya bunun ana mənbəyi idi.

Seçimlər: (a) saxta səhifələri real backend ilə tamamlamaq — böyük, qeyri-müəyyən iş; (b) «hazırlanır» etiketi ilə saxlamaq — yalan səth qalır; (c) silmək, real olanları menyuya çıxarmaq, lazım olanı sonra real data ilə sıfırdan yazmaq.

## Decision
Sahib qərarı («C sil, B okey»): **(c)**.
- 15 route (+ `[locale]` mirror-ları) silindi; `settings` → `ayarlar`. Yalnız silinən səhifələrin işlətdiyi 10 i18n namespace və `data/trends-mock.ts` təmizləndi; `mockNewsDB` qaldı (açıq sayt işlədir).
- 8 real səhifə menyuya girdi; 20 link düz siyahıda oxunmadığı üçün sidebar **6 bölmə**: Məzmun · Satış və Leadlər · Maliyyə · Keyfiyyət · Üzvlər · Sistem (Pattern A, 4 dil).
- Silmədən əvvəl bütün istinadlar tarandı (sıfır); silinən route-lar üçün `e2e/dashboard-smoke.spec.ts`-də 404 reqressiya qoruyucusu var.
- Eyni sessiyada bağlı qərar: **brend qırmızısı `#E94560` (`--dk-red`) olduğu kimi qalır**; `CLAUDE.md`-dəki `#E11D48` reallığa uyğunlaşdırıldı.

## Consequences
**Positive:**
- 34 → 19 route; hər iş (dizayn primitivləri, page header, i18n) 19 ekrana tətbiq olunur, 34-ə yox.
- Saxta «Saxlanıldı ✓» / saxta rəqəm səthləri yoxdur (CLAUDE.md: mock ilə «tamam» demə).
- Naviqasiya tam: menyuda görünməyən işlək səhifə qalmadı.

**Negative:**
- Gələcəkdə pipeline/hesabat kimi funksiyalar lazım olsa, sıfırdan (real data ilə) yazılmalıdır — köhnə UI geri gətirilmir.
- `hero`-nun saxta «Saxla»sı hələ qalır (TD-005, sahib qərarı gözlənilir); `ilanlar` səssiz mock fallback-i (TD-006).

## References
- Related ADRs: ADR-0013 (dk-validator), ADR-0014 (task card system)
- Related TASKs: TASK-0443, TASK-0444, TASK-0445
- docs/DEVLOG.md 2026-09-13; docs/TECH_DEBT.md TD-005…TD-009; docs/LESSONS.md L-045, L-048

## Date
2026-09-13

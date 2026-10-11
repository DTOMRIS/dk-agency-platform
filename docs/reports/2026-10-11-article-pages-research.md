# Blog və xəbər səhifələri — dizayn araşdırması (2026-10-11, TASK-0542)

Doğan: «araştır paşam, yaratıcı, bizi ileri taşıyacak sayfa düzenlemesi olsun». 10 referans səhifə 1280 və 390 px-də ekran şəkli ilə baxıldı (Axios və Morning Brew 403 qaytardı).

## Referanslar və götürdüyümüz fikir
| Nümunə | URL | Fikir | DK-da |
|---|---|---|---|
| NerdWallet | https://www.nerdwallet.com/mortgages/how-much-house-can-i-afford | Yazının özü kalkulyatordur; nəticə rəngli zolaq + bir cümləlik hökm | Bloqda **mini kalkulyator** (food cost, başabaş, çatdırılma, P&L) — hədlər `benchmarks.ts`-dən |
| Toast | https://pos.toasttab.com/blog/on-the-line/how-to-calculate-food-cost-percentage | «Key takeaways» ilk başlıq, resurs kartı yuxarıda | **Qısaca** — müəllifin öz «Yekun» bölməsindən |
| Owner.com | https://www.owner.com/blog/local-seo-for-restaurants | Yazıya bağlı proaktiv sual | KAZAN `?q=` — yazıdan KAZAN-a keçəndə sual hazır |
| Nory | https://www.nory.ai/blog/average-restaurant-profit-margins-usa | Cədvəldə «bu rəqəm nə qədər möhkəmdir» sütunu; aktiv mündəricat | Redaktor qaydası (aşağıda); cədvəllər v2 |
| Skift | https://skift.com/2026/10/10/the-war-is-changing-the-economics-of-saudi-tourism/ | «Why this matters» paneli | Xəbərdə **«Restoranınız üçün nə deməkdir»** kartı |
| Semafor | https://www.semafor.com/article/10/09/2026/the-ceo-who-put-canary-wharf-back-on-the-map | Fakt və fikir ayrı etiketli | «DK baxışı» — «xəbərin özü deyil, redaksiyanın şərhidir» |
| 7shifts / MarginEdge / R365 | 7shifts.com/blog/restaurant-labor-cost · marginedge.com/blog/… · restaurant365.com/blog/… | Addımlı nümunə, «Pro tip», növbəti addım | **Növbəti addım** mərhələyə görə (Başla → açılış siyahısı, Böyüt → menyu matrisi, Devir → elanlar) |

## Qaydalar (uydurma yox)
- Mini kalkulyator boş açılır (nümunə rəqəm yoxdur), hədlər alətlərlə eyni mənbədən.
- «Qısaca» yalnız müəllifin öz «Yekun / Nəticə / Xülasə» bölməsi varsa (37 yazının 13-ü); AI xülasə yazmır.
- «Ustadan qeyd» yalnız `dogan_note` doludursa (24/37), yazının ortasında.
- Popup, e-poçt qapısı, avtomatik video yoxdur; bir CTA (əvvəl 3 idi).

## Qalan (DB sahəsi lazımdır — miqrasiya Doğan onayı)
- Bloq: `takeaways`, `key_numbers` (mənbə ilə), `related_toolkits` (xəbərdəki kimi).
- Xəbər: orijinal dərc tarixi; yeni xəbərlərdə «Restoranınız üçün» sətri — TASK-0492-də sabit şablon başlıqları qəsdən çıxarılıb, ona görə prompt dəyişmədi (qərar Doğan-ındır).
- Redaktor qaydası: cədvəllərdə «Mənbə / nə qədər dəqiqdir» sütunu (Nory nümunəsi).

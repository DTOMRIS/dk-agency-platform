# Xəbər Sistemi — 360° Audit + Sıralı İcra Planı (TASK-0300)

**Tarix:** 2026-06-11
**Metod:** 10 paralel agent — 4 kod auditi (admin lifecycle, repository+API, public render+flag consumers, RSS+AI pipeline), 5 dünya/bölgə araşdırması (qlobal B2B, AI-news standartları, redaksiya workflow/SEO, Türkiyə, Rusiya/CIS+AZ), 1 müstəqil CTO denetleyici/planlamaçı.
**Status:** PLAN — kod yazılmayıb. Hər task ayrı PR olacaq. CEO təsdiqi gözlənilir.

---

## 1. CEO şikayətləri → təsdiqlənmiş kök səbəblər

| # | Şikayət | Kök səbəb (fayl:sətir) | Status |
|---|---|---|---|
| 1 | Xəbərdə silmə yoxdur | `DELETE /api/news/admin/[id]` var (PR #352), amma admin UI-da düymə HEÇ VAXT qoşulmayıb (`app/dashboard/xeberler/page.tsx:565-594` — yalnız 4 düymə) | TƏSDİQLƏNDİ |
| 2a | "Məzmun (AZ) yazdım, detayda çıxmır" | **POST-only + UNIQUE slug tələsi:** `NewsEditorForm.submitDraft` HƏMİŞƏ POST edir (`NewsEditorForm.tsx:473`), update yolu yoxdur. "Əvvəl saxla, sonra tərcümə et" axınında ikinci saxlama = eyni slug ilə ikinci INSERT → unique violation → generic 500 → sonradan yazılan content SƏSSİZCƏ İTİR. Köhnə content-siz draft approve olunur. | TƏSDİQLƏNDİ (əsl kök səbəb) |
| 2b | 60 xəbərdə content_az = NULL | RSS pipeline content yazmır (`createFetchedNewsArticle` interfeysində contentAz parametri yoxdur), pipeline tərcüməsi yalnız title+summary yazır, köhnə "Düzəliş et" modalında contentAz sahəsi yoxdur | TƏSDİQLƏNDİ (RSS üçün dizayn, manual üçün bug) |
| 2c | Başqa xəbərə link verdim, o link üstələdi | Manual xəbərdə `externalUrl` doldurulanda `isManual=false` olur (`newsRepository.ts:697` sentinel `manual:` yalnız boş URL-də) → "Mənbədə tam xəbəri oxu →" düyməsi çıxır (`app/haberler/[slug]/page.tsx:160`) + content boş olanda səhifə "stub + xarici link" görünür | TƏSDİQLƏNDİ |
| 3 | "Düzəliş et" sahəsi məhduddur | Modal yalnız titleAz+summaryAz+imageUrl. PATCH backend 22 sahə qəbul edir (PR #352), `NewsEditorForm` `initialDraft` dəstəkləyir — yalnız `[id]` edit SƏHIFƏSİ yoxdur | TƏSDİQLƏNDİ |
| 4 | Flag-lar işləyirmi? | 7 flag-dan yalnız `isEditorPick` consumer-ə malikdir. `isManset/isTop/isGundem/telegramSend/logoOverlay/newsType` = flag-only (heç bir frontend oxumur, telegram göndərmə + logo overlay kodu ümumiyyətlə YOXDUR) | TƏSDİQLƏNDİ |
| 5 | "Originaldan draft yarat" işləmir | Düymədə AI YOXDUR — client-side copy-paste (boş AZ sahəsinə original title köçürür). Manual xəbərdə titleAz dolu olduğundan heç nə etmir. AI hissəsi TASK-0254 olaraq təxirə salınmışdı, yazılmadı | TƏSDİQLƏNDİ |

## 2. Auditin tapdığı ƏLAVƏ kritik problemlər (heç kim bilmirdi)

1. **SEO canonical → 404:** hər xəbərin canonical + hreflang + OG url-i mövcud olmayan `/sektor-nebzi/` route-una işarə edir (`app/haberler/[slug]/page.tsx:44-55`). Google-a hər xəbər üçün 404 canonical verilir.
2. **Auth bypass:** `canAccessNewsAdmin` Origin/Referer header-inə güvənir (`lib/news/admin-access.ts:21-33`) — sessiyasız istifadəçi saxta Referer ilə xəbər yarada/silə bilər.
3. **`newsType` uyğunsuzluğu:** form `'foto'` göndərir, Zod `'photo'` gözləyir — "Foto xəbər" seçilən hər saxlama 400 alır.
4. **Açıq draft preview:** `?preview=true` auth yoxlamır — hər kəs qaralama oxuya bilər.
5. **`/api/news/[slug]` ölü route:** DB-dən yox, mockNewsDB-dən oxuyur.
6. **RSS feed (`/api/rss/haberler`)** real xəbərləri yox, mock blog datasını yayımlayır.
7. **Ana səhifə NewsPreview** tam hardcoded mock — real xəbər ana səhifəyə heç vaxt düşmür.
8. **`seoTitle`/`seoDescription`** DB-də saxlanır amma `generateMetadata`-da istifadə olunmur.
9. **Approved-amma-görünməz tələ:** public şərt non-empty `summaryAz` tələb edir — summary-siz approved xəbər səssizcə görünmür.
10. **`publishedAt` qapısı yoxdur** — gələcək tarixli approved xəbər dərhal çıxır.
11. **3 fərqli slugify implementasiyası** (120 vs 240 simvol, `İ→i` fərqi) + news üçün slug-redirect mexanizmi yoxdur.
12. **`updated_at` sütunu yoxdur** — düzəliş tarixçəsi izlənilə bilmir.
13. **PATCH-də Zod validation yoxdur**, admin route-larda rate limiting yoxdur.
14. **Avtomatik RSS cron yoxdur** — fetch yalnız manual trigger (n8n sənədi var, qurulmayıb).
15. **Tərcümə xətaları yalnız console-a yazılır** — admin heç vaxt görmür; tərcümədən sonra status avtomatik dəyişmir.

## 3. Dünya/bölgə araşdırması — qərarlara təsir edən nəticələr

- **Hüquq (AZ):** "Media haqqında" qanun m.13.2 — müqaviləsiz başqa medianın məlumatının max 1/3-i, istinad məcburi. Standart format: mənbə İLK CÜMLƏDƏ ("X-ə istinadən"). **Hüquq (TR):** FSEK m.36/71 + Basın Kanunu m.24 — mənbəsiz iqtibas cəzalandırılır; agentlik (AA/DHA) məzmunu kreditlə belə abunəsiz istifadə olunmaz. → Model B (faktları öz sözlərinlə + inline istinad + link) hər iki hüquqa uyğun YEGANƏ təhlükəsiz modeldir.
- **AI disclosure:** EU AI Act Art.50 (avqust 2026) + Trusting News: məqalə sonunda "(1) AI nəyə kömək etdi, (2) niyə, (3) [adlı redaktor] yoxladı" formatı güvəni artırır, quru etiket azaldır. Human-in-the-loop axınımız Art.50 editorial istisnasını qarşılayır — sənədləşdirilməli + səhifədə görünməlidir.
- **Google scaled-content:** AI cəzalandırılmır, dəyərsiz kütləvi rewrite cəzalandırılır. Xam RSS tərcüməsini kütləvi approve etmək RİSKLİDİR; DK analitik sintezi + istinad təhlükəsizdir.
- **Silmə standartı:** professional CMS-lər hard delete etmir — unpublish/archive + URL 410. Ana səhifəyə 301 = anti-pattern (soft-404).
- **News→tool hunisi:** NerdWallet/7shifts/Toast modeli — alət CTA-sı mətnin İÇİNDƏ kontekstual nöqtədə; ilk istifadə qeydiyyatsız. RelatedToolkitsBox planını təsdiqləyir.
- **Format:** Axios Smart Brevity ("Niyə vacibdir / Rəqəmlərlə / Dərinə get") — Model B sintez şablonu üçün hazır resept.
- **Bazar boşluğu:** Azərbaycanda xüsusi HoReCa B2B mediası YOXDUR — sektor nəbzi real boş yuvaya oturur.

## 4. SIRALI İCRA PLANI — 8 task, hər biri ayrı PR

> Köhnə plan (TASK-0161/0162/0163) LƏĞV: nömrələr May ayında bağlanmış task-larla toqquşur, sıralama da səhvdir (qırıq baza üstünə dekorasiya). Yeni nömrələr: 0301-0308. DB migration-ları yalnız idempotent SQL — Doğan Neon-da özü işlədir.

### TASK-0301 — Create-flow bütövlüyü: content itkisini dayandır (P0)
İlk POST-dan sonra form PATCH rejiminə keçir (id yadda saxlanır); `'foto'`→`'photo'` fix; slug pre-check → 409 + insan dili mesaj; API xəta detalı toast-da. Diaqnostik SQL (Neon): duplicate slug + manual content-siz sətirlər. **Verifikasiya:** draft→content əlavə→publish eyni məqalədə; ikinci saxlama 200; Neon-da content_az dolu.

### TASK-0302 — Sil + Yayımdan çıxar (admin UI) (P0)
"Sil" düyməsi (başlıqlı confirm) → mövcud DELETE endpoint; "Yayımdan çıxar" = status dəyişikliyi. Qərar: hard delete + status-əsaslı unpublish (410 cədvəli xəbər həcmi artanda). **Verifikasiya:** UI-dan sil → Neon-da yox, public 404.

### TASK-0303 — Tam edit səhifəsi `xeberler/[id]` (P0, 0301-dən asılı)
`NewsEditorForm initialDraft` ilə PATCH rejimində mount; `[locale]` mirror (L-038); "Düzəliş et" bura yönləndirilir; köhnə məhdud modal silinir. Qərar: modal yox SƏHIFƏ (form onsuz da 30+ sahə dəstəkləyir). **Verifikasiya:** mövcud xəbəri aç → bütün sahələr dolu; flag dəyiş → Neon-da görünür.

### TASK-0304 — Status workflow + publish-gate (P1)
Summary boşdursa content-dən avto-excerpt (~220 simvol) + approved-amma-görünməz sətirlərdə xəbərdarlıq çipi + status etiketləri insan dilində. Backfill SQL ilə mövcud gated xəbərlər açılır.

### TASK-0305 — Flag consumer-ləri real işləsin (P1)
`/haberler`: hero=isManset, "Gündəm" zolağı, "Top" sidebar. `telegramSend`+`logoOverlay` checkbox-ları formdan ÇIXARILIR (sütunlar qalır) — inteqrasiya gələnə qədər ölü toggle saxlamırıq. newsType → kiçik badge. **Verifikasiya:** Neon-da is_manset=true → canlıda hero dəyişir (screenshot).

### TASK-0306 — i18n Pattern A + qadağan söz + SEO canonical (P1)
3 dublikat inline copy obyekti → `messages/*.json` `news` namespace; `NewsEditorForm.tsx:715` "tezliklə" → düzəldilir; canonical/hreflang/OG `/sektor-nebzi/` → `/haberler/`. **Verifikasiya:** canlı curl-da canonical `/haberler/`; grep "tezliklə" → 0.

### TASK-0307 — RelatedToolkitsBox (köhnə "0162") (P2)
Approve anında BİR DeepSeek çağırışı (JSON mode, `lib/ai-models.ts`) → `related_toolkits JSONB` sütununa 2-3 slug; render-da config-dən oxunur (SSOT), uydurma slug validate-də düşür; AI fail → statik kateqoriya→alət fallback. Render zamanı AI ÇAĞIRILMIR (2GB qaydası). SQL: `ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS related_toolkits JSONB;`

### TASK-0308 — Markdown render + görsel bloklar + preview auth (P2, sonuncu)
News content blog-un markdown stack-i ilə render olunur + `remark-directive` (gallery/video); textarea qalır (Tiptap YOX — 2GB); `?preview=true` `canAccessNewsAdmin` arxasına alınır. **Verifikasiya:** incognito-da preview → 404; `::video` canlıda embed.

### Ayrıca (plan xarici, qeyd):
- **Auth bypass fix** (`canAccessNewsAdmin` Origin/Referer) — TASK-0301-ə və ya ayrıca təcili PR-a salınmalıdır, CEO qərarı.
- Telegram bot + logo overlay + RSS cron + AI draft sintezi (TASK-0254) — ayrı backlog, bu plan bitəndən sonra.
- `/dashboard/ilanlar/[id]` review səhifəsidir, sahə-edit deyil — ilanlar üçün ayrı task lazımdır (news planına qarışdırılmır).

## 5. Sonra dişləyəcək kök problemlər (CTO qeydləri)
1. POST-only create axını = content itkisinin tək kök səbəbi (0301 bağlayır)
2. 3 × ~250 sətirlik dublikat locale copy = L-004 xəstəliyi (0306 bağlayır)
3. Canonical→404 = səssiz, yığılan SEO zərəri (0306)
4. Bir status enum iki lifecycle daşıyır (RSS review vs manual authoring) — gizli publish şərtləri görünən edilməli (0304)
5. Schema vs prod drift yoxlaması yoxdur — dövri `information_schema.columns` diff skripti tövsiyə olunur
6. Ölü toggle-lar paneldə güvəni yeyir — ya implement, ya çıxar (0305)
7. Task nömrəsi təkrar istifadəsi tarixçəni səssiz yazır — hook yalnız fayl mövcudluğunu yoxlayır

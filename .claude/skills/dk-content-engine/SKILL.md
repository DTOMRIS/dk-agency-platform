---
name: dk-content-engine
description: DK Agency content engine — turn research into a published, multilingual,
  SEO-ready blog post through a human-in-the-loop pipeline (scout → propose → draft →
  YOU approve → publish). Use when writing a new blog/article, planning the content
  calendar, or asking "what should we write about".
when_to_use: new blog post, content calendar, "yeni yazı", "nə yazaq", franchise/HoReCa
  article, repurposing a post to other channels.
disable-model-invocation: true
argument-hint: [topic-or-"scout"]
---

# DK Agency Content Engine

Systematizes content so we never start from zero. **Human-in-the-loop — never auto-publish**
(Fəsil 11 legal mine, m.726, slug drift were all caught by human review). Builds on existing
infra — do NOT rebuild it:
- Publish: the `dk-blog-publish` skill (number/slug/cover/DB).
- Translate: auto on publish (AZ → ru/en/tr), TASK-0225 — `lib/ai/translate.ts`.
- SEO: blog already emits Article + Breadcrumb + Organization + (if FAQ section) FAQPage (TASK-0215/0217).

## Pipeline (5 stages)
| Stage | Who | Output |
| :-- | :-- | :-- |
| 1. Scout | agent | Angled, **sourced** topic list (no guessing — cite the source) |
| 2. Select | **Doğan** | Picks topics (1 min) |
| 3. Draft | agent | AZ master in the DK template (below) |
| 4. Review | **Doğan / CTO** | Fact-check + tone + legal (AQTA SST, no "Agentlik/Holdinq/CRM") |
| 5. Publish | `dk-blog-publish` | DB insert + slug/cover + cross-link; auto-translate fires on publish |

`/dk-content-engine scout` → run stage 1. `/dk-content-engine <topic>` → jump to stage 3 draft.

## Scout sources (cite when proposing)
- **Para dergisi** — franchise fee/royalty/reklam bedeli tables, low-cost models, sector splits (kahve/tatlı/fast-food). TR franchise ~$55B; >50% of deal volume = 2-3 branch young brands → supports "devral, sıfırdan qurma".
- **The Economist** — franchise is **AI-proof** (face-to-face, community); IFA 2026: 845k units, ~9M jobs, $920B+; 85% live where they operate. Angle: AI threatens white-collar → franchise rises.
- **AFA / dövlət strategiyası** (Qastronomiya 2030), AQTA/KOBİA, şikayət trendləri, RSS (docs/RSS-SOURCES.md).

## DK blog template (stage 3 draft must follow)
- Frontmatter: `stage` (Başla/Böyüt/Devir) + `category` + `paywall` + `note` (disclaimer).
- Structure: hook intro → 4-6 H2 sections (one idea each, scannable) → **Faydalı məlumat qutusu** → **Doğan Notu** → Yekun → **DK CTA** → **Mənbə** line + "ümumi məlumatdır, hüquqi məsləhət deyil".
- **AEO:** add a `## Suallar və cavablar` (FAQ) section with `### sual?` → auto-emits FAQPage (highest AI-citation lever).
- GEO: expert quote + 1-2 stats + inline source (boosts AI citation +30-41%).
- Contrast: light bg → dark text only (`dk-i18n-pattern`). No hosted brand logos (L-039).

## Topic backlog (from research — ready to draft)
1. **AI Çağında Franchise Niyə Daha Güvənlidir** (Economist: AI-proof, üz-üzə, topluluq) — güclü positioning
2. **Franchise Bedelləri: İsim Haqqı, Royalty, Reklam** (Para — şəffaf bedel rehberi)
3. **Düşük Büdcəli Franchise Fürsətləri** (Para — fee almayan modellər)
4. **Çox Şubeli Operator Olmaq** (Economist/Flynn — tək şubədən şəbəkəyə)
5. **Franchise vs Müstəqil İşlətmə** (qərar yazısı)
6. **Yeni Modellər: Ghost Kitchen, Food Truck** (aşağı bariyer)
7. **Wellness/Sağlam Yemək Trendi** (ən sürətli böyüyən seqment)
8. **Topluluk Sahipliği: Ahilik + Modern Franchise** (Economist 85% yerli + marka fəlsəfəsi)

## Multi-channel (1 emək → 5 kanal)
Hər blog → IG caption + story · newsletter · toolkit lead-magnet · LinkedIn. Tək yazı, çox çıxış.

## HALT (insan lazımdır)
1. Hüquqi iddia / qanun / rüsum rəqəmi → CTO təsdiqi (Fəsil 11 dərsi).
2. AQTA: yalnız SST — «ASAN/KOBİA, dövlət rüsumu yox, pulsuz».
3. Heç vaxt avtomatik dərc — həmişə Doğan "yayınla" deməli.
4. Mənbəsiz statistika yazma — yumşalt və ya mənbə əlavə et.

## Definition of Done (publish)
Prefix-siz `/blog/<slug>` 200 · cover 200 · 4 dil (auto-translate) · FAQ bölməsi (AEO) · CHANGELOG · cross-link.

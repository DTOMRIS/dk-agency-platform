# Dead Code Map (TASK-0098)

**Tarix:** 8 May 2026

## Production Render Paths (təsdiqləndi)

- Public Footer: `components/layout/Footer.tsx` ← `PublicChrome.tsx`
- Public Header: `components/layout/Header.tsx` ← `PublicChrome.tsx`
- Homepage Hero: `components/Hero.tsx` ← `app/[locale]/page.tsx`
- Homepage CTASections: `components/CTASections.tsx` ← `app/[locale]/page.tsx`
- Homepage NewsPreview: `components/NewsPreview.tsx` ← `app/[locale]/page.tsx`
- Homepage ToolkitShowcase: `components/ToolkitShowcase.tsx` ← `app/[locale]/page.tsx`
- Homepage AdsPreview: `components/AdsPreview.tsx` ← `app/[locale]/page.tsx` (dynamic)
- Homepage StageSelector: `components/StageSelector.tsx` ← `app/[locale]/page.tsx` (dynamic)
- Dashboard Sidebar: `components/dashboard/DashboardSidebar.tsx`
- Dashboard Top Bar: `components/dashboard/DashboardTopBar.tsx`

## Silinən Duplikatlar (19 fayl, 2635 sətir)

### Footer (4 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/layout/Footer.tsx` | 119 | 1 (PublicChrome) | ✅ SAXLA |
| `components/Footer.tsx` | 121 | 0 | 🗑️ SİLİNDİ |
| `components/home/Footer.tsx` | 121 | 0 | 🗑️ SİLİNDİ |
| `components/shared/Footer.tsx` | 121 | 0 | 🗑️ SİLİNDİ |
| `components/editorial/Footer.tsx` | 135 | 0 | 🗑️ SİLİNDİ |

### Header (3 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/layout/Header.tsx` | 431 | 1 (PublicChrome) | ✅ SAXLA |
| `components/Header.tsx` | 130 | 0 | 🗑️ SİLİNDİ |
| `components/home/Header.tsx` | 130 | 0 | 🗑️ SİLİNDİ |
| `components/shared/Header.tsx` | 130 | 0 | 🗑️ SİLİNDİ |

### Hero (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/Hero.tsx` | 144 | 1 (page.tsx) | ✅ SAXLA |
| `components/home/Hero.tsx` | 70 | 0 | 🗑️ SİLİNDİ |
| `components/shared/Hero.tsx` | 208 | 0 | 🗑️ SİLİNDİ |

### AdsPreview (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/AdsPreview.tsx` | 170 | 1 (page.tsx dynamic) | ✅ SAXLA |
| `components/home/AdsPreview.tsx` | 123 | 0 | 🗑️ SİLİNDİ |
| `components/shared/AdsPreview.tsx` | 123 | 0 | 🗑️ SİLİNDİ |

### CTASections (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/CTASections.tsx` | 196 | 1 (page.tsx) | ✅ SAXLA |
| `components/home/CTASections.tsx` | 164 | 0 | 🗑️ SİLİNDİ |
| `components/shared/CTASections.tsx` | 164 | 0 | 🗑️ SİLİNDİ |

### NewsPreview (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/NewsPreview.tsx` | 203 | 1 (page.tsx) | ✅ SAXLA |
| `components/home/NewsPreview.tsx` | 145 | 0 | 🗑️ SİLİNDİ |
| `components/shared/NewsPreview.tsx` | 145 | 0 | 🗑️ SİLİNDİ |

### StageSelector (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/StageSelector.tsx` | 120 | 1 (page.tsx dynamic) | ✅ SAXLA |
| `components/home/StageSelector.tsx` | 121 | 0 | 🗑️ SİLİNDİ |
| `components/shared/StageSelector.tsx` | 121 | 0 | 🗑️ SİLİNDİ |

### ToolkitShowcase (2 ölü, 1 canlı)

| Yol | Sətir | Import | Qərar |
|-----|-------|--------|--------|
| `components/ToolkitShowcase.tsx` | 128 | 1 (page.tsx) | ✅ SAXLA |
| `components/home/ToolkitShowcase.tsx` | 169 | 0 | 🗑️ SİLİNDİ |
| `components/shared/ToolkitShowcase.tsx` | 169 | 0 | 🗑️ SİLİNDİ |

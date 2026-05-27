# API Map — DK Agency Platform

> Bu sənəd manuel yenilənir. Hər yeni endpoint əlavə olunduqda TASK card-ında "API Map güncəllə" addımı olmalıdır.

Last updated: 27 May 2026 (TASK-0179B)
Total endpoints: **69** (13 auth-protected, 9 rate-limited)

## Quick Index

- [Auth](#auth) — 10 endpoints
- [KAZAN AI](#kazan-ai) — 2 endpoints
- [Marketing Tools](#marketing-tools) — 8 endpoints
- [AI Tools](#ai-tools) — 2 endpoints
- [Admin](#admin) — 8 endpoints
- [Listings](#listings) — 6 endpoints
- [Blog & News](#blog--news) — 14 endpoints
- [Invoices & Finance](#invoices--finance) — 5 endpoints
- [Leads](#leads) — 2 endpoints
- [Member](#member) — 4 endpoints
- [System & Infra](#system--infra) — 8 endpoints

---

## Auth

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | ✅ | Yeni istifadəçi qeydiyyatı (KVKK consent + Zod) |
| POST | `/api/auth/login` | Public | ✅ | JWT login |
| POST | `/api/auth/logout` | Public | - | Session təmizlə |
| GET | `/api/auth/me` | Public | - | Cari istifadəçi məlumatı |
| POST | `/api/auth/forgot-password` | Public | ✅ | Şifrə sıfırlama email göndər |
| POST | `/api/auth/reset-password` | Public | ✅ | Token ilə şifrə yenilə |
| POST | `/api/auth/change-password` | Public | - | Mövcud şifrə ilə dəyiş |
| GET | `/api/auth/confirm` | Public | ✅ | Email təsdiq token |
| POST | `/api/auth/verify-email` | Public | - | Email verification |
| POST,GET | `/api/auth` | Public | ✅ | Legacy auth endpoint |

## KAZAN AI

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST | `/api/kazan-ai` | Public | ✅ | Chat mesaj göndər → DeepSeek/Claude cavab (context injection: P&L, Readiness) |
| POST,PATCH,GET | `/api/kazan-ai/leads` | Public | - | KAZAN lead toplama (ad, telefon, biznes tipi) |

## Marketing Tools

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST,GET | `/api/marketing-tools/marka-kompasi` | Member | - | Brand positioning (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/kst-yoxlayici` | Member | - | KST audit (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/menyu-analitigi` | Member | - | Menu engineering matrix (AI tips) |
| POST,GET | `/api/marketing-tools/musteri-persona` | Member | - | Customer persona (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/pnl-simulator` | Member | - | P&L simulation (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/promosyon-roi` | Member | - | Promo ROI (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/sezon-planlama` | Member | - | Season campaign calendar (DeepSeek AI) |
| POST,GET | `/api/marketing-tools/sikayet-analitigi` | Member | - | Complaint root cause analysis (AI) |

## AI Tools

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST | `/api/ai/ad-writer` | Member | ✅ | AI reklam mətni yaradıcı (3 ton) |
| POST | `/api/ai/complaint-response` | Member | ✅ | AI şikayət cavab (3 ton: formal/dostane/qısa) |

## Admin

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| GET,POST | `/api/admin/members` | Admin | - | İstifadəçi siyahısı + əlavə |
| GET,PATCH,DELETE | `/api/admin/members/[id]` | Admin | - | İstifadəçi detalı + yenilə + sil |
| DELETE | `/api/admin/members/bulk` | Admin | - | Toplu silmə (max 50) |
| POST | `/api/admin/members/[id]/reset-password` | Admin | - | Admin tərəfindən şifrə sıfırla |
| GET | `/api/admin/audit-logs` | Admin | - | Audit log tarixçəsi |
| POST | `/api/admin/news/approve` | Public* | - | Xəbər təsdiqlə |
| GET | `/api/admin/news/pending` | Public* | - | Gözləyən xəbərlər |
| POST | `/api/admin/news/reject` | Public* | - | Xəbər rədd et |

> *Admin news endpoints-ında auth guard eksikdir (TECH_DEBT)

## Listings

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| GET,POST | `/api/listings` | Public | - | Elan siyahısı + yeni elan |
| GET | `/api/listings/[id]` | Public | - | Elan detalı |
| PATCH | `/api/listings/[id]/status` | Public | - | Elan statusu dəyiş |
| GET,POST | `/api/listings/[id]/leads` | Public | - | Elan lead-ləri |
| POST | `/api/listings/[id]/reviews` | Public | - | Elan rəy əlavə |

## Blog & News

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| GET,POST | `/api/blog` | Public | - | Blog siyahısı + yeni post |
| GET,PATCH,DELETE | `/api/blog/[slug]` | Public | - | Blog detalı + yenilə + sil |
| GET | `/api/news` | Public | - | Xəbər siyahısı |
| GET | `/api/news/[slug]` | Public | - | Xəbər detalı |
| GET | `/api/news/admin` | Public | - | Admin xəbər siyahısı |
| PATCH | `/api/news/admin/[id]` | Public | - | Xəbər yenilə |
| PATCH | `/api/news/sources/[id]` | Public | - | RSS mənbə yenilə |
| POST | `/api/news/fetch` | Public | - | RSS xəbər çək |
| POST | `/api/news/translate` | Public | - | Xəbər tərcümə et |
| POST | `/api/news-pipeline/fetch` | Public | - | Pipeline: RSS fetch |
| POST | `/api/news-pipeline/translate` | Public | - | Pipeline: translate batch |
| GET | `/api/newsletter/digest` | Public | - | Həftəlik digest |
| GET | `/api/rss/haberler` | Public | - | RSS feed (haberler) |
| GET | `/api/rss/xeberler` | Public | - | RSS feed (xeberler) |

## Invoices & Finance

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| GET,POST,DELETE | `/api/invoices` | Public | - | Fatura CRUD |
| GET,POST,PATCH,DELETE | `/api/invoice-categories` | Public | - | Fatura kateqoriyaları |
| POST | `/api/invoice-ocr` | Public | ✅ | OCR fatura skan (AI vision) |
| POST | `/api/invoice-pdf` | Public | - | Fatura PDF generate |
| GET | `/api/food-cost` | Public | - | Food cost dashboard data |

## Leads

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST | `/api/leads/track` | Public | - | Lead tracking event |
| GET | `/api/leads/whatsapp` | Public | - | WhatsApp deep link redirect |

## Member

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| POST | `/api/member/auth` | Public | - | Member auth |
| POST | `/api/member/checkout` | Public | - | Ödəniş başlat |
| GET,POST,DELETE | `/api/member/session` | Public | - | Session idarə |
| POST | `/api/member/webhook` | Public | - | Payment webhook |

## System & Infra

| Method | Path | Auth | RL | Purpose |
|---|---|---|---|---|
| GET | `/api/health` | Public | - | Health check |
| GET,PATCH | `/api/settings` | Public | - | Site tənzimləmələri |
| POST | `/api/upload` | Public | - | Fayl yüklə (Cloudinary) |
| POST | `/api/test-email` | Public | - | Test email göndər |
| POST | `/api/telegram/post` | Public | - | Telegram mesaj göndər |
| POST | `/api/orchestrator` | Public | - | n8n orchestrator |
| GET,PATCH,DELETE,POST | `/api/audit/[id]` | Public | - | Restoran audit CRUD |
| GET,POST,DELETE | `/api/audit` | Public | - | Audit siyahısı |

---

## Statistika

| Kateqoriya | Endpoint sayı | Auth | Rate Limited |
|---|---|---|---|
| Auth | 10 | 0 | 7 |
| KAZAN AI | 2 | 0 | 1 |
| Marketing Tools | 8 | 8 | 0 |
| AI Tools | 2 | 2 | 2 |
| Admin | 8 | 5 | 0 |
| Listings | 5 | 0 | 0 |
| Blog & News | 14 | 0 | 0 |
| Invoices | 5 | 0 | 1 |
| Leads | 2 | 0 | 0 |
| Member | 4 | 0 | 0 |
| System | 9 | 0 | 0 |
| **TOPLAM** | **69** | **15** | **11** |

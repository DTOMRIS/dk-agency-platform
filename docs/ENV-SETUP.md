# Environment Setup

## News Pipeline

`NEWS_API_SECRET=<random-32-char-string>`

Bu secret `POST /api/news-pipeline/fetch` və `POST /api/news-pipeline/translate` endpoint-lərinə n8n və ya bənzəri webhook çağırışları üçün lazımdır. Production-da güclü, 32 simvolluq random dəyər istifadə edin.

## Resend Email

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=DK Agency <onboarding@resend.dev>
ADMIN_EMAIL=info@dkagency.az
NEXT_PUBLIC_SITE_URL=https://dkagency.az
```

**Quraşdırma addımları:**
1. [resend.com/api-keys](https://resend.com/api-keys) — API key al
2. Vercel → Settings → Environment Variables → `RESEND_API_KEY=re_xxxxx` əlavə et
3. **Sandbox mode:** `EMAIL_FROM=DK Agency <onboarding@resend.dev>` — yalnız öz email-inə göndərə bilir
4. **Production:** Domain verify et → `EMAIL_FROM=DK Agency <noreply@dkagency.az>` ilə əvəz et

**Göndərilən emaillər:**
- Yeni lead → admin bildirişi (`ADMIN_EMAIL`-ə)
- Lead confirmation → müraciət edənə (lead email-i varsa)
- Listing approved → sahibkara (listing.email-ə, yalnız `showcase_ready` statusunda)
- Email verification → yeni qeydiyyat zamanı (member email-inə)

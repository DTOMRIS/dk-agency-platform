# Member Env Checklist

Bu fayl DK Agency membership/paywall qatını canlıya çıxarmaq üçün minimum env checklist-dir.

## 1. Auth

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Bu iki env varsa auth adapter avtomatik `supabase` moduna keçir.

## 2. Payment

- `PAYMENT_CHECKOUT_URL`

Bu env varsa `/api/member/checkout` həmin URL-ə `plan=member|annual` query əlavə edib redirect qaytarır.

Misal:

```env
PAYMENT_CHECKOUT_URL=https://checkout.example.com/session
```

## 3. Webhook

- `MEMBER_WEBHOOK_SECRET`

`/api/member/webhook` endpoint-i `x-member-webhook-secret` header-i ilə qorunur.

Misal:

```env
MEMBER_WEBHOOK_SECRET=dk_member_webhook_secret_123
```

## 4. App URL

- `NEXT_PUBLIC_APP_URL`

Checkout fallback və canonical redirect-lər üçün istifadə olunur.

## 5. Canlı axın

1. İstifadəçi premium məqalədə 40% oxuyur
2. Paywall overlay açılır
3. Login/Register işləyir
4. Session cookie + local session yaranır
5. `/uzvluk` içində checkout CTA `/api/member/checkout` çağırır
6. Payment provider ödənişdən sonra webhook göndərir
7. Webhook mərhələsində entitlement yazılması əlavə olunmalıdır

## 6. Qalan son iş

- webhook payload-un DB-yə yazılması
- `member_subscriptions` və `member_entitlements` update
- billing history UI
- failed payment / canceled subscription edge-case handling

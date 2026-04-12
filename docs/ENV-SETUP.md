# Environment Setup

## Admin Password Rotation

Production-da admin/member şifrələrini dəyişmək üçün:

```bash
# Yeni şifrələr təyin et
ADMIN_SEED_PASSWORD=DkAdmin2026!
MEMBER_SEED_PASSWORD=DkMember2026!

# Canlı DB-ni yenilə
npx tsx scripts/rotate-admin-password.ts
```

Bu script `users` table-dakı admin/member role-lu user-lərin şifrələrini yeniləyir. Development-da mock data üçün fallback dəyərlər işləyir.

## News Pipeline

`NEWS_API_SECRET=<random-32-char-string>`

Bu secret `POST /api/news-pipeline/fetch` və `POST /api/news-pipeline/translate` endpoint-lərinə n8n və ya bənzəri webhook çağırışları üçün lazımdır. Production-da güclü, 32 simvolluq random dəyər istifadə edin.

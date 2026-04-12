# n8n RSS Pipeline Setup

## Nədir

Hər 6 saatdan bir HoReCa sektoruna aid xəbərlər RSS mənbələrindən avtomatik çəkilir, DeepSeek vasitəsilə Azərbaycan dilinə tərcümə olunur və admin paneldən yayımlanmağa hazır vəziyyətə gəlir.

## Endpoint-lər

| Endpoint | Metod | Auth Header | Təsvir |
|----------|-------|-------------|--------|
| `/api/news-pipeline/fetch` | POST | `x-api-secret` | RSS mənbələrindən xəbər çəkir |
| `/api/news-pipeline/translate` | POST | `x-api-secret` | Çəkilmiş xəbərləri AZ dilinə tərcümə edir (batch 10) |

Auth header adı: `x-api-secret`
Header dəyəri: `.env.local`-dakı `NEWS_API_SECRET` ilə eyni olmalıdır.

## Qurulum

### 1. Workflow-u Import Edin

1. n8n instance-ınıza daxil olun (self-host: `http://localhost:5678` və ya n8n Cloud)
2. Sol menyu — **Workflows** — **+ Add Workflow**
3. Sağ üst künc — **...** (3 nöqtə) — **Import from File**
4. `docs/n8n-rss-workflow.json` faylını seçin
5. **Import** basın

### 2. Environment Variables Əlavə Edin

n8n-in environment variable-larını iki yolla təyin edə bilərsiniz:

**Self-host (Docker/systemd):**
```bash
# docker-compose.yml və ya .env faylına əlavə edin:
N8N_ENVIRONMENT_VARIABLES_ENABLED=true
GENERIC_TIMEZONE=Asia/Baku

# Aşağıdakıları n8n mühitinə əlavə edin:
DK_API_URL=https://dkagency.az
NEWS_API_SECRET=<.env.local-dakı NEWS_API_SECRET dəyəri>
```

**n8n Cloud:**
1. Settings → Environments → Variables
2. `DK_API_URL` = `https://dkagency.az` (və ya Vercel preview URL-i)
3. `NEWS_API_SECRET` = `.env.local`-dakı ilə eyni 32 simvolluq dəyər

### 3. Workflow-u Aktivləşdirin

1. Workflow səhifəsini açın
2. Sağ üst küncündəki toggle-ı **Active** vəziyyətinə gətirin
3. İlk manual test üçün **Execute Workflow** basın

## Test

### Manual Test Addımları

1. Workflow-u açın
2. **Execute Workflow** basın (Schedule trigger-i bypass edir)
3. **Fetch News** node-u seçin — output-da neçə xəbər insert olunduğunu yoxlayın:
   - `inserted`: yeni əlavə olunan xəbər sayı
   - `skipped`: dublikat olaraq keçilən xəbər sayı
4. **Wait 30s** — 30 saniyə gözləyir (n8n-də real vaxt keçir)
5. **Translate News** node-u seçin — output-da:
   - `translated`: uğurla tərcümə olunan xəbər sayı
   - `failed`: xəta verən xəbər sayı
6. Admin panel: `/dashboard/haberler` səhifəsindən yoxlayın

### curl ilə Manual Test

```bash
# Fetch endpointini test et
curl -X POST https://dkagency.az/api/news-pipeline/fetch \
  -H "x-api-secret: YOUR_NEWS_API_SECRET"

# Translate endpointini test et
curl -X POST https://dkagency.az/api/news-pipeline/translate \
  -H "x-api-secret: YOUR_NEWS_API_SECRET"
```

## Cədvəl

Workflow hər **6 saatdan bir** avtomatik işləyir:
- 00:00, 06:00, 12:00, 18:00 (server vaxtı ilə)

Tezliyi dəyişmək üçün **Schedule** node-unu açın və `hoursInterval` dəyərini dəyişin.

## Slack Bildirişi (opsional)

Workflow-a Slack node əlavə etmək üçün:

1. **Notify Success** node-undan sonra yeni node əlavə edin
2. `n8n-nodes-base.slack` tipini seçin
3. Parametrlər:
   - **Resource**: Message
   - **Operation**: Post
   - **Channel**: `#dk-agency-ops` (və ya istədiyiniz kanal)
   - **Text**:
     ```
     RSS Pipeline tamamlandı.
     Çəkildi: {{ $json.fetched }} xəbər
     Tərcümə: {{ $json.translated }} xəbər
     Vaxt: {{ $json.completedAt }}
     ```
4. Slack Credentials-ı əlavə edin (Slack Incoming Webhook URL)

## Tez-tez Rast Gəlinən Problemlər

| Problem | Səbəb | Həll |
|---------|-------|------|
| 401 Unauthorized | `NEWS_API_SECRET` uyğun deyil | n8n env var-ı yenidən yoxlayın |
| 500 Internal Server Error | RSS mənbəyi əlçatmaz | Fetch node output-unda `details` sahəsini yoxlayın |
| Translate timeout | DeepSeek API yavaş cavab verdi | Translate node-da `timeout`-u 180000ms-ə artırın |
| Dublikat xəbərlər | Normal davranış | Pipeline dublikatları avtomatik keçir (`skipped` sayacı) |

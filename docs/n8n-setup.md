# n8n Setup for RSS News Pipeline

## n8n nədir
n8n, kod yazmadan iş axınları yaratmaq üçün açıq mənbə workflow avtomatlaşdırma platformasıdır. Biz bu layihədə RSS xəbərləri çəkmək, tərcümə etmək və bildiriş göndərmək üçün n8n istifadə edirik.

## Niyə n8n istifadə edirik
- API və webhooklarla asan inteqrasiya
- Vizual iş axını idarəsi
- Təkrar istifadə oluna bilən node-lar
- Docker və bulud variantlarıyla rahat deploy

## Self-host vs n8n Cloud

### Self-host
- Üstünlüklər:
  - Tam nəzarət, öz şəbəkə və firewall siyasəti
  - Məlumatlar yerli serverdə qalır
- Məhdudiyyətlər:
  - Infrastruktur qurulması və yeniləmələr sizə aiddir
  - SSL / domain konfiqurasiyası əlavə işdir

### n8n Cloud
- Üstünlüklər:
  - Sürətli başlanğıc
  - Avtomatik yenilənən host
  - SSL hazır
- Məhdudiyyətlər:
  - Daha bahalı ola bilər
  - Xüsusi şəbəkə nəzarəti məhduddur

## Workflow import addımları
1. `docs/n8n-rss-workflow.json` faylını yükləyin.
2. n8n Dashboard → Workflows → Import seçin.
3. JSON faylı seçin və workflow-u idxal edin.
4. Workflow-a `BASE_URL`, `NEWS_API_SECRET`, `SLACK_WEBHOOK_URL` env var-larını əlavə edin.
5. Workflow-u aktiv edin.

## Env var-lar
- `BASE_URL` — `https://dkagency.az` və ya testdə `http://localhost:3000`
- `NEWS_API_SECRET` — güclü, 32 simvolluq random secret
- `SLACK_WEBHOOK_URL` — bildiriş üçün Slack webhook URL

## Manual test
1. n8n Dashboard-da workflow-u açın.
2. `Execute Workflow` düyməsini basın.
3. `Fetch News` node nəticəsini yoxlayın.
4. `Translate News` node nəticəsini yoxlayın.
5. `Check Success` node "+" yolunu izləyin.
6. Slack mesajını yoxlayın (əgər webhook konfiqurasiya olunubsa).

## Troubleshooting

### `401 Unauthorized`
- `BASE_URL` doğru URL olmalıdır.
- `Authorization` header: `Bearer <NEWS_API_SECRET>`.
- `NEWS_API_SECRET` env var n8n-da və serverdə eyni olmalıdır.

### `429 Too Many Requests`
- Eyni endpoint-ə 60 saniyədən tez çağırmayın.
- Workflow-u test edərkən birinci çağırışı tamamlayın, sonra 30s yox, 60s gözləyin.

### Network problemi
- Server `https://dkagency.az`-a çıxış imkanını yoxlayın.
- TLS/SSL xətaları varsa, `BASE_URL`-in prefiksini doğru təyin edin.

## Success qeydləri
- `Fetch News` node: `fetched`, `skipped`, `errors` sayları
- `Translate News` node: tərcümə olunan xəbər sayı
- `Slack Notification` node: `200 OK` status

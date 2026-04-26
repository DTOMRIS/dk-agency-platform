# n8n RSS Auto-Fetch — Setup Rehberi

## Esas melumat
Bu workflow her 6 saatdan bir RSS feedlerden xeber cekir, DeepSeek ile AZ diline tercume edir ve `/api/news` endpointine POST edir.

## Telebat
- n8n instance (self-host ve ya cloud)
- DeepSeek API key
- NEWS_API_SECRET (DK Agency backend)
- Telegram bot token (optional, error alert ucun)

## Addim 1: n8n Qurasdirilmasi

### Self-host (VPS-de)
```bash
# Docker ile (en asan)
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=<GUCLU_SIFRE> \
  n8nio/n8n
```

### n8n Cloud
1. https://app.n8n.cloud/ hesab acin
2. Workflow import edin (asagida)

## Addim 2: Environment Variables

n8n Settings > Variables bolmesinde bu degerleri elave edin:

| Variable | Deger | Qeyd |
|----------|-------|------|
| `BASE_URL` | `https://dkagency.com.tr` | Production URL |
| `NEWS_API_SECRET` | `<.env.local-dan goturun>` | API auth token |
| `DEEPSEEK_API_KEY` | `<DeepSeek dashboard-dan>` | Tercume ucun |
| `RSS_FEED_URL_1` | `https://en.horecatrend.com/feed` | Esas feed |
| `RSS_FEED_URL_2` | `https://www.hospitalitynet.org/news/global.xml` | Ikinci feed |
| `TELEGRAM_BOT_TOKEN` | `<BotFather-dan>` | Error alert (optional) |
| `TELEGRAM_CHAT_ID` | `<Chat ID>` | Error alert (optional) |

## Addim 3: Workflow Import

1. n8n dashboardu acin
2. Sol menyudan "Workflows" > "Import from file"
3. `docs/n8n/rss-auto-fetch-workflow.json` secin
4. Import olunandan sonra her node-u yoxlayin
5. "Active" toggle-i ON edin

## Addim 4: Test

1. Workflow-u acin
2. "Execute Workflow" basin (manual test)
3. Her node-un cixisini yoxlayin:
   - Fetch RSS: XML data gelmeli
   - Parse RSS: 10 item array
   - DeepSeek Translate: AZ tercume
   - POST /api/news: 201 status

## Troubleshooting

### DeepSeek 401 Error
- API key-in duzgun oldugunu yoxlayin
- https://platform.deepseek.com/api_keys den yeni key yaradin
- Kredit balansini yoxlayin

### POST /api/news 401 Error
- NEWS_API_SECRET degerini .env.local-dan goturun
- Backend-de bu secret-in yoxlandigini tesdiq edin

### RSS Fetch Timeout
- Bezi RSS feedler yavasdirr, timeout-u 30 saniyeye artirin
- RSS URL-in brauzerden acildiqini yoxlayin

### Telegram Alert Gelmir
- @BotFather ile bot yaradin, token goturun
- Bota `/start` yazin, sonra https://api.telegram.org/bot<TOKEN>/getUpdates ile chat_id tapin

## Feed Elave Etme

Yeni RSS menbe elave etmek ucun:
1. Workflow-a yeni "HTTP Request" node elave edin
2. URL-i env variable kimi teyin edin
3. "Parse RSS Items" node-una baglayiin
4. docs/RSS-SOURCES.md-de qeyd edin

## Cron Teqvimi
- Default: Her 6 saat (00:00, 06:00, 12:00, 18:00 Baki vaxtile)
- Schedule node-unda deyisdirile biler
- Minimum tovsiye: 4 saat (API limitlerine gore)

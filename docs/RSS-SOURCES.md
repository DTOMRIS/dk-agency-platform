# RSS Mənbələri — Xəbər Aqreqasiyası

## Aktiv feedlər

| Mənbə | URL | Dil | Tərcümə |
|-------|-----|-----|---------|
| **Turizmplus.az** | https://turizmplus.az/rss | AZ | Yox |
| **Turizm Media** | https://turizmmedia.az/feed | AZ | Yox |
| **HORECA TREND** | https://en.horecatrend.com/feed | TR | TR→AZ |
| **Hospitality Net** | https://www.hospitalitynet.org/news/global.xml | EN | EN→AZ |
| **Hospitality Net MEA** | https://www.hospitalitynet.org/news/mea.xml | EN | EN→AZ |
| **Hospitality Net Europe** | https://www.hospitalitynet.org/news/europe.xml | EN | EN→AZ |

## Yoxlanılıb, RSS yoxdur

| Mənbə | Qeyd |
|-------|------|
| gastronomiturkey.com | /rss HTML qaytarır, standart RSS deyil |
| mutfakhaber.net | /feed, /rss — 404 |
| tourismboard.az | Rəsmi sayt, RSS yoxdur (scraping lazımdır) |

## Tərcümə API

- **DEEPSEEK_API_KEY** — prioritet (OpenAI uyğun endpoint)
- **GEMINI_API_KEY** — alternativ

GitHub Secrets: `DEEPSEEK_API_KEY` və ya `GEMINI_API_KEY`

## Əmrlər

```bash
npm run fetch:news                    # Tərcümə ilə
npm run fetch:news -- --no-translate  # Tərcümə olmadan
npm run fetch:news -- --limit=5       # Max 5 yeni xəbər
```

## Günlük iş

`.github/workflows/fetch-news.yml` — hər gün 08:00 UTC

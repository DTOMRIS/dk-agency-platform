# RSS Mənbələri — Xəbər Aqreqasiyası

> **Həqiqi siyahı kodda:** `lib/news/rss-ingest.ts` → `RSS_FEEDS` (aşağıdakı köhnə cədvəl tarixçədir).
> TASK-0557 (05.11.2026): əlavə olundu — Oxu.az `/feed`, Metbuat.az `/rss.xml`, Banker.az `/feed/`, Xəzər Xəbər `/rss`,
> AFN.az `/rss.xml` (xarab XML, `repairFeedXml` düzəldir), Turizmplus.az `/feed/`. RSS-i yoxdur: marja.az, fed.az,
> 1news.az, publika.az, sia.az, azvision.az, iqtisadiyyat.az, caliber.az, taxes.gov.az. Google News RSS AZ dilini indeksləmir.
> Toplama: 2 saatda bir (`/api/cron/news-collect`) — Report.az RSS yalnız son ~3 saatı saxlayır.

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

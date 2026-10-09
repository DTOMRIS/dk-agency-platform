# ADR-0017: Landing v2 — HoReCa food-cost kimliyi, Kutlerri/R365 dizayn dili, sahib kanalları

## Status
Accepted (Doğan, 08.10.2026)

## Context
- `CLAUDE.md` DK-nı «investment/holding, restoran sistemi deyil» kimi təsvir edirdi, amma ana səhifə artıq «Bu ay pul hara getdi?» və food cost üzərində qurulmuşdu — qayda reallıqla ziddiyyətdə idi.
- Sahib dünya nümunələrini verdi: kutlerri.ai (siqnal → addım kartları, Gəlir/Xərc qruplaşması, telefon mockup-ları) və restaurant365.com (ekosistem halqası). Toast (Toast IQ) ürün istiqaməti: dashboard-dan təsdiq istəyən agentlərə.
- Satış səhifəsi (`/tanitim`) prototipində mənbəsiz iddialar var idi; yoxlamada bəziləri doğru çıxdı (Sektor Nəbzi: 41 RSS, hər 6 saat), bəziləri yox (ROI 14 ay, 100 addım, 80%, «Canlı API» kadr cəlbi).
- Saytdakı `t.me/dkagency` linki yad (Hindistan, mərc reklamı) kanala aparırdı.

## Decision
1. **Kimlik:** DK = restoran/kafe/otel üçün HoReCa məsləhət + platforma (Toolkit, KAZAN AI, OCAQ, B2B, Sektor Nəbzi). `/` və `/tanitim`-in əsas mesajı food cost / P&L / delivery / gündəlik nəzarətdir.
2. **Dizayn dili (landing):** krem `#F6F1E9` + ink `#0F172A` + tək vurğu `#E94560`, Inter 800/900; telefon mockup-ları, siqnal → addım kartları (dayandırma düyməsi, `prefers-reduced-motion`), Gəlir/Xərc tabları, ekosistem halqası. Hər mock ekranda «Nümunə məlumat — yalnız təsvir üçün.»
3. **Rəqəm qaydası:** landing-də hər rəqəm ya məhsulun öz hesabıdır, ya yoxlanan mənbəlidir. «Uydurma» hökmündən əvvəl iddianın bütün kod yolu (workflow + lib + scripts) yoxlanır.
4. **Sahib təsdiqləri:** «40 il» (iş həyatı 01.07.1986), unvan «Qurucu», «Pulsuz diaqnostika» (müddətsiz), model = razılaşan şirkətə xüsusi xidmət, üzvlük sonra; footer «DENİS TOMRİS MMC · VÖEN 1405471681» doğrudur; «Azərbaycanın ilk AI-dəstəkli HoReCa platforması» sahibin iddiası olaraq qalır. Alt CTA-dan «24/7», «eksklüziv investisiya», «limitsiz giriş», «ödənişsiz ilk konsultasiya» çıxarıldı (real deyil).
5. **Kanallar:** WhatsApp +994 50 256 62 79; Telegram = açıq kanal **t.me/dkagenc** («DkAgency Sektör Nabzı»), `TELEGRAM_HANDLE = 'dkagenc'`; köhnə `dkagency` heç vaxt linklənmir. Təsdiqlənən xəbər kanala avtomatik düşür (yalnız tək təsdiq). Lead, WhatsApp klik, yeni üzv, yeni B2B elan (✅/❌) sahibin Telegram-ına; həftəlik xülasə B.e. 08:00 (GitHub Actions, `CRON_SECRET`).
6. **Qorunan fayl:** `components/layout/Header.tsx` (Modullar mega menyu) yalnız sahibin `ALLOW_PROTECTED=1` commit-i ilə.

## Consequences
- Ana səhifə köhnə bölmələrdən ToolkitShowcase, StageSelector, AdsPreview-u göstərmir (fayllar qalır); boş elan vitrinində AdsPreview geri qayıda bilər.
- İç səhifələr (Toolkit → Xəbərlər → Bloq) eyni dilə ayrıca PR-da keçəcək (əvvəl HTML ilə sahib təsdiqi).
- Telegram kanalına göndəriş üçün bot kanalda admin olmalıdır.

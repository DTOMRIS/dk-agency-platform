# WhatsApp avtomatlaşdırması — araşdırma (2026-10-11, TASK-0540)

Doğan: «whatsapp otomasyon olsun ama nedense whatsapp benim nömreme mesaj gelmiyor telegrama geliyor».

## İndiki vəziyyət (kodda yoxlanıb)
- Saytdan Doğan-a avtomatik WhatsApp mesajı **heç vaxt olmayıb**. Bildirişlər yalnız Telegram botu ilə (`lib/telegram/notify-owner.ts`, 18 çağırış).
- Saytdakı WhatsApp düymələri `/api/leads/whatsapp` → `wa.me/994502566279` (canlıda yoxlandı). Klik yalnız ziyarətçinin telefonunda WhatsApp-ı hazır mətnlə açır; mesaj ziyarətçi «Göndər»ə basanda gəlir. Telegram-dakı «WhatsApp kliki» bildirişi klikdə gedir — buna görə «Telegram-a gəlir, WhatsApp-a gəlmir» görünürdü. Bildiriş mətni indi bunu açıq deyir.
- Səhv nömrə: e-poçt şablonunun altında `wa.me/994507001636` (Doğan-ın deyil) və Instagram `dkagency.az` → düzəldi.

## Seçimlər
| Nə | Necə | Xərc | Qeyd |
|---|---|---|---|
| Doğan-a bildiriş WhatsApp-da | CallMeBot (pulsuz şlüz) | 0 | Şərtlər: «Free API is only for personal use» — biznes müraciəti (ad, telefon) üçüncü tərəfdən keçir. Tövsiyə olunmur. |
| Doğan-a bildiriş WhatsApp-da (rəsmi) | Cloud API, **ikinci** nömrədən utility şablonu | ~0,022 $ / mesaj (Rest of CEE, utility) | Öz nömrənə öz nömrəndən yazmaq olmur — ayrıca göndərən nömrə lazımdır. Telegram pulsuz və işləyir. |
| Müştəri ilə avtomatik yazışma (salamlama, kodla müraciəti panelə yazmaq, cavab şablonları) | WhatsApp Cloud API + **Coexistence** (994502566279 həm telefonda WhatsApp Business tətbiqində, həm API-da) | Müştəri yazanda 24 saat pəncərə: cavablar ayda ilk 1 000-ə qədər pulsuz (1.10.2026-dan sonra), sonra utility qiyməti; marketinq şablonu ~0,09–0,10 $ / mesaj | Meta Business hesabı + təsdiq, şablonlar Meta-da təsdiqlənir; qruplar və yayım siyahıları API-da yoxdur. |

Azərbaycan (+994) Meta-da «Rest of Central and Eastern Europe» qiymət bölgəsindədir. Bölgə qiymətləri üçüncü tərəf mənbələrindən (Manychat, GoHighLevel); Meta-nın öz cədvəlində dəqiqləşdirilməlidir.

## Tövsiyə
1. Bildirişlər Telegram-da qalsın (pulsuz, düymələrlə).
2. Müştəri avtomatlaşdırması: Cloud API + Coexistence, birbaşa Meta (BSP payı yoxdur). İlk addım: gələn mesajdakı `Kod: DK-XXXX`-i avtomatik oxuyub müraciəti paneldə səhifə ilə eşləmək + avtomatik salamlama (24 saat pəncərədə). Marketinq yayımı (OCAQ / Marketinq Ocağı) sonrakı mərhələ.
3. Doğan-dan lazım olan: Meta Business hesabı (business.facebook.com), biznesin təsdiqi (VÖEN sənədi), WhatsApp Business tətbiqi ≥ 2.24.17 və nömrə ən azı 7 gündür tətbiqdə.

## Mənbələr
- Meta, WhatsApp pricing: https://developers.facebook.com/docs/whatsapp/pricing
- Manychat pricing guide: https://help.manychat.com/hc/en-us/articles/14281380243740-WhatsApp-pricing-guide
- GoHighLevel, July 2026 pricing: https://ideas.gohighlevel.com/changelog/updated-whatsapp-per-message-pricing-effective-july-2026
- Coexistence: https://sendseven.com/en/blog/whatsapp-coexistence-guide-2026 · https://provixon.com/posts/whatsapp-coexistence-keep-business-app-add-api · https://whautomate.com/whatsapp-coexistence
- CallMeBot: https://www.callmebot.com/blog/free-api-whatsapp-messages/
- 1.10.2026 dəyişikliyi: https://www.dragapp.com/blog/whatsapp-business-api-pricing/

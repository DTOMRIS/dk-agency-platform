/**
 * OTA Guide PDF Content — Single Source of Truth
 *
 * Bu fayl PDF-e yazilacaq mezmunu saxlayir.
 * i18n keys istifade olunmur — PDF server-side renderdir, next-intl movcud deyil.
 * Azerbaycan dilinde, sanitize() ile transliterasiya olunacaq.
 */

export interface OtaGuideSection {
  title: string;
  bullets: string[];
}

export interface OtaGuideContent {
  coverTitle: string;
  coverSubtitle: string;
  coverBranding: string;
  sections: OtaGuideSection[];
  ctaHeadline: string;
  ctaBody: string;
  ctaContact: string;
}

export const OTA_GUIDE_AZ: OtaGuideContent = {
  coverTitle: 'OTA Acma Beledcisi',
  coverSubtitle: 'Booking.com, Airbnb ve Yandex Travel ucun tam hazirliq plani',
  coverBranding: 'DK Agency — Azerbaycanin AI-Destekli HoReCa Platformasi',

  sections: [
    {
      title: '1. Niye OTA? Rəqəmlər nə deyir',
      bullets: [
        'Azərbaycanda turizm 2025-2026-da 30%+ artım göstərir. Xınalıq, Lahıc, Qəbələ bölgələri ən sürətli böyüyən bazardır.',
        'Booking.com komissiyası: 10-25% (ortalama 15%). Airbnb split fee: host 3% + qonaq 14%. Yandex Travel: 12-15%.',
        'OTA olmadan pansiyon yalnız ağızdan-ağıza və sosial mediaya bağlıdır — bu isə mövsümi dalğalanmalara həddən artıq həssasdır.',
        'İlk 90 gündə Booking.com profilinizi aktivləşdirsəniz, platformanın "yeni mülk" boost-undan faydalanırsınız.',
      ],
    },
    {
      title: '2. Foto Hazırlığı — İlk Təəssürat',
      bullets: [
        'Minimum 20 yüksək keyfiyyətli foto: otaq (3-4 bucaqdan), hamam, mətbəx, giriş, həyət/bağ, mənzərə.',
        'Təbii işıq istifadə edin — səhər 8-10 arası ideal vaxtdır. Flash istifadə etməyin.',
        'Cover foto strategiyası: ən unikal xüsusiyyətinizi göstərin (mənzərə, şömine, bağ, tarixi arxitektura).',
        'Telefonla çəkirsinizsə: HDR rejimi açın, horizontalda çəkin, hər otağın ən geniş bucağını seçin.',
        'Mövsümi foto dəyişikliyi: yay və qış fotoları ayrıca yükləyin — axtarış reytinqini artırır.',
      ],
    },
    {
      title: '3. Profil Optimizasiyası',
      bullets: [
        'Başlıq formulası: "Mülk adı — Unikal xüsusiyyət — Bölgə" (məs. "Xınalıq Stone House — Mountain View — Qusar").',
        'Təsvir minimum 3 dildə olmalıdır: AZ, EN, RU. Yandex Travel üçün RU kritikdir.',
        'Amenity/facility siyahısını 100% doldurun — boş sahə reytinqi aşağı salır.',
        'Ünvan Google Maps-da dəqiq işarələnməlidir — yanlış pin = ləğv olunan bron.',
        'House rules aydın yazılmalıdır: check-in/out vaxtları, heyvan siyasəti, siqaret qaydası.',
      ],
    },
    {
      title: '4. Qiymət Strategiyası',
      bullets: [
        'Rəqib analizi: eyni bölgədə oxşar mülklərin qiymətini yoxlayın — 10-15% aşağıda başlayın (ranking boost üçün).',
        'Dinamik qiymət: yüksək mövsüm (iyun-sentyabr) +30-50%, aşağı mövsüm -20-30%.',
        'Minimum qalma müddəti: həftəsonları 2 gecə, yüksək mövsüm 3 gecə — bu ADR-i (Average Daily Rate) artırır.',
        'Early bird endirimi: 30+ gün əvvəl bron edənlərə 10% — bu Booking.com-da "mobility" boost verir.',
        'OTA komissiyasını qiymətə daxil edin, ayrıca "xidmət haqqı" almayın — qonaq bunu sevmir.',
      ],
    },
    {
      title: '5. Rəy (Review) İdarəetməsi',
      bullets: [
        'İlk 5 rəy kritikdir — əlaqədarlara, dostlara ilk bron-u xahiş edin və dürüst rəy yazdırın.',
        'Check-out sonrası 2 saat ərzində WhatsApp ilə rəy xahişi göndərin — bu konversiya 3x artırır.',
        'Mənfi rəyə 24 saat ərzində cavab verin. Ton: təşəkkür + üzr + konkret həll + dəvət.',
        'Rəy balı 8.0+ saxlayın — bundan aşağı Booking.com sıralamasında ciddi düşüş olur.',
        'Qonağa kağız kartla rəy xahişi (QR kodlu) qoyun — otaqda, stol üstündə, check-out zamanı.',
      ],
    },
    {
      title: '6. WhatsApp Şablonları — 3 Pulsuz Nümunə',
      bullets: [
        'İlk gəliş: "Salam {guestName}! {hostName} olaraq sizi {checkInDate} tarixində gözləyirik. Wi-Fi: {wifiPassword}. Yol haritası: [link]"',
        'Check-in təlimatı: "Check-in saatı: {checkInTime}. Açar yeri: {keyLocation}. Wi-Fi: {wifiPassword}. Səhər yeməyi: {breakfastTime}."',
        'Müsbət rəy təşəkkürü: "Əziz {guestName}, rəyiniz üçün çox təşəkkür edirik! {specificMoment} xüsusilə sevindirdi. Növbəti ziyarətdə görüşmək ümidi ilə."',
        'Tam 10 şablon (7 premium daxil) DK Agency KALFA paketində əlçatandır.',
      ],
    },
    {
      title: '7. ROI Hesablama Nümunəsi',
      bullets: [
        'Nümunə: 4 otaq, gecəlik 100 AZN, doluluk 40%, OTA komissiayası 15%.',
        'Aylıq ümumi gəlir: 100 × 4 × 0.40 × 30 = 4 800 AZN.',
        'OTA gəliri (70% OTA payı): 3 360 AZN. OTA komissiyası: 504 AZN.',
        'Aylıq xalis: 4 800 - 504 - 1 500 (sabit xərc) = 2 796 AZN.',
        'İllik xalis: 33 552 AZN. Geri qaytarma müddəti (20 000 AZN investisiya): ~7.2 ay.',
        'Bu sağlam (healthy) nəticədir. DK Agency ROI Kalkulyatoru ilə öz rəqəmlərinizi yoxlayın.',
      ],
    },
    {
      title: '8. Növbəti Addımlar',
      bullets: [
        'OTA Hazırlıq Testini keçin: dkagency.com.tr/toolkit/ota-hazirlig-testi',
        'ROI-nizi hesablayın: dkagency.com.tr/toolkit/qonaq-evi-roi-kalkulyatoru',
        'WhatsApp şablonlarını yükləyin: dkagency.com.tr/toolkit/whatsapp-template-paketi',
        'Pulsuz konsultasiya üçün əlaqə: info@dkagency.com.tr',
      ],
    },
  ],

  ctaHeadline: 'DK Agency ile isleyin',
  ctaBody: 'OTA setup, profil optimizasiyasi, qiymet strategiyasi ve review menecmenti ucun profesional destek.',
  ctaContact: 'info@dkagency.com.tr | dkagency.com.tr',
};

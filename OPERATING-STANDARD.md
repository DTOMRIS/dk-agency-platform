# DK Agency Platform - Operating Standard

Bu standartlar sənədi **dk-agency-platform** layihəsində yeni funksiya inkişafı, refaktoring və bug fix zamanı əməl olunmalı **məcburi** addımları, memarlıq qərarlarını və yoxlama siyahılarını (checklist) təyin edir.

Məqsəd: *"Yamaq" tipli kodlamalardan qaçınmaq, təkrarlanan xətaları sonlandırmaq və stabil, erqonomik, vahid bir sistem yaratmaq.*

---

## 1. ƏSAS PRİNSİPLƏR VƏ QİRMİZI XƏTLƏR

### 1.1 "Tam Dairə" (Full CRUD & Symmetry) Prinsipi
- **Tək Tərəfli Əlavə Qadağandır:** Əgər verilənlər bazasına yeni bir sahə (field) və ya model əlavə edilirsə, onun həm Public səhifədə göstərilməsi, həm də Admin Paneldə İdarə edilməsi **SİMMETRİK** olmalıdır.
- **Media və Fayllar:** Resim/Dokument yükləmə (upload) funksiyası əlavə olunursa, onun mütləq şəkildə **SİLMƏ (delete) və YENİLƏMƏ (update)** mexanizmi olmalıdır. Heç vaxt "sadəcə əlavə etmək"lə kifayətlənmə.
- **Toplu Əməliyyatlar (Bulk Actions):** Siyahı və idarəetmə panellərində yeni bir model yaradılarkən "Toplu Silmə" və "Toplu Əlavə/Redaktə (Bulk Add/Edit)" xüsusiyyətləri vizyonda saxlanmalı və tətbiq edilməlidir.

### 1.2 "Yamaq Yox, Kökdən Həll" (No Fragile Patches)
- Əgər bir problemi həll edən "Patch" bütün səhifənin layout-unu (görünüşünü) pozursa (`şunu ekle yama yapıyor sonra sayfa güm` ssenarisi), **geri dönülməli və struktur başdan yazılmalıdır.**
- Yeni CSS/Tailwind class-ları əlavə edərkən parent (ana) elementlərin flex/grid davranışları pozulmamalıdır. Mobile görünüşlər əsasında Responsive yanaşma (Mobile First) sınaqdan keçirilməlidir.

### 1.3 CSV və Data Export Standartı
- Bütün CSV, Excel və fayl ixracları default olaraq **UTF-8 (BOM ilə)** formatında hazırlanmalıdır.
- Excel və digər sistemlərdə xarakter pozulmasının (encoding issues) qarşısını almaq üçün UTF-8 BOM (`\uFEFF`) mütləq export faylına əlavə olunmalıdır.

### 1.4 SEO və süni İntellekt (AI Ready) Düşüncəsi
- Hər bir public səhifə üçün Next.js metadata API istifadə olunaraq `title`, `description` və `openGraph` məlumatları dinamik doldurulmalıdır.
- Səhifələrin məzmunu Semantic HTML5 ilə yazılmalıdır ki, həm axtarış sistemləri, həm də LLM agentləri (Kazan AI kimi) tərəfindən rahat anlaşılsın.

---

## 2. GÜNDƏLİK İŞ AXINI (WORKFLOW & PHASES)

Hər hansı bir tapşırığa (Task) başladıqda və onu bitirərkən aşağıdakı mərhələlər (Fazalar) tətbiq olunmalıdır.

### ═══ FAZ 1: ANALİZ VƏ PLANLAMA ═══
- Mövcud kod strukturunun araşdırılması. 
- Component iyerarxiyasında yuxarı-aşağı (parent-child) asılılıqların yoxlanması.
- Public və Admin tərəfində tam uyğunluq (Symmetry) üçün tələblərin təyin edilməsi.

### ═══ FAZ 2: EXECUTE — MİNİMUM RİSK, MAKSİMUM EFFEKT ═══
Aparat və fayl dəyişiklikləri qruplaşdırılmalı və izah olunmalıdır.

*Nümunə Format:*
```text
DOSYA: src/components/layout/Header.tsx
DEĞİŞİKLİK 1: Satır 113-121 — Kapsayıcı parent yapısı düzeltilerek layout shift engellendi.
DEĞİŞİKLİK 2: Satır 236-244 — Mobilde responsive (flex-1, text-xs) davranış eklendi.
```
- **Mobile First / Ergonomic:** Mobildə barmaq ölçüləri (minimum 44x44px touch target) və ekran daralması, həmçinin uzun mətnlərin (truncate/ellipsis/flex-wrap) daralması mütləq tətbiq olunacaq.

### ═══ FAZ 3: DOĞRULAMA — LOCALHOST SMOKE TEST & AUDIT ═══
Dəyişikliklər edildikdən sonra məcburi yoxlanış siyahısı (Test edənin vizual və praktik kontrolu):

**Mobil Test (Chrome DevTools / 375px və 390px):**
- [ ] Yeni əlavə elementlər mobil ekrana sığırmı? (scroll xətası yoxdur?)
- [ ] Parent element xarab oldumu? Qalereya və ya slider tam görünür mü?
- [ ] "Burger menu" və z-index elementləri işləyirmi?

**Cross-Layer & Data Test:**
- [ ] Məlumat əlavə olunur -> Bəs tam silinə bilirmi? (Media, Rəsm daxil).
- [ ] Məlumat Admin tərəfdə dolur -> Tam eyni sahələr (field-lər) Public tərəfdə görünür mü?
- [ ] CSV Export işləyir? -> Yüklənmiş fayl UTF-8 formatındadırmı və azərbaycan hərfləri (ə, ı, ö, ü, ş, ç, ğ) aydın oxunurmu?

**SEO & AI Uyum Testi:**
- [ ] Səhifə meta tag-lara sahibdirmi? 
- [ ] H1, H2 iyerarxiyası düzgündürmü?

### ═══ FAZ 4: CASCADE VƏ GÖRÜNÜŞ KURALI ═══
- İlk düzəliş (patch) edildikdən sonra **hələ də UI / Mobile tərəfində problem varsa**, İKİNCİ PATCH DƏRHAL ATILMAZ!
- **MANDATORY PAUSE (MƏCBURİ DAYANMA):** Parent layer auditi (Layout, Container, App.tsx) həyata keçirilir.
- CTO-ya və ya Doğan-a hesabat verilir, onaysız yamaq üstünə yamaq atmaq qətiyyən **QADAĞANDIR**.

### ═══ FAZ 5: COMMIT VƏ HESABAT (REPORT) ═══
Təkrar xətaların qarşısını almaq üçün commit mesajları aydın olmalı, səbəb və həlli göstərməlidir.

**Commit Formatı:**
```text
git commit -m "feat(module): qısa aydınlıq, məsələn: mobile pill responsive & full CRUD for images

- Remove md:hidden restriction to fix layout scale
- Added proper delete API endpoint for uploaded images to prevent orphan files
- Implemented UTF-8 BOM on CSV export to fix encoding issues
- Maintained symmetry across /dashboard and public routes

Resolves: mobile layout push, orphan image bug, csv encoding"
```

## 3. CHECKLİSTÖZƏT (TEZ-TEZ UNUDULANLAR QEYDİ)

Yeni bir model, səhifə və ya komponent edərkən həmişə baxılacaqlar:
1. **Ergonomika:** Çoxmu qarışıqdır? UI aydındırmı?
2. **Mobile Layout:** Dar ekranda qırılırmı?
3. **Resim Silmə (Media Mgt):** Şəkil yüklənildisə, sil button-u və bazadan silmə API-si hazırdırmı?
4. **Toplu (Bulk) Əməliyyat:** 50 sətir əlavə olunduqda idarəsi necə olacaq? Checkbox/bulk delete ehtiyacı varsa qur!
5. **CSV Encoding:** Fayl exportlarında `\uFEFF` əlavə edildimi?
6. **Symmetric Fields:** Adminlə public eynidirmi?
7. **SEO & AI:** `metadata` API dolduruldumu?
8. **Test Audit Plan:** Playwright (Mövcuddur) və ya Smoke Test ilə sınaqdan keçdimi?

Bu sənəd sistemin bütövlüyünü qorumaq üçündür və kod yazılarkən Agentlər və Tərtibatçılar tərəfindən Daim Mənbə (Source of Truth) kimi idarə olunacaqdır.

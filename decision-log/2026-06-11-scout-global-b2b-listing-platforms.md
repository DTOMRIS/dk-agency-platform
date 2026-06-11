---
agent: scout
tarih: 2026-06-11
proje: DKagency / OIC
görev: Global B2B business listing/classifieds platform araştırması — BizBuySell, Daltons, BFS, FranchiseDirect, TopFranchise, FranchiseTurkey — URL, form fields, trust, monetizasyon, AI, devir kategorileri
---

## Ne Buldum

### Araştırılan Platformlar (Live Playwright)
- BizBuySell.com — USA #1 (CoStar Group)
- DaltonsBusiness.com — UK #1 (Metropolis International)
- BusinessesForSale.com (BFS) — Global (Dynamis Ltd, 1996)
- FranchiseDirect.com — Global franchise
- TopFranchise.com — Global/CIS
- FranchiseTurkey.com — Turkey-specific
- Bayilik.com.tr — DNS RESOLVED FAILED (domain down 2026)
- Devirilan.com, Devir.com.tr, Isyeridevir.com — hepsi DNS FAILED
- Sahibinden.com/devir-isyeri — Login wall (bot koruması)

---

## PLATFORM ANALİZİ

### 1. BizBuySell.com
**URL Yapısı:**
- Listing list: `/businesses-for-sale/?q=[base64_filter]`
- Listing detail: `/business-opportunity/[slug]/[id]/`
- Franchise detail: `/franchise-for-sale/[slug]/`
- Broker detail: `/business-broker/[name]/[firm]/[id]/`
- Sell: `/sell/`
- Valuation: `/small-business-valuation/`

**Kategoriler (ana nav):**
- Buy a Business → Established Business, Asset Sales, Business Real Estate, Start-Up Opportunity
- Buy a Franchise → Food & Restaurant, Low Cost, Retail, Business Opportunities
- Sell a Business

**Kategori sayfaları (featured):**
- Restaurants, Hotels, Gas Stations, Storage/Warehousing, Pharmacies, Car Washes, Food Trucks, Franchise Opportunities, Laundromats

**Arama Filtreleri:**
- Location (text, geo-aware)
- Industry (sector)
- Listing Types (3 tür: Established Business, Franchise, Asset Sale)
- More Filters:
  - Price range (min/max)
  - Cash Flow range
  - Revenue range
  - Year Established (age of business)
  - Real Estate included (yes/no)
  - Seller financing (yes/no)
  - Keyword search

**Listing Card (liste görünümü):**
- Fotoğraf (sol)
- Başlık + Şehir/County/State
- Kısa açıklama (2 satır)
- Asking Price (sağda, büyük)
- Cash Flow (ikinci satır)
- Contact butonu
- Save (kalp ikonu)
- Engajman sayacı (görüntülenme/kaydetme sayısı)

**Listing Detail Page (tam alan listesi):**
```
Asking Price: [büyük, vurgulanmış]
Cash Flow (SDE): [veya "Not Disclosed"]
EBITDA: [veya "Not Disclosed"]
Gross Revenue: $65,000
Established: 1998

[Business Description — metin]

--- Detailed Information ---
Inventory: $5,000 (not included / included in asking price)
Furniture, Fixtures & Equipment (FF&E): $50,000 (included)
Facilities: [açıklama, sqft, lokasyon, adres]
Competition: [sektör analizi]
Growth & Expansion: [fırsat açıklaması]
Financing: [seller finance, SBA, etc.]
Support & Training: [süre ve kapsam]
Reason for Selling: [metin]

--- Business Location ---
Location: [şehir, eyalet]
Real Estate: Leased / Freehold
Building SF: 555
Lease Expiration: 04/10/2027
Rent: $1,030/mo

--- Business Overview ---
[3 bölüm daha — genellikle işletme geçmişi, rakipler, vs.]

[Valuation Report CTA]
[Ad# reference]
[Disclaimer]
[Similar Listings — 3-4 öneri]
```

**Monetizasyon:**
- Listing fee: ~$59.95/mo (tek liste, temel)
- Premium placement: featured listing
- Broker paketi: BrokerWorks (çoklu liste, CRM, leads)
- Buyer üyelik: BizBuySell Edge (~$49/ay — erken uyarı, premium filtrer, değerleme)
- Valuation Report: $179.95 (listing ile ücretsiz)
- Medya network: BizBuySell + BizQuest + LoopNet + FindaFranchise
- NO COMMISSION on sales (sadece listing fee)

**Trust Sistemi:**
- Disclaimer: "BizBuySell has no stake... has not independently verified"
- "Report an issue with this listing" linki
- "Avoid Scams" guide
- Broker profile verification (lisans, firma)
- SBA Pre-Qualified badge (bazı ilanlarda)
- REAL ESTATE INCLUDED badge

**AI Özellikleri (2026):**
- BizBuySell Edge: AI-powered valuation (SDE/EBITDA multiple)
- "Market Info" button — pazar analizi (CoStar data)
- Similar Listings algoritmik öneri
- No chatbot/AI matching tool visible

**Ölçek:**
- 200,000+ successful sales
- 120,000+ businesses listed annually
- 20M monthly page views
- 4M+ monthly visits
- Owned by CoStar Group (2021 satın alma)

---

### 2. DaltonsBusiness.com
**Tagline:** "The UK's Largest Business and Franchise Marketplace"
**Ölçek:** 20,000+ listings, 220,000+ registered buyers, 1.9M site visits/2023

**URL Yapısı:**
- List: `/listing-businesses-for-sale/`
- Categories: `/category-listing/`
- Sell: `/selling-a-business/`
- Create: `/create-listing/`
- Franchise: `/franchises-for-sale/`, `/franchise-resales-businesses-for-sale/`

**Kategori Sistemi (tam liste):**
Businesses for Sale:
- Agricultural & Gardening, Animal & Pet, B2B, Care, Cleaning, Commercial Properties, Construction, Corporate, Distribution, Engineering, Entertainment & Leisure, **Food Service**, Franchise Resales, Health & Wellbeing, Hire, Home Based, **Hotels**, Manufacturing, Marine, Mobile, Motor & Transport, Online, Partnership Opportunities, **Pubs**, Retail, Retirement, Service, Automotive

Franchises for Sale:
- Automotive, Business Opportunities, Business Service, Care, Children's, Christmas & Seasonal, Cleaning, Courier, Dating, Education, Entertainment & Leisure, Events & Wedding, Fitness, Food and Drink, Fuel & Road, Gardening, Health & Beauty, Home Based, Home Improvement, Marketing, Master Franchises, Mobile & Van Based, Moving & Storage, Online, Part-Time, Pet & Animal, Photography, Property & Estate Agency, Retail, Services Based, Sports, Technology, Travel

**Arama Filtreleri:**
- Business Type (text input, freeform)
- Location (text input)
- Advanced Filters:
  - Sale Price (£) min/max
  - Turnover (£) min/max
  - Net Profit (£) min/max
  - Business Type/Tenure: Freehold / Leasehold / Relocatable / Work From Home / Franchise / Open to Offers / Price Reduced / Accommodation
  - Age of Listing: Anytime / Last 14 Days / Last 30 Days / Last 90 Days
  - Advert Reference Number

**Listing Card:**
- Fotoğraf
- Başlık
- Lokasyon
- Kısa açıklama
- Price: "Freehold: £2,250,000" veya "Leasehold: £81,000"
- Annual Net Profit: £200,000
- Annual Turnover: £1,950,000
- FEATURED badge (yeşil)
- Details butonu + Contact Seller butonu
- Kalp (favoriler)
- Compare (karşılaştırma)

**Monetizasyon (Daltons Pricing — 2026):**
```
Basic Package:    2 ay — £225 + VAT
Gold Package:     3 ay — £325 + VAT (FEATURED listing + tel destek)
Premium Package:  6 ay — £425 + VAT (Social + Email newsletter + Homepage carousel)
Retirement Pack:  8 ay — £850 + VAT (Özel "Retirement Sale" badge + account manager)
```
- No commission on sales
- No contracts, no ongoing fees
- Broker paketi: ayrı "Agent Advertising" planı
- Trust: 1860'dan beri (Daltons' Weekly gazetesi)

**Trust Sistemi:**
- "Connecting business buyers and sellers since 1867"
- 220,000+ registered buyers
- Business valuation: ücretsiz partner referansı (Trusted Business Partners)
- Customer reviews section
- Personal account manager (Premium/Retirement)
- "Speak to a person, not a chatbot!" tagline

---

### 3. BusinessesForSale.com (BFS)
**Tagline:** "The world's largest marketplace of 58,996 businesses for sale"
**Ölçek:** 58,996 listings (global), since 1996

**URL Yapısı:**
- Home: `businessesforsale.com/`
- Category search: `/search/[category-name]-for-sale`
- Location search: `/[country]/search/businesses-for-sale-in-[city]`
- Country subdomains: `us.`, `uae.`, `malaysia.`, `thailand.`, `brazil.`
- Detail: `/[country]/listing/[id]/[slug]`
- Sell: `/sell-your-business`
- M&A Vault: `/m-and-a-vault` (yüksek değer)
- Valuation: `/valueright`

**Kategori Yapısı (HoReCa odaklı sayılar):**
- **Cafes: 7,540** (en büyük)
- **Food Businesses: 10,644**
- **Bars: 2,446**
- **Hotels: 1,772**
- **B&Bs: 1,095**
- Liquor Stores & Off Licences: 1,349
- Campgrounds: 190
- Farms: 197
- Websites: 471
- Petrol Stations: 482
- Laundries: 409
- Hidden Gems: 115
- Franchise Resales: ayrı bölüm

**Coğrafya (AZ pazarı için önemli):**
- Azerbaijani listings mevcut (Azerbaijan dropdown'da var)
- Dubai: 505 listings
- Turkey: dropdown'da var

**Arama Filtreleri:**
```
Sort by: Default / Newest / Asking Price (Low-High) / Turnover / Net Profit
Category tier (3 level, cascading)
Region tier (4 level, cascading)
Age: Anytime / Last 3 Days / Last 14 Days / Last Month / Last 3 Months
Country (full global list)
Price range
Revenue range
```

**Listing Card:**
- Asking Price range: "$500K - $1M (CAD)"
- Revenue range: "$1M - $5M (CAD)"
- Cash Flow: "On request"
- LEASE badge
- Listing type: BUSINESS / FRANCHISE / NEW FRANCHISE badge
- Save + Contact Seller butonları

**Franchise listing farkı:**
- Franchise Fee: $30,000
- Investment: On request
- Lifestyle: Full time
- Contact franchise butonu (ayrı)

**Monetizasyon:**
- Flexible packages (ülkeye göre değişiyor)
- Test the Market package
- Broker Sign Up: ayrı
- Franchisor Sign Up: ayrı
- Premium Buyer membership
- M&A Vault: high-value dealflow
- ValueRight: AI valuation tool

---

### 4. FranchiseDirect.com
**Arama Filtreleri:**
- Industry dropdown (36 kategori)
- Location dropdown
- Investment range dropdown

**Franchise Kategorileri:**
Accounting & Financial, Advertising & Marketing, Automotive, Business Opportunities, Business Services, Children's, Cleaning, Coffee, Computer & Internet, Consultant & Business Broker, Courier, Employment & Staffing, Entertainment, Fitness, **Food**, Franchise Service Providers, Golf, Health & Beauty, Healthcare & Senior Care, Home Based, Home Services, Industrial, Mailing & Shipping, Moving & Storage, Pet, Photography, Post-COVID, Printer/Copy/Sign, Real Estate, **Restaurant**, Retail, Sports, Tax, Training, Travel, Vending & ATM

**Investment Brackets:**
- Under $5K / $10K / $20K / $50K / $100K / $200K / $500K / Over $500K

---

### 5. TopFranchise.com
**Ölçek:** Global, CIS bölgesi için güçlü
**Lokasyonlar:** Azerbaijan dropdown'da var (!)

**Arama Filtreleri:**
```
Location: All locations → Amerika / Avrupa / Asya / Afrika / Okyanusya
Industry: 36+ kategori
Investment: Under $5K-$20K, Under $50K, Under $100K, Under $200K, Under $500K, Over $500K
```

**Franchise Kategorileri (TopFranchise):**
- Beauty & Health Care
- **Best Food Franchises for Sale in 2026** (ayrı featured kategori)
- Business Service
- Children's
- Cleaning
- Computer & IT
- Courier & Shipping
- Distributorship Opportunities
- Ecommerce
- Education
- Entertainment
- For Women Franchises
- Home Service & Repair
- **Hotel & Motel Franchises**
- Master Franchises
- **Seafood Franchises**

---

### 6. FranchiseTurkey.com
**URL:** franchiseturkey.com
**Arama:** Marka (text) + Sektör (dropdown)

**Sektör Kategorileri (Turkish — tam liste):**
```
Yiyecek - İçecek
  Fast Food
  Cafe - Tatlı Pasta
  Restoran
  Büfe
Hizmet
  Emlak - Güvenlik ve Temizlik
  Eğitim (Hizmet)
  Sağlık Güzellik
  Araç Bakım ve Onarım
  Aracılık Hizmetleri
  Turizm - Eğlence
  Ev Hizmetleri
  İş Hizmetleri
Ürün
  Mobilya ve Ev Tekstili
  Takı
  Kozmetik
  Elektronik ve Telefon
  Yapı Malzemesi - Hırdavat
  Oyuncak ve Hediyelik
  Market FMGC - Katlı Mağaza
  Beyaz Eşya - Züccaciye
  Benzin - Araç
  Giyim (Yetişkin, Çocuk, Ayakkabı-Çanta)
  Spor
Tedarik
  Bilgiişlem ve İletişim
  Gıda ve Sarf Malzemeleri
  Proje - İnşaat ve Tesisat
  Gayrimenkul
  Reklam - Tanıtım - PR ve İnternet
  ... (50+ toplam)
```

---

## DEVIR (Business Transfer) PLATFORMLARI — TÜRKİYE DURUM

**Bulunan:** Türkiye'de spesifik "devir" platformu yok veya yaşamıyor:
- bayilik.com.tr: DNS FAILED (domain dead)
- devirilan.com: DNS FAILED
- devir.com.tr: DNS FAILED
- isyeridevir.com: DNS FAILED
- kiracedevir.com: DNS FAILED

**Fiilen aktif olan:** Sahibinden.com "devir iş yeri" kategorisi (ama login duvarı var)

**Sonuç:** Türkiye'de dedicated devir platformu pazarda BOŞLUK var. Bu OIC/DKagency için fırsat.

---

## STANDART "BUSINESS FOR SALE" LISTING FORMU

Tüm platformları analiz ederek çıkarılan standart form alanları:

### Zorunlu Temel Alanlar (hepsi kullanıyor):
```
1. Listing Title / Business Name
2. Business Type / Category (sector)
3. Location (City, Region/State, Country)
4. Asking Price
5. Business Description
6. Contact Name + Phone + Email
```

### Finansal Alanlar (BizBuySell standartı):
```
Asking Price (required)
Gross Revenue / Annual Turnover (highly recommended)
Cash Flow / SDE / EBITDA (major trust signal)
Net Profit / Annual Net Profit
Year Established (business age)
Inventory value (included/not included)
FF&E value (Furniture, Fixtures, Equipment)
Real Estate: Freehold / Leasehold
Rent amount + Lease expiration
Building size (sqft/m²)
```

### Devir-Spesifik Alanlar (BizBuySell/Daltons):
```
Reason for Selling
Support & Training (seller transition period)
Seller Financing (yes/no)
SBA Pre-Qualified (US-specific)
Staff count
Operating hours
Licenses & Permits
Existing lease terms
Delivery channels (active/inactive)
```

### Franchise-Spesifik Alanlar:
```
Franchise Fee (upfront)
Total Investment Required
Royalty %
Marketing fee %
Training included (duration, location)
Territory size
Lifestyle: Full time / Part time
Franchise units (existing network size)
Years in franchise
```

### Medya:
```
Photos (min 1, max varies — BizBuySell recommends 10+)
Video URL (optional)
Virtual tour (optional)
Documents (NDA required usually for financials)
```

---

## TRUST & VERIFICATION SİSTEMLERİ

### BizBuySell:
- Disclaimer: unverified (buyer beware)
- "Report issue" link
- Avoid Scams guide
- Broker license verification (broker listings)
- SBA Pre-Qualified badge (bankadan)

### Daltons:
- "Connecting buyers & sellers since 1867" (branding)
- Personal Account Manager (premium)
- Free valuation via Trusted Partners
- 220,000+ buyer database

### BFS:
- Buyer Safety guide
- Seller Safety guide
- "Staying Safe" dedicated section
- M&A Vault (premium, high-value verified deals)

### FranchiseDirect:
- BBB (Better Business Bureau) accredited
- 25+ years experience badge
- Multiple awards/rankings (Entrepreneur.com, Franchise Times)
- Franchise Disclosure Document references

### Genel pattern (2026 standartı):
1. **Verification Badge** — platform tarafından manuel veya otomatik doğrulama
2. **Financial Disclosure** — Gross Revenue + Net Profit en az biri açık
3. **Escrow guidance** — para transferi için güvenli ödeme yönlendirmesi
4. **Fake Listing Prevention:** IP throttling, phone verification, email verification, manual review queue
5. **AI-assisted moderation** — 2026'da artıyor (flagging suspicious patterns)

---

## MONETİZASYON MODELLERİ

| Platform | Listing Fee | Süre | Featured | Commission |
|----------|------------|------|----------|-----------|
| BizBuySell | ~$60/mo | Aylık | Ücretli | 0% |
| Daltons Basic | £225+VAT | 2 ay | Yok | 0% |
| Daltons Gold | £325+VAT | 3 ay | Var | 0% |
| Daltons Premium | £425+VAT | 6 ay | Var+SM | 0% |
| BFS | Ülkeye göre | Değişken | Var | 0% |
| TopFranchise | Franchise fee | Sabit | Var | 0% |
| FranchiseDirect | Franchisor yıllık | Var | Var | 0% |

**Ortak pattern:** Commission yok, listing fee var, featured upsell var

**Premium Buyer subscription (yeni trend 2026):**
- BizBuySell Edge: ~$49/mo (erken uyarı, AI valuation, broker contact)
- BFS Premium Buyer: benzer model

---

## AI ÖZELLİKLERİ (2026 DURUMU)

BizBuySell:
- AI valuation (CoStar/BizBuySell data)
- Market Info (pazar istatistikleri)
- Algorithmic similar listings

BFS:
- ValueRight AI (business valuation)
- Search algorithm optimization

Genel trend:
- AI-powered matching buyer↔seller
- Auto-description generation (bazı platformlar)
- Fake listing detection AI
- Valuation tools (SDE multiple hesaplama)
- Email alert personalization

DK Agency fırsatı: KAZAN AI bu bağlamda differentiation sağlıyor (sektöre özgü AI danışman)

---

## DK AGENCY — MEVCUT DURUM vs GLOBAL STANDART

### DK Agency Mevcut Kategorileri:
```
devir (Business Transfer) ✓
franchise-vermek ✓
franchise-almaq ✓
ortak-tapmaq (Partner) — benzeri az var
yeni-investisiya (New Investment) — benzeri az var
obyekt-icaresi (Venue Rental) — benzeri az var
horeca-ekipman (Equipment) — benzeri az var
```

### DK Agency Mevcut Sektörler:
```
restoran, kafe, bar-pub, fast-food, otel-pansiyon, catering, diger
```

### Mevcut Form Alanları:
```
type (category), sector, title, description, price, currency (AZN only),
city, district, ownerName, phone, email, typeSpecificData (dynamic per type),
equipment (list), images (5 step wizard)
```

### Eksik vs Global Standart:

**KRİTİK EKSİK:**
```
✗ Gross Revenue / Annual Turnover (finansal şeffaflık yok)
✗ Net Profit / Cash Flow (trust signal #1 global platformlarda)
✗ EBITDA (orta-büyük işletmeler için)
✗ Year Established (kaç yıllık işletme)
✗ FF&E value (ekipman/demirbaş değeri)
✗ Real Estate type (Leased/Freehold)
✗ Lease expiration + monthly rent
✗ Reason for Selling (büyük güven unsuru)
✗ Support & Training period
✗ Staff count
✗ Daily/monthly customer count
✗ Seller financing option
```

**YENİ EKLENMESI GEREKEN (DK prioritesi):**
```
monthly_revenue (Aylıq dövriyyə) — AZN, görünür
monthly_profit_net (Xalis qazanc) — AZN, görünür
sqm (m²)
year_opened (açılış ili)
staff_count
lease_months_remaining (icarə müddəti — ay)
monthly_rent (aylıq icarə haqqı)
reason_for_sale (satış səbəbi)
training_included (yes/no + süre)
seller_finance (yes/no)
```

---

## HANGI KAYNAKLAR İŞE YARADI
- Playwright browser — direkt site ziyareti (BizBuySell, Daltons, BFS, FranchiseDirect, TopFranchise, FranchiseTurkey)
- JavaScript evaluation — select options, filter fields, category lists
- Text extraction — pricing pages, form fields

## HANGİ ARAMALAR SONUÇSUZ KALDI
- Bayilik.com.tr — DNS FAILED (dead domain)
- Devirilan.com, Devir.com.tr, Isyeridevir.com — DNS FAILED
- Sahibinden.com devir — Login wall
- BizBuySell listing creation form — Auth required

## TEKRAR EDEN PATTERN
Evet: Global en iyi platformlar şunu yapıyor:
1. **Finansal şeffaflık** — Revenue + Profit mutlaka var (veya "Not Disclosed" ile işaretli)
2. **Price + Cash Flow çifti** listing card'da hero metric
3. **No commission** model — sadece listing fee
4. **Featured upsell** — paid boost, homepage carousel, email blast
5. **Valuation tool** — güven ve listing creation teşviki

## SKILL GÜNCELLEME ÖNERİSİ
Bu araştırma pattern'i gelecekte tekrar kullanılabilir:
- Playwright + JS evaluation kombini çok verimli
- Platform pricing sayfaları genellikle public — direkt okunabilir
- Franchise kategorileri: Turkey (FranchiseTurkey) + Global (TopFranchise) en iyi referans CIS/AZ için

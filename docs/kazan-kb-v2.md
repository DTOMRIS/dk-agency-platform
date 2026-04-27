# KAZAN AI Knowledge Base v2

## Format
Her entry ayri JSON faylidir: `data/kazan-kb/v2/{category}-{sira}-{slug}.json`

## Batch Siyahisi

### Batch 1 — (henuz yoxdur, v1 lib/kazan-ai/knowledge-base.ts-dedir)

### Batch 2 — Maliyye (5 entry)
| # | Fayl | ID | Movzu |
|---|------|----|-------|
| 1 | finance-01-food-cost.json | kb-v2-fin-01 | Food Cost duzgun hesablama |
| 2 | finance-02-pnl.json | kb-v2-fin-02 | P&L kvartal hesabati oxuma |
| 3 | finance-03-kassa.json | kb-v2-fin-03 | Kassa idareetmesi ve naqd ferqi |
| 4 | finance-04-vergi.json | kb-v2-fin-04 | Vergi rejimi secimi (AZ HoReCa) |
| 5 | finance-05-break-even.json | kb-v2-fin-05 | Break-even point hesablama |

### Batch 3 — Idare (5 entry)
| # | Fayl | ID | Movzu |
|---|------|----|-------|
| 1 | management-01-turnover.json | kb-v2-mgmt-01 | Heyet dovriyyesi idareetme |
| 2 | management-02-menu-engineering.json | kb-v2-mgmt-02 | Menyu muhendisliyi |
| 3 | management-03-supplier.json | kb-v2-mgmt-03 | Techizatci secimi ve idaresi |
| 4 | management-04-stok-fifo.json | kb-v2-mgmt-04 | Stok idareetmesi ve FIFO |
| 5 | management-05-shift.json | kb-v2-mgmt-05 | Novbe planlamasi ve emek mehsuldarliqi |

### Batch 4 — Acilis (5 entry)
| # | Fayl | ID | Movzu |
|---|------|----|-------|
| 1 | launch-01-lokasiya.json | kb-v2-launch-01 | Lokasiya secimi (footfall, parkinq) |
| 2 | launch-02-aqta-lisenziya.json | kb-v2-launch-02 | AQTA qeydiyyati ve lisenziya |
| 3 | launch-03-metbex-layihe.json | kb-v2-launch-03 | Metbex layihelendirme |
| 4 | launch-04-budce.json | kb-v2-launch-04 | Acilis kapital budcesi |
| 5 | launch-05-marketing-90gun.json | kb-v2-launch-05 | Acilis marketinqi ve ilk 90 gun |

### Batch 5 — (gozleyir)

## JSON Schema
```json
{
  "id": "kb-v2-{cat}-{sira}",
  "category": "maliyye | idare | acilis | marketing | huquqi | personel",
  "subcategory": "...",
  "title_az": "...",
  "summary_az": "1-2 cumle",
  "content_az": "300-500 soz, struktur: terifle > formula > hedef > AZ kontekst > pitfall > cavanmerdlik",
  "tags": ["..."],
  "ahilik_quote_az": "Sektor atalar sozu ya Ahilik prinsipi",
  "context_required": ["mekan_tipi", "boyukluk", "..."]
}
```

## Qaydalar
- Statik reqem yox, range ver (28-32%)
- AZ spesifik: AQTA, ASAN, KOBiA, Sahibkarligin Inkisafi Fondu, Emek Mecellesi
- Wolt + Bolt Food (Yandex Yemek AZ-da feal deyil)
- Cavanmerdlik / SiMAT baqlantisi her entry-de minimum 1 cumle
- "vergi planlamasi" istifade et, "naxislanmamis" YASAQ
- Qadaqan: CRM, Pipeline, Agentlik sozleri

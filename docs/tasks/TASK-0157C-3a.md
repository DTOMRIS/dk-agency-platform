# TASK-0157C-3a: auditor + food-cost Pattern A

## Status: ready for review

## Scope (2 fayl)
- app/dashboard/auditor/page.tsx (33 key)
- app/dashboard/food-cost/page.tsx (29 key, months/monthsShort array)

## Key sayi
62 leaf key x 4 dil = 248 tercume

## Pattern
Client component, useTranslations
- dashboardAuditor (33 key)
- dashboardFoodCost (29 key + array)

## Terminology (CTO tesdiq)
- Audit funnel statuslari: draft/sent/meeting/converted/rejected
- statusConverted = "Mushteri" DOGRU (audit-den mushteriye cevrilme)
- CATEGORIES array toxunulmadi (L-013)

## Array handling
- months (13 element) ve monthsShort (13 element) JSON-da array
- Kodda t.raw('months') as string[]

## Out of Scope
- faturalar (C3b ayri PR)
- faturalar/[id] (TASK-0157D)
- MOCK_AUDITS data

## Parity
Auditor: 33/33/33/33
FoodCost: 29/29/29/29

## Build
PASS (0 error, 0 yeni warning)

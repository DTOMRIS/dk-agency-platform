# TASK-0157C-2b: roller Pattern A

## Status: ready for review

## Scope (1 fayl)
- app/dashboard/roller/page.tsx

## Key sayi
53 leaf key x 4 dil = 212 tercume

## Pattern
Client component (Discovery sehv idi — server deyil)
useTranslations('dashboardRoller')

## Terminology (CTO tesdiq)
- Movcud tercumeler olduqu kimi saxlandi
- AZ: "icaze" (permission), "rol" (role), "giris" (access)
- TR: "yetki" (authority), "izin" (permission), "erisim" (access)
- RU: "prava" (rights), "dostup" (access)

## Out of Scope
- Qalan 3 fayl (food-cost, faturalar, auditor — C3)
- Hardcoded role adlari (Admin/Moderator/Editor/Izleyici) — role data
- lib/member-access.ts (PROTECTED)

## Parity
53/53/53/53

## Build
PASS (0 error, 0 yeni warning)

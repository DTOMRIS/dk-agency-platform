# TASK-0157C-3b: faturalar Pattern A — SON FAYL

## Status: in progress

## Scope (1 fayl)
- app/dashboard/faturalar/page.tsx (1590 setir, ~65 key)

## Out of Scope
- faturalar/[id] (TASK-0157D)
- Currency formatter, tax calc, date formatter
- Status enum data

## Pattern
Client → useTranslations('dashboardFaturalar')

## Domain Risks
- Currency simvollari HARDCODED OLA BILER
- Tax label vs faiz deyeri ayrildi
- Date format vs label ayrildi

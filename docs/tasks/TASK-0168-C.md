# TASK-0168-C — UI: Consent Checkbox

- Status: ✅ Tamamlandı
- Tarix: 26 May 2026
- PR: pending
- Scope: Register form consent checkboxes (UI only)

## Dəyişikliklər
- `app/auth/register/page.tsx`:
  - registerCopy-yə 5 yeni key (consentLabel, termsLink, privacyLink, marketingLabel, consentRequiredError) × 4 dil
  - consentAccepted + marketingConsent state
  - Submit handler: frontend consent validation + API payload
  - 2 checkbox JSX: required consent + optional marketing
  - Submit button disabled until consent accepted
  - Links target="_blank" rel="noopener noreferrer"

## TASK-0168 Foundation tam
| Layer | Task | Status |
|---|---|---|
| DB Schema | TASK-0168-A | ✅ merged |
| API Validation | TASK-0168-B | ✅ merged |
| UI Checkbox | TASK-0168-C | ✅ |

# ADR-0011: URL Query Param Context Injection for KAZAN AI

## Status
Accepted

## Context
KAZAN is the AI assistant embedded in the toolkit pages. It needs business-specific context
(current food cost %, menu item counts, last audit score) to generate relevant responses.
Passing this data via a separate API call on every chat open adds latency.
The assistant can be linked from external tools (n8n workflows, email CTAs) and must arrive pre-loaded.

## Decision
Encode business metrics as a base64 JSON string in the `ctx` URL query parameter.
The client component decodes this on mount and injects it into the first system prompt message.
This is Crunchtime Step 6 in the KAZAN onboarding flow.
No sensitive data (passwords, tokens) is ever included in the context payload.

## Consequences
**Positive:** Zero additional API round-trip for context loading. AI greeting is personalized on first message. Works from external link entry points (email, n8n webhook).
**Negative:** URLs become long and non-human-readable when context payload is large. Base64 is not encryption — do not include confidential data in the param.

## References
- `components/toolkit/KazanChat.tsx`
- `docs/kazan-kb-v2.md` (Crunchtime Steps)
- n8n workflow: kazan-context-inject

## Date
2026-05-27

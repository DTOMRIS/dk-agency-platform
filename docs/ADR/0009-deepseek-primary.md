# ADR-0009: DeepSeek as Primary AI Model with Claude Fallback

## Status
Accepted

## Context
The platform uses AI for food cost analysis (KAZAN), content suggestions, and the Almila chatbot.
Claude (Anthropic) produces higher quality output but costs significantly more per token.
DeepSeek offers competitive quality at a fraction of the cost for high-volume, structured tasks.

## Decision
Three-tier model selection: DeepSeek (`deepseek-chat`) as primary for all AI runs,
Claude (via Anthropic API) as fallback for quality-critical tasks (contract generation, brand copy),
static rule-based fallback as third tier when both APIs are unavailable.
Average cost: 0.0003 AZN per AI run at current DeepSeek pricing.

## Consequences
**Positive:** Dramatically reduced AI API costs. Static fallback ensures feature availability during outages.
**Negative:** DeepSeek occasionally returns malformed JSON, requiring retry logic and response validation. Inconsistent output quality compared to Claude for nuanced text tasks.

## References
- `lib/ai/` (model router)
- `docs/kazan-kb-v2.md`
- DeepSeek API: api.deepseek.com

## Date
2026-04-15

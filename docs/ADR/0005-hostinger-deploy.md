# ADR-0005: Hostinger Over Vercel for Deployment

## Status
Accepted

## Context
Vercel charges increase significantly with team seats and bandwidth for TR/AZ region traffic.
The target audience is primarily in Azerbaijan and Turkey.
Hostinger offers Node.js hosting with GitHub auto-deploy at a lower cost point.

## Decision
Deploy to Hostinger Node.js hosting. GitHub push to `main` triggers auto-deploy via Hostinger's Git integration.
Build runs locally or on Hostinger's build server. Static assets served via Hostinger CDN.

## Consequences
**Positive:** TR/AZ CDN edge nodes reduce latency for primary audience. Significantly lower monthly cost. Custom domain and SSL included.
**Negative:** Build server is weaker than Vercel — large builds may time out. 503 errors occur during deploy while the Node process restarts. No preview deployments per PR.

## References
- `docs/DEPLOYMENT.md`
- Hostinger control panel
- `.github/workflows/` (if CI configured)

## Date
2026-02-15

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Team Operating Docs

Use these documents before starting implementation:

- `docs/SKILL-MATRIX.md`
- `docs/DELIVERY-SYSTEM.md`
- `docs/WEEK-EXECUTION-PLAN.md`
- `docs/CTO-DAILY-REPORT-TEMPLATE.md`
- `docs/PLATFORM-STANDARDS.md`

Quality gates are enforced by CI:

- `.github/workflows/ci.yml` (`npm run lint` + `npm run build`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

Current production remains on Vercel during the migration safety window.

Hostinger Business target pattern:

- `npm run build:standalone`
- Node.js 20 LTS in hPanel
- `HOSTNAME=0.0.0.0`
- Hostinger-managed `PORT`
- Cloudflare DNS in `DNS only` mode during first cutover
- Vercel left online for 24-48 hours as rollback target

Detailed migration runbook:

- `docs/deployment-hostinger.md`

## Legacy Vercel Note

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

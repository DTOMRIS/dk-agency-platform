import type {
  FinancialViabilityInput,
  FinancialViabilityResult,
} from '@/lib/financial/viability';

export interface FinancialReportCopy {
  locale: string;
  title: string;
  generatedAt: string;
  businessType: string;
  verdict: string;
  summary: string;
  fundingTitle: string;
  operatingTitle: string;
  sensitivityTitle: string;
  conditionsTitle: string;
  methodology: string;
  labels: Record<string, string>;
  conditions: string[];
  sensitivities: string[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} AZN`;
}

function row(label: string, value: string): string {
  return `<div class="row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

export function buildFinancialReportHtml(
  input: FinancialViabilityInput,
  result: FinancialViabilityResult,
  copy: FinancialReportCopy,
): string {
  const fundingRows = [
    row(copy.labels.availableBudget, money(input.availableBudget)),
    row(copy.labels.openingInvestment, money(input.openingInvestment)),
    row(copy.labels.workingCapital, money(result.workingCapitalNeed)),
    row(copy.labels.inventory, money(result.inventoryInvestment)),
    row(copy.labels.receivables, money(result.receivablesFunding)),
    row(copy.labels.supplierFinancing, `-${money(result.supplierFinancing)}`),
    row(copy.labels.deposits, money(input.depositsAndPrepaids)),
    row(copy.labels.rampLoss, money(result.rampUpLoss)),
    row(copy.labels.reserve, money(result.operatingReserve)),
    row(copy.labels.totalFunding, money(result.totalFundingNeed)),
    row(copy.labels.fundingGap, money(result.fundingGap)),
    row(copy.labels.runway, `${result.runwayMonths.toFixed(1)} ${copy.labels.months}`),
  ].join('');
  const operatingRows = [
    row(copy.labels.monthlySales, money(input.monthlySales)),
    row(copy.labels.breakEven, money(result.breakEvenRevenue)),
    row(copy.labels.dailyTransactions, String(result.dailyTransactions)),
    row(copy.labels.monthlyProfit, money(result.monthlyOperatingProfit)),
    row(copy.labels.safetyMargin, `${result.safetyMarginPct.toFixed(1)}%`),
    row(
      copy.labels.payback,
      result.paybackMonths === null
        ? copy.labels.notAvailable
        : `${result.paybackMonths.toFixed(1)} ${copy.labels.months}`,
    ),
  ].join('');

  return `<!doctype html>
<html lang="${escapeHtml(copy.locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(copy.title)}</title>
  <style>
    :root{color-scheme:light;--navy:#1b2a3a;--gold:#c5a022;--paper:#faf6f0;--ink:#172033}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif;line-height:1.5}
    main{max-width:780px;margin:auto;padding:24px}.hero,.card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:22px;margin-bottom:16px}
    .hero{background:var(--navy);color:#fff}.eyebrow{color:#e8cf67;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em}
    h1{font-size:28px;margin:8px 0}h2{font-size:18px;margin:0 0 14px}.verdict{display:inline-block;background:#fff;color:var(--navy);border-radius:999px;padding:8px 12px;font-weight:800}
    .row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #edf2f7}.row:last-child{border:0}
    ol{padding-left:22px}.note{font-size:12px;color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:640px){main{padding:12px}.grid{grid-template-columns:1fr}h1{font-size:23px}.row{align-items:flex-start}}
    @media print{body{background:#fff}main{max-width:none}.card,.hero{break-inside:avoid}}
  </style>
</head>
<body><main>
  <section class="hero">
    <div class="eyebrow">DK Agency · ${escapeHtml(copy.businessType)}</div>
    <h1>${escapeHtml(copy.title)}</h1>
    <p>${escapeHtml(copy.summary)}</p>
    <span class="verdict">${escapeHtml(copy.verdict)}</span>
    <p class="note">${escapeHtml(copy.generatedAt)}</p>
  </section>
  <div class="grid">
    <section class="card"><h2>${escapeHtml(copy.fundingTitle)}</h2>${fundingRows}</section>
    <section class="card"><h2>${escapeHtml(copy.operatingTitle)}</h2>${operatingRows}</section>
  </div>
  <section class="card"><h2>${escapeHtml(copy.conditionsTitle)}</h2><ol>${copy.conditions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section>
  <section class="card"><h2>${escapeHtml(copy.sensitivityTitle)}</h2><ol>${copy.sensitivities.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol></section>
  <section class="card note">${escapeHtml(copy.methodology)}</section>
</main></body></html>`;
}

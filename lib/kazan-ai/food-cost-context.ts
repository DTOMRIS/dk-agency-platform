import {
  getFoodCostReport,
  getMonthlyTrend,
  getSupplierComparison,
  getTopProducts,
} from '@/lib/repositories/invoiceRepository';

/**
 * KAZAN AI üçün real fatura data-sından food cost konteksti hazırlayır.
 * System prompt-a inject edilir ki, AI gerçek rəqəmlərlə cavab versin.
 */
export async function buildFoodCostContext(): Promise<string> {
  try {
    const now = new Date();
    const dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dateTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [report, trend, suppliers, products] = await Promise.all([
      getFoodCostReport({ dateFrom, dateTo }),
      getMonthlyTrend(3),
      getSupplierComparison({ dateFrom, dateTo }),
      getTopProducts({ dateFrom, dateTo }, 5),
    ]);

    if (!report || report.invoiceCount === 0) {
      return 'FATURA VERİSİ: Bu istifadəçinin hələ təsdiqlənmiş faturası yoxdur. Onu fatura yükləməyə yönləndir: /dashboard/faturalar';
    }

    const fmt = (q: number) => (q / 100).toFixed(2);
    const monthNames = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    const currentMonth = monthNames[now.getMonth() + 1] ?? '';

    let ctx = `\nREAL FATURA VERİSİ (${currentMonth} ${now.getFullYear()}):\n`;
    ctx += `Ümumi xərc: ${fmt(report.grandTotal)} AZN (${report.invoiceCount} təsdiqlənmiş fatura)\n`;

    // Kateqoriya dağılımı
    ctx += '\nKateqoriya dağılımı:\n';
    for (const cat of report.categories.slice(0, 8)) {
      ctx += `- ${cat.categoryName}: ${fmt(cat.totalAmount)} AZN (${cat.percentage}%, ${cat.itemCount} məhsul)\n`;
    }

    // Trend
    if (trend.length >= 2) {
      ctx += '\nAylıq trend:\n';
      for (const t of trend) {
        const [, m] = t.month.split('-');
        const mName = monthNames[Number(m)] ?? t.month;
        ctx += `- ${mName}: ${fmt(t.totalAmount)} AZN (${t.invoiceCount} fatura)\n`;
      }
      const prev = trend[trend.length - 2];
      const curr = trend[trend.length - 1];
      if (prev && curr && prev.totalAmount > 0) {
        const change = Math.round(((curr.totalAmount - prev.totalAmount) / prev.totalAmount) * 100);
        ctx += `Dəyişim: ${change >= 0 ? '+' : ''}${change}%\n`;
      }
    }

    // Top tədarükçülər
    if (suppliers.length > 0) {
      ctx += '\nƏn çox xərc edilən tədarükçülər:\n';
      for (const s of suppliers.slice(0, 5)) {
        ctx += `- ${s.supplierName}: ${fmt(s.totalAmount)} AZN (${s.invoiceCount} fatura, ort. ${fmt(s.avgAmount)} AZN)\n`;
      }
    }

    // Top məhsullar
    if (products.length > 0) {
      ctx += '\nƏn bahalı məhsullar:\n';
      for (const p of products) {
        ctx += `- ${p.name}: ${p.totalQuantity} ${p.unit}, ${fmt(p.totalAmount)} AZN (ort. ${fmt(p.avgUnitPrice)} AZN/${p.unit})\n`;
      }
    }

    ctx += '\nBu real veridirl — istifadəçiyə dəqiq rəqəmlərlə cavab ver. Food cost panelini göstər: [Food Cost Analiz](/dashboard/food-cost)\n';

    return ctx;
  } catch {
    return 'FATURA VERİSİ: Verilənlər bazası əlçatmazdır. İstifadəçini food cost alətinə yönləndir: [Food Cost hesabla](/toolkit/food-cost)';
  }
}

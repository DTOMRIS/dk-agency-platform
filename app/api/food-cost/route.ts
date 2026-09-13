import { NextRequest, NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/api/guards';
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceeded,
  RATE_LIMITS,
} from '@/lib/utils/rate-limit';
import {
  getFoodCostReport,
  getMonthlyTrend,
  getSupplierComparison,
  getTopProducts,
  lookupProductPrices,
} from '@/lib/repositories/invoiceRepository';

/**
 * TASK-0439 — bu route iki fərqli auditoriyaya xidmət edir, ona görə qorunma
 * route səviyyəsində yox, ƏMƏLİYYAT səviyyəsindədir:
 *
 *  - `lookup`  → açıq `/toolkit/food-cost` alətindən çağırılır (pulsuz alət,
 *                giriş tələb etmir). Açıq qalır, IP üzrə rate-limit ilə.
 *  - qalanı    → `report`/`trend`/`suppliers`/`products`/`all` real faktura,
 *                təchizatçı və məbləğ datasını qaytarır. Bunlar əvvəllər
 *                qorunmasız idi, yəni şirkətin alış datası internetə açıq idi.
 *                İndi admin tələb olunur.
 *
 * Bütün route-a admin qoymaq açıq aləti sındırardı; heç nə qoymamaq datanı
 * açıq saxlayırdı — ona görə ayırma məhz burada aparılır.
 */
const PUBLIC_TYPES = new Set(['lookup']);

// GET /api/food-cost?dateFrom=2026-04-01&dateTo=2026-04-30&branchId=1&type=report|trend|suppliers|products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') ?? 'report';

    if (PUBLIC_TYPES.has(type)) {
      const limit = checkRateLimit(
        `food-cost-lookup:${getClientIp(request)}`,
        RATE_LIMITS.foodCostLookup
      );
      if (!limit.success) return rateLimitExceeded(limit);
    } else {
      const guard = await requireApiAdmin();
      if (!guard.ok) return guard.response;
    }

    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const branchId = searchParams.get('branchId')
      ? Number(searchParams.get('branchId'))
      : undefined;
    const userId = searchParams.get('userId') ? Number(searchParams.get('userId')) : undefined;

    const filters = { dateFrom, dateTo, branchId, userId };

    switch (type) {
      case 'report': {
        const report = await getFoodCostReport(filters);
        if (!report) {
          return NextResponse.json({ data: null, mock: true }, { status: 200 });
        }
        return NextResponse.json({ data: report }, { status: 200 });
      }

      case 'trend': {
        const months = Number(searchParams.get('months') ?? '6');
        const trend = await getMonthlyTrend(months, filters);
        return NextResponse.json({ data: trend }, { status: 200 });
      }

      case 'suppliers': {
        const suppliers = await getSupplierComparison(filters);
        return NextResponse.json({ data: suppliers }, { status: 200 });
      }

      case 'products': {
        const limit = Number(searchParams.get('limit') ?? '20');
        const products = await getTopProducts(filters, limit);
        return NextResponse.json({ data: products }, { status: 200 });
      }

      case 'all': {
        const months = Number(searchParams.get('months') ?? '6');
        const [report, trend, suppliers, products] = await Promise.all([
          getFoodCostReport(filters),
          getMonthlyTrend(months, filters),
          getSupplierComparison(filters),
          getTopProducts(filters, 10),
        ]);
        return NextResponse.json(
          {
            data: { report, trend, suppliers, products },
          },
          { status: 200 }
        );
      }

      case 'lookup': {
        const q = searchParams.get('q') ?? undefined;
        const limit = Number(searchParams.get('limit') ?? '20');
        const prices = await lookupProductPrices(q, limit);
        return NextResponse.json({ data: prices }, { status: 200 });
      }

      default:
        return NextResponse.json({ error: 'Tanınmayan tip: ' + type }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Food cost sorğusu uğursuz oldu.', details: String(error) },
      { status: 500 }
    );
  }
}

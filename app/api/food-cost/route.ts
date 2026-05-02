import { NextRequest, NextResponse } from 'next/server';
import {
  getFoodCostReport,
  getMonthlyTrend,
  getSupplierComparison,
  getTopProducts,
  lookupProductPrices,
} from '@/lib/repositories/invoiceRepository';

// GET /api/food-cost?dateFrom=2026-04-01&dateTo=2026-04-30&branchId=1&type=report|trend|suppliers|products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') ?? 'report';
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const branchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : undefined;
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
        return NextResponse.json({
          data: { report, trend, suppliers, products },
        }, { status: 200 });
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
      { status: 500 },
    );
  }
}

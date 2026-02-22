import { NextRequest } from 'next/server';
import { GET as getFeed } from '../route';

export function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  return context.params.then(({ locale }) => {
    const clone = request.nextUrl.clone();
    clone.searchParams.set('locale', locale);
    const nextRequest = new NextRequest(clone);
    return getFeed(nextRequest);
  });
}

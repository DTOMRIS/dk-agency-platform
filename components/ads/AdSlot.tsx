import { getActiveAdsByPlacement } from '@/lib/repositories/adsRepository';
import AdView from './AdView';

// Server component. Fetches active ads for a placement and renders one.
// Returns null when there is no active ad — pages must tolerate that.
export default async function AdSlot({
  placement,
  className,
}: {
  placement: string;
  className?: string;
}) {
  // Repository already randomizes order server-side, so picking the first
  // active ad rotates per request without an impure call during render.
  const ads = await getActiveAdsByPlacement(placement);
  if (ads.length === 0) return null;

  return <AdView ad={ads[0]} className={className} />;
}

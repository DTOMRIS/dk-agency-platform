/**
 * @file social-scraper.ts
 * @purpose Instagram/Facebook public məlumat çıxarma (API-sız, HTML parse)
 */

export interface SocialInfo {
  platform: 'instagram' | 'facebook';
  url: string;
  available: boolean;
  followers?: number;
  posts?: number;
  lastActivity?: string;
  error?: string;
}

export async function fetchInstagramPublic(url: string): Promise<SocialInfo> {
  if (!url || !url.includes('instagram.com')) {
    return { platform: 'instagram', url, available: false, error: 'Etibarsız Instagram linki' };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'az,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return { platform: 'instagram', url, available: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();

    // Meta tag-lardan follower sayı çıxarmaq cəhdi
    const descMatch = html.match(/<meta[^>]*content="([\d,.]+[KMB]?) Followers/i);
    const followersStr = descMatch?.[1];

    let followers: number | undefined;
    if (followersStr) {
      followers = parseCount(followersStr);
    }

    return {
      platform: 'instagram',
      url,
      available: true,
      followers,
    };
  } catch (err) {
    return { platform: 'instagram', url, available: false, error: String(err) };
  }
}

export async function fetchFacebookPublic(url: string): Promise<SocialInfo> {
  if (!url || !url.includes('facebook.com')) {
    return { platform: 'facebook', url, available: false, error: 'Etibarsız Facebook linki' };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return { platform: 'facebook', url, available: false, error: `HTTP ${res.status}` };
    }

    return {
      platform: 'facebook',
      url,
      available: true,
    };
  } catch (err) {
    return { platform: 'facebook', url, available: false, error: String(err) };
  }
}

function parseCount(str: string): number {
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  if (cleaned.endsWith('K')) return Math.round(num * 1000);
  if (cleaned.endsWith('M')) return Math.round(num * 1000000);
  if (cleaned.endsWith('B')) return Math.round(num * 1000000000);
  return Math.round(num);
}

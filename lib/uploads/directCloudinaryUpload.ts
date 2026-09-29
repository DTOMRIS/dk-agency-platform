/**
 * Brauzerdən birbaşa Cloudinary-yə şəkil yükləmə (TASK-0460).
 *
 * Axın: `/api/upload/sign` (admin, imza) → XHR ilə `api.cloudinary.com`-a birbaşa
 * (irəliləyiş faizi ilə). Fayl Hostinger-dən keçmir, Cloudinary yükləmədə çevirmə
 * etmir — ölçü/format/keyfiyyət göstərmə URL-ində (`deliveryUrl`) tətbiq olunur,
 * ilk baxışda bir dəfə hesablanıb CDN-də saxlanır.
 */

export interface DirectUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
}

interface SignResponse {
  ok?: boolean;
  cloudName?: string;
  apiKey?: string;
  folder?: string;
  timestamp?: number;
  signature?: string;
  error?: string;
}

/** Əvvəlki yükləmə çevirməsi ilə eyni nəticə: maks. 1400px, avtomatik keyfiyyət və format (webp/avif) */
export const COVER_DELIVERY_TRANSFORM = 'f_auto,q_auto,c_limit,w_1400';

/** `.../image/upload/v123/x.jpg` → `.../image/upload/<transform>/v123/x.jpg` */
export function deliveryUrl(secureUrl: string, transform = COVER_DELIVERY_TRANSFORM): string {
  const marker = '/image/upload/';
  const i = secureUrl.indexOf(marker);
  if (i === -1) return secureUrl;
  const rest = secureUrl.slice(i + marker.length);
  if (rest.startsWith(`${transform}/`)) return secureUrl;
  return `${secureUrl.slice(0, i + marker.length)}${transform}/${rest}`;
}

export async function uploadImageDirect(
  file: File,
  options: { folder: string; onProgress?: (percent: number) => void; timeoutMs?: number }
): Promise<DirectUploadResult> {
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ folder: options.folder }),
  });
  const sign = (await signRes.json().catch(() => ({}))) as SignResponse;
  if (
    !signRes.ok ||
    !sign.ok ||
    !sign.cloudName ||
    !sign.apiKey ||
    !sign.signature ||
    !sign.timestamp
  ) {
    throw new Error(sign.error || `İmza alınmadı (${signRes.status})`);
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder ?? options.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sign.cloudName)}/image/upload`;

  return new Promise<DirectUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.timeout = options.timeoutMs ?? 120_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      let data: {
        secure_url?: string;
        public_id?: string;
        width?: number;
        height?: number;
        bytes?: number;
        error?: { message?: string };
      } = {};
      try {
        data = JSON.parse(xhr.responseText) as typeof data;
      } catch {
        /* cavab JSON deyil — aşağıda xəta */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url && data.public_id) {
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width ?? 0,
          height: data.height ?? 0,
          bytes: data.bytes ?? file.size,
        });
      } else {
        reject(new Error(data.error?.message || `Cloudinary cavabı ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Cloudinary-yə qoşulmaq alınmadı'));
    xhr.ontimeout = () => reject(new Error('Yükləmə vaxtı bitdi'));
    xhr.send(form);
  });
}

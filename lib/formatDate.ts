/**
 * Deterministic date format — server və client eyni nəticə verir.
 * toLocaleDateString() hydration mismatch yaradır (server vs client locale fərqi).
 */
const MONTHS_AZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

export function formatDateAz(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS_AZ[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

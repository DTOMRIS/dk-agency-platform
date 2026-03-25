/**
 * Deterministic date format — server və client eyni nəticə verir.
 * toLocaleDateString() hydration mismatch yaradır (server vs client locale fərqi).
 */
const MONTHS_AZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

export function formatDateAz(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS_AZ[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
